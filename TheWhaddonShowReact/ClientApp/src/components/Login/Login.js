import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addUpdates } from '../../actions/localServer'
import { UnauthenticatedTemplate, AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest, msalConfig } from '../../authConfig';

//Components
import { Button, Modal } from 'reactstrap'
import { Icon } from '../../components/Icons/Icons';
import DataLoading from '../../components/DataLoading/DataLoading';
import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'

//utils
import { isScreenSmallerThan } from '../../core/screenHelper';
import { PERSON } from '../../dataAccess/localServerModels';
import { getLatest, prepareUpdate } from '../../dataAccess/localServerUtils.js';
import { login } from '../../actions/user';
import { trigger, UPDATE_VIEW_AS_PART_PERSON } from '../../actions/scriptEditor';
import { log, LOGIN as logType } from '../../dataAccess/logging.js';
import classnames from 'classnames';
import { clearStateFromBrowserStorage } from '../../dataAccess/browserStorage'
//css
import s from './Login.module.scss'

//constants
import { DEMOID, DEMO_VIEW_AS_PERSONID, DEMOPassword, REHEARSALID, signOutAllUsers } from '../../dataAccess/userAccess'
function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { instance, accounts } = useMsal();

    const [smallScreen, setSmallScreen] = useState(null)
    const syncInfo = useSelector(state => state.localServer.persons.sync)
    const personHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personHistory, true)
    const authenticatedUser = useSelector(state => state.user.authenticatedUser)
    const demoViewAsPerson = persons.find(person => person.id === DEMO_VIEW_AS_PERSONID)

    const location = useLocation();

    const isDemoLink = (location.pathname === '/app/demo') ? true : false


    const [welcomeBlockState, setWelcomeBlockState] = useState('fallen') //hung, toppling,falling,hidden
    const [curtainState, setCurtainState] = useState('closed') //open,closed
    const [hideAll, setHideAll] = useState(false)
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

    log(logType, 'props', { welcomeBlockState, curtainState, authenticatedUser, syncInfo, })

    useEffect(() => {

        if (authenticatedUser) {
            if (welcomeBlockState === 'fallen') {
                setWelcomeBlockState('hang')
            }
            setTimeout(() => {
                setWelcomeBlockState('topple')
            }, 2000)
            setTimeout(() => {
                setWelcomeBlockState('fall')
            }, 4500)
            setTimeout(() => {
                setCurtainState('open')
            }, 5500)
            setTimeout(() => {
                setHideAll(true)
            }, 7000)
        }

        if (!authenticatedUser) {

            setHideAll(false)
            setWelcomeBlockState('fallen')

            if (curtainState !== 'closed') {
                setCurtainState('opened')
                setTimeout(() => {
                    setCurtainState('closing')
                }, 1500)
                setTimeout(() => {
                    setWelcomeBlockState('hang')
                }, 3500)
            } else {
                setTimeout(() => {
                    setWelcomeBlockState('hang')
                }, 1500)
            }
            //setTimeout(() => {
            //    setWelcomeBlockState('hung')
            //},5000)

        }

    }, [authenticatedUser]) //eslint-disable-line react-hooks/exhaustive-deps



    useEffect(() => {

        const handleHomeResize = () => {

            if (isScreenSmallerThan('md')) {
                setSmallScreen(true)
            } else {
                setSmallScreen(false)
            }

        }

        handleHomeResize()

        findAndLoginUser()

        window.addEventListener('resize', handleHomeResize)

        return () => window.removeEventListener('resize', handleHomeResize)

    }, []) //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        findAndLoginUser()

    }, [instance, accounts]) //eslint-disable-line react-hooks/exhaustive-deps


    const findAndLoginUser = async () => {

        instance.handleRedirectPromise().then(response => { //eslint-disable-line no-unused-vars

            if (accounts.length > 0) {
                const signedInAccount = accounts[0]; // Assuming there is only one signed-in account
                const linkedUser = getLinkedUser()
                log(logType, 'useEffect[instance,account]', { signedInAccount, linkedUser })
                // Get the user's email from the account details
                const subject = signedInAccount.idTokenClaims.sub;// assuming only one email per account
                log(logType, 'Authentication successful', { subject, linkedUser });

                if (!subject) { throw new Error('No subject found in account details') }

                let user;
                if (linkedUser) {
                    user = linkedUser
                    const personUpdate = prepareUpdate({ ...user, msalLink: subject })
                    dispatch(addUpdates(personUpdate, PERSON))
                } else {
                    user = persons.find(person => person.msalLink === subject)
                }

                if (!user) {
                    throw new Error(`Failed to match subject with existing user.`)
                }
                log(logType, 'useEffect[instance,account]', { user })
                dispatch(login(user))
                const viewAsPerson = (user.id === DEMOID) ? demoViewAsPerson : user
                dispatch(trigger(UPDATE_VIEW_AS_PART_PERSON, { partPerson: viewAsPerson }))
                navigate('/app/home', { replace: true })
            }
        }).catch(error => { log(logType, 'Authentication error: ' + error) })
    }


    const getLinkedUser = () => {
        const searchParams = new URLSearchParams(location.search);
        const linkId = (location.pathname === '/app/loginlink') ? searchParams.get('id') : null;

        const linkedUser = persons.find(person => person.id === linkId)

        if (location.pathname === '/app/loginlink' && (linkedUser === null || linkedUser === undefined)) {
            log(logType, 'refreshLinkUser navigate to home')
            navigate('/app/home', { replace: true })
        }

        log(logType, 'useEffect[]', { linkId, linkedUser })
        return linkedUser
    }




    const handleLogin = async (type = 'default') => {

        const loginParams = {
            ...loginRequest,
            redirectUri: msalConfig.redirectUri,
        }
        if (type === 'demo') {
            loginParams.loginHint = 'demo@thewhaddonentertainers.onmicrosoft.com';
        }

        try { //attempt popup login first
            console.log('handleLogin', loginParams)
            await instance.loginPopup(loginParams)
        } catch (popupError) { //fall back to redirect if fails
            console.warn('Popup authentication failed. Redirecting...', popupError);
            try {
                // Fallback to redirect-based authentication
                await instance.loginRedirect(loginParams);
            } catch (redirectError) {
                log(logType, 'Redirect authentication failed.', redirectError);
                alert('Authentication failed. Please check your internet connection and try again.');
            }
        }
    };

    const doReset = () => {
        signOutAllUsers(instance)
        clearStateFromBrowserStorage(dispatch)
    }

    const loginRehearsal = () => {
        const rehearsal = persons.find(person => person.id === REHEARSALID)
        if (rehearsal) {
            dispatch(login(rehearsal))
            dispatch(trigger(UPDATE_VIEW_AS_PART_PERSON, { partPerson: null }))
        }
    }

    const loginDemo = async () => {
        toggleDemoModal()
        try {
            await navigator.clipboard.writeText(DEMOPassword)
        } catch (error) {
            console.error('Failed to copy to clipboard', error)
            alert(`Failed to copy to cliboard. Sorry you'll have to remember the password "${DEMOPassword}" yourself.`)
        }
        handleLogin('demo');
    }


    const toggleDemoModal = () => {
        setIsDemoModalOpen(!isDemoModalOpen)
    }
    const isLoading = syncInfo.isSyncing && (!persons || persons?.length === 0)
    const isErrorSyncing = syncInfo.error && (!persons || persons?.length === 0)


    //handle redirection of login link if the link has already been processed or doesn't matching existing person


    if (hideAll) return null;


    return (
        <>
            <div className={s.loginContainer}>
                <div className={classnames(s.leftCurtain, s[curtainState])}>
                </div>
                <div className={classnames(s.rightCurtain, s[curtainState])}>
                </div>
                <div className={s.content}>
                    <DataLoading isLoading={isLoading}
                        isError={isErrorSyncing}
                        errorText={`Error loading intitial user data. Needs internet access. The app will keep retrying but if problem continues and you have internet access contact Mark (magcarter@hotmail.co.uk)`}
                        spinnerSize={50}
                        style={{ zIndex: 10 }}                >
                        <div className={classnames(s.welcomeBlock, s[welcomeBlockState])}>
                            <div className={s.loginWelcome}>
                                <div className={s.loginImage}>
                                    <h3 className={s.welcomeTo}>Welcome to the...</h3>
                                    <img src={smallScreen ? TheWhaddonShowHomeWide : TheWhaddonShowHomeWide}
                                        alt='The Whaddon Show Title with slightly shambolic, singing Cowboy playing the guitar.'
                                        width={smallScreen ? '300px' : '500px'} />
                                    <h3 className={s.app}>...app.</h3>
                                </div>

                            </div>

                            <div className={s.description}>Collaboratively write scripts, manage casting, and organise the show.</div>
                            <div className={s.joke}>(in a less shambolic way than before!)</div>

                            <UnauthenticatedTemplate>
                                <div className={s.login}>
                                    <h3>Please Login:</h3>
                                    <div className={s.loginButtons}>
                                        <Button color='primary' onClick={handleLogin}>Cast & Crew</Button>
                                        {!isDemoLink && <Button color='primary' onClick={loginRehearsal}>Rehearsal</Button>}
                                        {isDemoLink && <Button color='primary' onClick={toggleDemoModal}>Demo</Button>}
                                    </div>

                                </div>
                            </UnauthenticatedTemplate>
                            <AuthenticatedTemplate>
                                {!authenticatedUser &&
                                    <div className={`${s['notRegisteredBlock']}`}>
                                        <h5>Not Registered.</h5>
                                        <p>Are you logged in on a different account?</p>
                                        <p>{`If it's your first time please use login link sent from `}<a href="mailto:magcarter@hotmail.co.uk">Mark</a>.</p>
                                        <p>Otherwise try resetting the app below:</p>
                                        <Button color='primary' onClick={doReset}>Reset</Button>
                                    </div>
                                }
                                {authenticatedUser &&
                                    <div className={s.login}>
                                        <h3>Authenticated!</h3>
                                        <div className={s.loginTick}>
                                            <Icon icon="tick" strapColor="success" />
                                        </div>
                                    </div>
                                }
                            </AuthenticatedTemplate>
                        </div>
                        <AuthenticatedTemplate>

                        </AuthenticatedTemplate>

                    </DataLoading >
                </div>
            </div >
            <Modal isOpen={isDemoModalOpen} toggle={toggleDemoModal}>
                <div className={s.demoModal}>
                    <h3>Demo Account</h3>
                    <div className={s.demoMessage}>
                        <h5>Account</h5>
                        <div>The demo account allows you to fuly interact fully with The Whaddon Show App without saving to the Server.</div>
                        <p><strong>Feel free to play about with script, recast people, and interact with the app! The show will not be affected nor will anyone else see your work!</strong></p>
                    </div>
                    <div className={s.demoCredentials}>
                        <h5>Account Credentials:</h5>
                        <div>Username: (prepopulated) <strong>demo@thewhaddonentertainers.onmicrosoft.com</strong> </div>
                        <div>Password: (click to copy) <strong>TheWhadd0nSh0w</strong> </div>
                        <Button color='primary' onClick={() => loginDemo()}>Copy Password and Go to Login</Button>
                    </div>
                </div>
            </Modal>
        </>

    )

}

export default Login