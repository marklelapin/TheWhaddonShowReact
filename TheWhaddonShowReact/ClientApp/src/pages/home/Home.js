import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom";

import { updatePersonSelectorConfig } from '../../actions/scriptEditor';

//componets
import { Button } from 'reactstrap';
import PersonSelector from '../../pages/scriptEditor/components/PersonSelector';

//images
import whaddonShowCowboy from '../../images/whaddon-show-logo.png'
import scriptPage from '../../images/script.png'
import scriptSummary from '../../images/script-summary.png'
import casting from '../../images/casting.png'
import underConstruction from '../../images/under-construction-500.png'
import users from '../../images/users.png'
import apimonitor from '../../images/api-monitor.png'


//utils
import { REHEARSALID } from '../../dataAccess/userAccess';

import { getLatest } from '../../dataAccess/localServerUtils';
import { getCastWithPartsAndScenes } from '../casting/scripts'
import { log, HOME as logType } from '../../dataAccess/logging';
import classnames from 'classnames';

import s from './Home.module.scss';
import { DEMOID } from '../../dataAccess/userAccess';

function Home() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authenticatedUser = useSelector(state => state.user.authenticatedUser)
    const currentUser = useSelector(state => state.user.currentUser)
    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig)

    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)

    const isMobileDevice = useSelector(state => state.device.isMobileDevice)

    const cowboyShoutOut = useSelector(state => state.settings.cowboyShoutOut)
    const showDates = useSelector(state => state.settings.showDates)

    const isRehearsal = (currentUser?.id === REHEARSALID);
    const isDemo = (authenticatedUser?.id === DEMOID);


    const greetingUser = isRehearsal || isDemo ? viewAsPartPerson : currentUser

    log(logType, 'props', { currentUser, isRehearsal, greetingUser })

    const userPartsAndScenes = (greetingUser) ? getCastWithPartsAndScenes(persons, partPersons, scriptItems).find(item => item.person.id === greetingUser.id) : null

    log(logType, 'userPartsAndScenes', { userPartsAndScenes })

    const totalScenes = userPartsAndScenes?.scenes?.length || 0
    const totalParts = userPartsAndScenes?.parts?.length || 0
    const totalLines = userPartsAndScenes?.lineCount || 0


    const castingText = `You are currently cast in ${totalParts} parts across ${totalScenes} scenes and have ${totalLines} lines to learn!`;

    const weekdayAndTime = (date) => {

        date = new Date(date)
        
        return date.toLocaleString('en-GB', {
            weekday: 'short', // Full day name (e.g., Wednesday)
            hour: 'numeric', // Hour (e.g., 8)
            minute: '2-digit', // Ensure two-digit minutes (e.g., 00)
            hour12: true // Use 12-hour format with AM/PM
        }).replace(':00', ''); 
    }

    const nextRehearsalMessage = cowboyShoutOut.nextRehearsalDate == null ? null : `Next Rehearsal: ${weekdayAndTime(cowboyShoutOut.nextRehearsalDate)}`;

    const daysToGo = () => {
        const now = new Date();
        const openingNight = new Date(showDates.openingNight)
        const diff = (openingNight.getTime() - now.getTime());

        const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

        return diffDays;
    }


    

    const togglePersonSelector = () => {
        if (personSelectorConfig) {
            dispatch(updatePersonSelectorConfig(null))
        } else {
            dispatch(updatePersonSelectorConfig({}))
        }

    }

    const handlePictureClick = (e, path) => {
        e.preventDefault();
        navigate(path)
    }


    return (
        <>
            {!isMobileDevice && <h1>Home</h1>}
            <div className={classnames(s.homeContainer, isMobileDevice ? s.mobile : null)}>
                <div className={classnames(s.greetingContainer, isMobileDevice ? s.mobile : null)}>
                    <div className={s.speechBubble}>
                        <h2 className={s.greeting}>
                            {`${!greetingUser ? 'Hi!' : ''}${greetingUser ? 'Hi ' + greetingUser?.firstName + '!' : ''}`}
                        </h2>

                        {cowboyShoutOut.showDaysTillOpeningNight &&
                        <div className={s.daysToGo}>
                            <span className={s.daysToGoNumber} >{daysToGo()}</span><span>days till opening night!</span>
                        </div>
                        }
                       
                        {!greetingUser && <div className={s.viewAsPartPersonSelector}>
                            <p>Please select the person you wish to view as:</p>
                            <Button className={s.viewAsButton} color="primary" size="m" onClick={() => togglePersonSelector()}>View As</Button>
                        </div>
                        }
                        {greetingUser && cowboyShoutOut.showCastingStatistics &&
                            <h2 className={s.castingText}>
                                {castingText}
                            </h2>
                        }
                        {cowboyShoutOut.additionalMessage != null &&
                            <h2 className={s.additionalMessage}>
                                {cowboyShoutOut.additionalMessage}
                            </h2>
                        }
                        {nextRehearsalMessage != null && 
                            <h2 className={s.nextRehearsalMessage}>
                                {nextRehearsalMessage}
                            </h2>
                        }
                       
                        <div className={s.whaddonShowCowboy}>
                            <img src={whaddonShowCowboy} alt="The Whaddon Show Cowboy shouting into a speech bubble." className={s.logo} />
                        </div>
                    </div>


                </div>


                <div className={classnames(s.linksContainer, isMobileDevice ? s.mobile : null)}>
                    <div className={s.link}>
                        <h2>Script</h2>
                        <img src={scriptPage} title="go to script" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/script')} />
                    </div>

                    <div className={s.link}>
                        <h2>Script Summary</h2>
                        <img src={scriptSummary} title="go to script summary" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/scriptsummary')} />
                    </div>

                    <div className={s.link}>
                        <h2>Casting</h2>
                        <img src={casting} title="go to casting" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/casting')} />
                    </div>
                    <div className={s.link}>
                        <h2>Users</h2>
                        <img src={users} title="go to users" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/users')} />
                    </div>
                    <div className={s.link}>
                        <h2>Api</h2>
                        <img src={apimonitor} title="go to api" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/api/documentation')} />
                    </div>

                    <div className={s.link}>
                        <h2>Gallery</h2>
                        <img src={underConstruction} title="go to gallery" className={classnames(s.linkImage, 'clickable')} onClick={(e) => handlePictureClick(e, '/app/gallery')} />
                    </div>
                </div>


            </div >
            <PersonSelector viewAs />
        </>


    )

}

export default Home;