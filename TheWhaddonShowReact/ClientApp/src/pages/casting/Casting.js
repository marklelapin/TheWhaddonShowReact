import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//component
import ScriptSummary, { CASTING } from '../scriptSummary/ScriptSummary';
import CastMember from './components/CastMember';
//utilities
import classnames from 'classnames';
import { getLatest } from '../../dataAccess/localServerUtils';
import { addFriendlyName } from '../../dataAccess/personScripts';
import { log, CASTING as logType } from '../../dataAccess/logging';

import { getCastWithPartsAndScenes } from './scripts'


//scss
import s from './Casting.module.scss';


const Casting = () => {

    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    const cast = addFriendlyName(persons.filter(person => person.isActor || person.isSinger))

    const castPartScenes = getCastWithPartsAndScenes(cast, partPersons, scriptItems)

    const highestWordCount = Math.max(...castPartScenes.map(castMember => castMember.person.wordCount))


    log(logType, 'props', { cast, castPartScenes })
    return (
        <>
            <h1>Casting</h1>
            <div className={s.castingContainer}>

                <div className={s.castSection}>
                    <h2 className={s.castTitle}>
                        Cast
                    </h2>
                    <div className={s.castMain}>
                        {castPartScenes.map(castMember =>
                            <CastMember key={castMember.person.id} castMember={castMember} highestWordCount={highestWordCount} />
                        )
                        }

                    </div>

                </div>
                <div className={s.summarySection}>
                    <div className={s.summaryTitle}>
                        Summary
                    </div>
                    <div className={s.summaryMain}>
                        <ScriptSummary summaryType={CASTING} />
                    </div>
                </div>

            </div>
        </>


    )



}
export default Casting;

