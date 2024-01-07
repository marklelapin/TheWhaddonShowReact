import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';

import { UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';


import { Button } from 'reactstrap'

import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'
import TheWhaddonShowHomeThin from '../../images/TheWhaddonShowHomeThin.png'
import { isScreenSmallerThan } from '../../core/screenHelper'

import {log, LOGIN as logType } from '../../logging.js'
import s from './Login.module.scss'
function Login () {

    log(logType,'props')

    const { instance } = useMsal();

    const [smallScreen, setSmallScreen] = useState(null)

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

    return (
        <>
            <UnauthenticatedTemplate>
                <div className={`${s['login-page']}`}>
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
                            <Button color='primary' onClick={handleLoginPopup}>Cast & Crew</Button>
                            <Button color='primary' onClick={handleLoginPopup}>Demo Account</Button>
                        </div>

                    </div>
                </div>

            </UnauthenticatedTemplate>
            <div className={`${s['login-curtain']}`}>
            hello
            </div>
        </>

    )

}

export default withRouter(Login)