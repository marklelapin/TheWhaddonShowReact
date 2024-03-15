import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import whaddonShowCowboy from '../../images/whaddon-show-logo.png'
import { isDemoUser } from '../../dataAccess/userAccess';
import s from './CowboyAlert.module.scss';
import classnames from 'classnames';
import { acknowledgeUserMessage } from '../../actions/user';


const CowboyAlert = (props) => {

    const dispatch = useDispatch();


    const { demoOnly = true, children, messageId } = props;
    console.log('demoOnly', demoOnly)

    const authenticatedUser = useSelector(state => state.user.authenticatedUser)
    const acknowledgedMessages = useSelector(state => state.user.acknowledgedMessages) || [];
   
    const isDemo = isDemoUser(authenticatedUser)

    const isAcknowledged = acknowledgedMessages.some(entry => entry.user.id === authenticatedUser.id && entry.messageId === messageId) 
    console.log('acknowledgedMessages', acknowledgedMessages)
    console.log('isAcknowledged', isAcknowledged)
    const [status, setStatus] = useState('readyToComeOn')

    useEffect(() => {
        const popupTimer = setTimeout(() => {
            setStatus('visible')
        }
            , 0);

        return () => {
            clearTimeout(popupTimer);
            document.removeEventListener('click', dismissCowboy)
        }
    }, [])

    useEffect(() => {
        let timer
        if (status === 'hidden') {
            timer = setTimeout(() => {
                setStatus('removed')
                dispatch(acknowledgeUserMessage(authenticatedUser, messageId))
            }, 5000);
        }

        return () => clearTimeout(timer);

    }), [status]

    const dismissCowboy = () => {
        setTimeout(() => {
            setStatus('hidden')
        }, 1500)
    };

    const hideMessage = () => {
        setStatus('hidden')
       
    }

    console.log('isDemo', isDemo)
    if (demoOnly && !isDemo) return null;
    if (isAcknowledged) return null;
    return (
        <div className={classnames(s.curtainContainer, s[status])} onClick={() => hideMessage() }>
            <div className={classnames(s.curtain,s[status])} />
            <div className={classnames(s.container, s[status], 'clickable')} onClick={() => hideMessage()}>
                <div className={classnames(s.speechBubble, s.black)} >
                    {children}

                    <div className={s.dismiss}>
                        (click to dismiss)
                    </div>
                    < div className={s.whaddonShowCowboy}>
                        <img src={whaddonShowCowboy} alt="The Whaddon Show Cowboy shouting into a speech bubble." className={s.logo} />
                    </div>
                </div>


            </div >

        </div>


    )
}

export default CowboyAlert;