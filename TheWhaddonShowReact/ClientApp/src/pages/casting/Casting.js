import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


//component
import ScriptSummary, { CASTING } from '../scriptSummary/ScriptSummary';
import CastMember from './components/CastMember';
import PersonSelector from '../../pages/scriptEditor/components/PersonSelector'
import CowboyAlert from '../../components/CowboyAlert/CowboyAlert';
//utilities
import { getLatest } from '../../dataAccess/localServerUtils';
import { addFriendlyName, getCastMembers } from '../../dataAccess/personScripts';
//import { log, CASTING as logType } from '../../dataAccess/logging';
import { getCastWithPartsAndScenes } from './scripts'
import classnames from 'classnames';
import { log, CASTING as logType } from '../../dataAccess/logging';
//scss
import s from './Casting.module.scss';




const Casting = () => {

    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)

    const [viewAsCastMember, setViewAsCastMember] = useState(null);
    const [tempPerson, setTempPerson] = useState(false)
    const [tempPartId, setTempPartId] = useState(null);
    const [tempPartChange, setTempPartChange] = useState(null);

    const mobile = isMobileDevice ? 'mobile' : 'desktop'

    const cast = addFriendlyName(getCastMembers(persons))

    const castPartScenes = getCastWithPartsAndScenes(cast, partPersons, scriptItems, tempPartChange)

    const highestWordCount = Math.max(...castPartScenes.map(castMember => castMember.wordCount))

    const castSortedByWordCount = castPartScenes.sort((a, b) => b.wordCount - a.wordCount)


    useEffect(() => {

        document.addEventListener('dragend', handleDragEnd)

        return () => document.removeEventListener('dragend', handleDragEnd)
    }, [])

    useEffect(() => {
        log(logType, 'useEffect[tempPerson,tempPart]', { tempPerson, tempPartId })
        if (tempPartId && tempPerson !== false) {
            setTempPartChange({ partId: tempPartId, person: tempPerson })
        }
    }, [tempPerson, tempPartId])



    const handleDragEnd = () => {
        setTempPerson(false)
        setTempPartId(null)
        setTempPartChange(null)
    }




    return (
        <>
            <h1 > Casting </h1>
            <div className={classnames(s.castingContainer, s[mobile])}>

                <div className={classnames(s.castSection, s[mobile], 'deallocatePartOnDrop')}>
                    <h3 className={s.castTitle}>
                        Cast
                    </h3>
                    <div className={s.castMain}>
                        {castSortedByWordCount.map(castMember =>
                            <CastMember key={castMember.person.id}
                                castMember={castMember}
                                highestWordCount={highestWordCount}
                                onClick={() => setViewAsCastMember(castMember)}
                                active={viewAsCastMember?.person.id === castMember.person.id}
                                setTempPerson={setTempPerson}
                            />
                        )
                        }

                    </div>

                </div>
                <div className={classnames(s.summarySection, s[mobile])}>
                    <h3 className={s.summaryTitle}>
                        Show Summary
                    </h3>
                    <div className={s.summaryMain}>
                        <ScriptSummary
                            summaryType={CASTING}
                            showErrors={true}
                            showHighlights={true}
                            showFilters={false}
                            viewAsPerson={viewAsCastMember?.person}
                            allowPartAllocation={true}
                            allowSceneOrderChanges={true}
                            setTempPartId={setTempPartId}
                        />
                    </div>
                </div>
                
                <CowboyAlert demoOnly={true} messageId='casting'>
                    {isMobileDevice &&
                        <div className={s.alert}>
                            <div>On mobiles this is readonly but on desktop you can drag and drop to change casting or the scene order.</div>
                            <div>{`See who's got the most lines to learn.`}</div>
                            <div>See where quick changes and casting issues are highlighted lower down.</div>
                        </div>

                    }

                    {!isMobileDevice &&
                        <div className={s.alert}>
                            <div>Try <span>recasting</span> or <span>change the scene order</span> using <strong>drag and drop</strong></div>
                            <div>Look out for quick changes and casting to multiple parts</div>
                            <div>Make sure everyone gets their fair share of parts!</div>
                        </div>
                    }

                </CowboyAlert>

            </div>
            <PersonSelector />
        </>


    )



}
export default Casting;

