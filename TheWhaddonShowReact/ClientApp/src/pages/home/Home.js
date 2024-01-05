import React, { useState, useEffect } from 'react';

import { Button } from 'reactstrap'

import TheWhaddonShowHomeWide from '../../images/TheWhaddonShowHomeWide.png'
import TheWhaddonShowHomeThin from '../../images/TheWhaddonShowHomeThin.png'
import { isScreenSmallerThan } from '../../core/screenHelper'

import s from './Home.module.scss'
function Home() {

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

        window.addEventListener('resize',handleHomeResize)

        return () => window.removeEventListener('resize',handleHomeResize)

    },[])


    return (
        <div className={`${s['home-page']}`}>
            <div className={`${s['welcome-block']}`}>
                <h2>Welcome to the...</h2>
                <div className={`${s['home-image']}`}>
                    <img src={smallScreen ? TheWhaddonShowHomeThin : TheWhaddonShowHomeWide}
                        alt='The Whaddon Show Title with slightly shambolic, singing Cowboy playing the guitar.'
                        width={smallScreen ? '300px' : '500px'} />
                </div>
                <h2>...app.</h2>
                <h5 className={`${s['description']}`}>Collaboratively write scripts, manage casting, and organise the show.</h5>
                <p>(in a less shambolic way than before!)</p>

                <div className={`${s['login']}`}>
                    <h3>Please Login:</h3>
                    <Button color='primary'>Cast & Crew</Button>
                    <Button color='primary' >Demo Account</Button>
                </div>

            </div>





        </div>

    )

}

export default Home;