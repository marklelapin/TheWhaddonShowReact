import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';


import { UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';

//Components
import { Button } from 'reactstrap'
import DataLoading from '../../components/DataLoading/DataLoading';
import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'
import TheWhaddonShowHomeThin from '../../images/TheWhaddonShowHomeThin.png'

//utils
import { isScreenSmallerThan } from '../../core/screenHelper'
import { getLatest } from '../../dataAccess/localServerUtils.js'
import { login, logout } from '../../actions/user'
import { log, LOGIN as logType } from '../../logging.js'

//css
import s from './Login.module.scss'

//constants
import { MARKID } from '../../dataAccess/userAccess'
function Login() {
    const dispatch = useDispatch();

    const { instance } = useMsal();

    const [smallScreen, setSmallScreen] = useState(null)
    const syncInfo = useSelector(state => state.localServer.persons.sync)
    const personHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personHistory)
    const authenticatedUser = useSelector(state => state.user.authenticatedUser)

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

        window.addEventListener('resize', handleHomeResize)

        return () => window.removeEventListener('resize', handleHomeResize)

    }, [])

    const handleLoginPopup = () => {
        instance
            .loginPopup({
                ...loginRequest,
                redirectUri: '/redirect',
            })
            .catch((error) => console.log(error));
    };

    const doLogout = () => {
        dispatch(logout())
        setFakeAuthenticated(false)
    }

    const loginMark = () => {
        const mark = persons.find(person => person.id === MARKID)
        dispatch(login(mark))
        setFakeAuthenticated(true)
    }

    const loginUnknownPerson = () => {
        dispatch(logout())
        setFakeAuthenticated(true)
    }

    const isLoading = syncInfo.isSyncing && (!persons || persons?.length === 0)
    const isErrorSyncing = syncInfo.error && (!persons || persons?.length === 0)

    return (
        <>
            <div className={`${s['login-curtain']} ${authenticatedUser ? s['open'] : s['closed']}`}>
                <DataLoading isLoading={isLoading}
                    isError={isErrorSyncing}
                    errorText='Error loading intitial user data. Needs internet access. Will keep retrying but if problem continues contact Mark (magcarter@hotmail.co.uk)'
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
                                    <Button color='primary' onClick={loginMark}>Cast & Crew</Button>
                                    <Button color='primary' onClick={loginUnknownPerson}>Demo Account</Button>
                                </div>
                            </div>
                        </UnauthenticatedTemplate>}
                    {fakeAuthenticated && !authenticatedUser &&//<AuthenticatedTemplate>
                        <div className={`${s['not-registered-block']}`}>
                            <h4>Hi!</h4>
                            <h4>You have successfully logged in but are not yet a registered user.</h4>
                            <h4>Please send a request to become registered to <a href="mailto:magcarter@hotmail.co.uk">Mark</a> with the email address you logged in under.</h4>
                            <h4>Thanks!</h4>
                            <Button color='primary' onClick={doLogout}>Back To Login</Button>
                            </div>
                    }
                </DataLoading>
            </div>
        </>

    )

}

export default Login