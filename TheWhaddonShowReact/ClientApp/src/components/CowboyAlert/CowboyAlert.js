import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import whaddonShowCowboy from '../../images/whaddon-show-logo.png'
import { isDemoUser } from '../../dataAccess/userAccess';
import s from './CowboyAlert.module.scss';
import classnames from 'classnames';


const CowboyAlert = (props) => {

    //const dispatch = useDispatch();


    const { demoOnly = true, children } = props;
    console.log('demoOnly', demoOnly)

    const authenticatedUser = useSelector(state => state.user.authenticatedUser)
    console.log(authenticatedUser)
    const isDemo = isDemoUser(authenticatedUser)

    const [position, setPosition] = useState('readyToComeOn')



    useEffect(() => {
        const popupTimer = setTimeout(() => {
            setPosition('visible')
        }
            , 1000);



        return () => {
            clearTimeout(popupTimer);
            document.removeEventListener('click', dismissCowboy)
        }
    }, [])

    useEffect(() => {
        let timer
        if (position === 'hidden') {
            timer = setTimeout(() => {
                setPosition('removed')
            }, 1000);
        }

        return () => clearTimeout(timer);

    }), [position]

    const dismissCowboy = () => {
        setTimeout(() => {
            setPosition('hidden')
        }, 1500)
    };

    const hideMessage = () => {
        setPosition('hidden')
    }

    console.log('isDemo', isDemo)
    if (demoOnly && !isDemo) return null;

    return (

        <div className={classnames(s.container, s[position], 'clickable')} onClick={() => hideMessage()}>
            <div className={classnames(s.speechBubble,s.black)} >
                {children}

                <div className={s.dismiss}>
                    (click to dismiss)
                </div>
                < div className={s.whaddonShowCowboy}>
                    <img src={whaddonShowCowboy} alt="The Whaddon Show Cowboy shouting into a speech bubble." className={s.logo} />
                </div>
            </div>


        </div >

    )
}

export default CowboyAlert;