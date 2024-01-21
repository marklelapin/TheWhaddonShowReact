import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { addUpdates } from '../../actions/localServer'
import { UnauthenticatedTemplate, AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest, msalConfig } from '../../authConfig';

//Components
import { Button } from 'reactstrap'
import DataLoading from '../../components/DataLoading/DataLoading';
import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'
import TheWhaddonShowHomeThin from '../../images/TheWhaddonShowHomeThin.png'

//utils
import { isScreenSmallerThan } from '../../core/screenHelper';
import { PERSON } from '../../dataAccess/localServerModels';
import { getLatest, prepareUpdate } from '../../dataAccess/localServerUtils.js';
import { login, logout } from '../../actions/user';
import { log, LOGIN as logType } from '../../dataAccess/logging.js';

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

    const [fakeAuthenticated, setFakeAuthenticated] = useState(false)

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
                navigate('/app/home', { replace: true })
            }
        }).catch(error => { log(logType, 'Authentication error: ' + error) })
    }


    const getLinkedUser = () => {
        const searchParams = new URLSearchParams(location.search);
        const linkId = (location.pathname === '/app/loginlink') ? searchParams.get('id') : null;
  
        const linkedUser = persons.find(person => person.id === linkId && (person.msalLink === null || person.msalLink === undefined) )
       
        if (location.pathname === '/app/loginlink' && (linkedUser === null || linkedUser === undefined)) {
            log(logType, 'refreshLinkUser navigate to home')
            navigate('/app/home', {replace: true})
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

    const doLogout = () => {
       signOutAllUsers(instance)
    }

    const loginMark = () => {
        const mark = persons.find(person => person.id === MARKID)
        dispatch(login(mark))
        setFakeAuthenticated(true)

    }

    const loginDemo = () => {
        const demo = persons.find(person => person.id === DEMOID)
        log(logType, 'demo login', { DEMOID, demo, persons })
        dispatch(login(demo))
        setFakeAuthenticated(true)
    }

    const loginUnknownPerson = () => {
        dispatch(logout())
        setFakeAuthenticated(true)
    }

    const isLoading = syncInfo.isSyncing && (!persons || persons?.length === 0)
    const isErrorSyncing = syncInfo.error && (!persons || persons?.length === 0)


    //handle redirection of login link if the link has already been processed or doesn't matching existing person



    return (
        <>
            <div className={`${s['login-curtain']} ${authenticatedUser ? s['open'] : s['closed']}`}>
                <DataLoading isLoading={isLoading}
                    isError={isErrorSyncing}
                    errorText={`Error loading intitial user data. Needs internet access. The app will keep retrying but if problem continues and you have internet access contact Mark (magcarter@hotmail.co.uk)`}
                    spinnerSize={50}>

                    {!fakeAuthenticated && !authenticatedUser &&
                        < UnauthenticatedTemplate>
                            <div className={`${s['welcome-block']}`}>
                                <h2>Welcome to the...</h2>
                                <div className={`${s['login-image']}`}>
                                    <img src={smallScreen ? TheWhaddonShowHomeThin : TheWhaddonShowHomeWide}
                                        alt='The Whaddon Show Title with slightly shambolic, singing Cowboy playing the guitar.'
                                        width={smallScreen ? '300px' : '500px'} />
                                </div>
                                <h2>...app.</h2>
                                <h5 className={`${s['description']}`}>Collaboratively write scripts, manage casting, and organise the show.</h5>
                                <p>(in a less shambolic way than before!)</p>

                                <div className={`${s['login']}`}>
                                    <h3>Please Login:</h3>
                                    <Button color='primary' onClick={handleLogin}>Cast & Crew</Button>
                                    <Button color='primary' onClick={loginMark}>Demo Account</Button>
                                </div>
                            </div>
                        </UnauthenticatedTemplate>}
                    <AuthenticatedTemplate>
                        {!authenticatedUser &&//<AuthenticatedTemplate>
                            <div className={`${s['not-registered-block']}`}>
                                <h4>Hi!</h4>
                                <h4>You have successfully logged in but are not yet a registered user.</h4>
                                <h4>Please use the login link sent to you or get a new one from <a href="mailto:magcarter@hotmail.co.uk">Mark</a></h4>
                                <h4>Thanks!</h4>
                                <Button color='primary' onClick={doLogout}>Back To Login</Button>
                            </div>
                        }
                    </AuthenticatedTemplate>

                </DataLoading>
            </div>
        </>

    )

}

export default Login