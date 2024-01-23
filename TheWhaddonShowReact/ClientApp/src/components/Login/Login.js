﻿import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addUpdates } from '../../actions/localServer'
import { UnauthenticatedTemplate, AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest, msalConfig } from '../../authConfig';

//Components
import { Button } from 'reactstrap'
import { Icon } from '../../components/Icons/Icons';
import DataLoading from '../../components/DataLoading/DataLoading';
import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'
import TheWhaddonShowHomeThin from '../../images/TheWhaddonShowHomeThin.png'

//utils
import { isScreenSmallerThan } from '../../core/screenHelper';
import { PERSON } from '../../dataAccess/localServerModels';
import { getLatest, prepareUpdate } from '../../dataAccess/localServerUtils.js';
import { login, logout } from '../../actions/user';
import { trigger, UPDATE_VIEW_AS_PART_PERSON } from '../../actions/scriptEditor';
import { log, LOGIN as logType } from '../../dataAccess/logging.js';
import classnames from 'classnames';
import { clearStateFromBrowserStorage } from '../../dataAccess/browserStorage'
//css
import s from './Login.module.scss'

//constants
import { MARKID, DEMOID, signOutAllUsers } from '../../dataAccess/userAccess'

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { instance, accounts } = useMsal();

    const [smallScreen, setSmallScreen] = useState(null)
    const syncInfo = useSelector(state => state.localServer.persons.sync)
    const personHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personHistory, true)
    const authenticatedUser = useSelector(state => state.user.authenticatedUser)

    const location = useLocation();

    const [welcomeBlockState, setWelcomeBlockState] = useState('fallen') //hung, toppling,falling,hidden
    const [curtainState, setCurtainState] = useState('closed') //open,closed
    const [hideAll, setHideAll] = useState(false)

    log(logType, 'props', { welcomeBlockState, curtainState, authenticatedUser, syncInfo, })

    useEffect(() => {

        if (authenticatedUser) {
            setTimeout(() => {
                setWelcomeBlockState('topple')
            }, 1500)
            setTimeout(() => {
                setWelcomeBlockState('fall')
            }, 4000)
            setTimeout(() => {
                setCurtainState('open')
            }, 5000)
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

        }

    }, [authenticatedUser])



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

        instance.handleRedirectPromise().then(response => {

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
                dispatch(trigger(UPDATE_VIEW_AS_PART_PERSON, { partPerson: user }))
                navigate('/app/home', { replace: true })
            }
        }).catch(error => { log(logType, 'Authentication error: ' + error) })
    }


    const getLinkedUser = () => {
        const searchParams = new URLSearchParams(location.search);
        const linkId = (location.pathname === '/app/loginlink') ? searchParams.get('id') : null;

        const linkedUser = persons.find(person => person.id === linkId && (person.msalLink === null || person.msalLink === undefined))

        if (location.pathname === '/app/loginlink' && (linkedUser === null || linkedUser === undefined)) {
            log(logType, 'refreshLinkUser navigate to home')
            navigate('/app/home', { replace: true })
        }

        log(logType, 'useEffect[]', { linkId, linkedUser })
        return linkedUser
    }




    const handleLogin = async () => {
        try { //attempt popup login first
            await instance
                .loginPopup({
                    ...loginRequest,
                    redirectUri: msalConfig.redirectUri,
                })
                .catch((error) => console.log(error));
        } catch (popupError) { //fall back to redirect if fails
            console.warn('Popup authentication failed. Redirecting...', popupError);

            try {
                // Fallback to redirect-based authentication
                await instance.loginRedirect({
                    ...loginRequest,
                    redirectUri: msalConfig.redirectUri,
                });
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

    const loginDemo = () => {
        const demo = persons.find(person => person.id === DEMOID)
        log(logType, 'demo login', { DEMOID, demo, persons })
        dispatch(login(demo))

    }

    const loginUnknownPerson = () => {
        dispatch(logout())

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
                                        <Button color='primary' onClick={loginDemo}>Demo Account</Button>
                                    </div>

                                </div>
                            </UnauthenticatedTemplate>
                            <AuthenticatedTemplate>
                                {!authenticatedUser &&
                                    <div className={`${s['notRegisteredBlock']}`}>
                                        <h4>Not Registered!
                                            <span ><Icon icon='cross' strapColor='danger' /></span>
                                        </h4>
                                        <p>{`If it's your first time logging in please use login link sent to you from `}<a href="mailto:magcarter@hotmail.co.uk">Mark</a>{` or try Resetting App below.`}</p>
                                        <p>Thanks!</p>
                                        <Button color='primary' onClick={doReset}>Reset</Button>
                                    </div>
                                }
                                {authenticatedUser &&
                                    <div className={s.login}>
                                        <h3>Authenticated!</h3><Icon icon="tick" strapColor="success" />
                                    </div>
                                }
                            </AuthenticatedTemplate>
                        </div>
                        <AuthenticatedTemplate>

                        </AuthenticatedTemplate>

                    </DataLoading >
                </div>
            </div >
        </>

    )

}

export default Login