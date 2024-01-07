import React, { useState, useEffect } from 'react';


import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { InteractionStatus } from "@azure/msal-browser";



import { Button } from 'reactstrap'

import { isScreenSmallerThan } from '../../core/screenHelper'

import s from './Home.module.scss'
function Home() {

    const { instance, inProgress } = useMsal();
    const activeAccount = instance?.getActiveAccount();

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



    


    return (
        <>
            <div className={`${s['home-page']}`}>
                Home
            </div>

        </>


    )

}

export default Home;