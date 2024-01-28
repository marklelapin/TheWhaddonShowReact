import React, { useState } from 'react';
import { useSelector, useDispatch} from 'react-redux';

import { updatePersonSelectorConfig } from '../../actions/scriptEditor';

//component
import ScriptSummary, { CASTING } from '../scriptSummary/ScriptSummary';
import CastMember from './components/CastMember';
import PersonSelector from '../../pages/scriptEditor/components/PersonSelector'
//utilities
import { getLatest } from '../../dataAccess/localServerUtils';
import { addFriendlyName, getCastMembers } from '../../dataAccess/personScripts';
import { log, CASTING as logType } from '../../dataAccess/logging';
import { isScriptReadOnly } from '../../dataAccess/userAccess';
import { getCastWithPartsAndScenes } from './scripts'


//scss
import s from './Casting.module.scss';


const Casting = () => {

    const dispatch = useDispatch();

    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    const currentUser = useSelector(state => state.user.currentUser)
    const readOnly = isScriptReadOnly(currentUser)

    const [viewAsCastMember, setViewAsCastMember] = useState(null);


    const cast = addFriendlyName(getCastMembers(persons))

    const castPartScenes = getCastWithPartsAndScenes(cast, partPersons, scriptItems)

    const highestWordCount = Math.max(...castPartScenes.map(castMember => castMember.wordCount))

    const castSortedByWordCount = castPartScenes.sort((a, b) => b.wordCount - a.wordCount)



    const handleCastMemberClick = (castMember) => {
        log(logType,'handleCastMemberClick', { castMember })
        setViewAsCastMember((viewAsCastMember?.id === castMember.person.id) ? null : castMember)
    }

    const handlePartClick = (e, scene, part) => {
        e.preventDefault()
        if (!readOnly) { dispatch(updatePersonSelectorConfig({ sceneId : scene.id , partId: part.id })) }
    }


    









    return (
        <>
            <div className={s.castingContainer}>

                <div className={s.castSection}>
                    <h2 className={s.castTitle}>
                        Cast
                    </h2>
                    <div className={s.castMain}>
                        {castSortedByWordCount.map(castMember =>
                            <CastMember key={castMember.person.id}
                                castMember={castMember}
                                highestWordCount={highestWordCount}
                                onClick={() => handleCastMemberClick(castMember)}
                                active={viewAsCastMember?.id === castMember.person.id}
                            />
                        )
                        }

                    </div>

                </div>
                <div className={s.summarySection}>
                    <div className={s.summaryTitle}>
                        Summary
                    </div>
                    <div className={s.summaryMain}>
                        <ScriptSummary
                            summaryType={CASTING}
                            showErrors={true}
                            showHighlights={true}
                            viewAsPerson={viewAsCastMember?.person}
                            onClickPart={handlePartClick}
                            allowSceneOrderChanges={true}
                        />
                    </div>
                </div>

            </div>
            <PersonSelector />
        </>
        

    )



}
export default Casting;

