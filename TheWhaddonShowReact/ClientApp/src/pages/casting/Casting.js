import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//component
import Avatar from '../../components/Avatar/Avatar';

//utilities
import classnames from 'classnames';
import { getLatest } from '../../dataAccess/localServerUtils';
import { addFriendlyName } from '../../dataAccess/personScripts';

//scss
import './Casting.module.scss';
import ScriptSummary from '../scriptSummary/ScriptSummary';

const Casting = (props) => {

    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    const cast = addFriendlyName(persons.filter(person => person.isActor || person.isSinger))

    const castWithParts = getCastWithParts(cast, partPersons, scriptItems)


    return (
        <>
            <h1>Casting</h1>
            <div className={s.castingContainer}>

                <div className={s.castSection}>
                    {castWithParts.map(castMember =>
                        <>
                            <Avatar person={castMember} avatarInitials={(castMember.avatarInitials) || null} />
                            <span >{castMemeber.friendlyName || castMember.name}</span>
                        </>
                    )
                    }
                </div>
                <div className={s.summarySection}>
                    <ScriptSummary summaryType={CASTING} />
                </div>
            </div>
        </>


    )



}
export default Casting;



const getLineStats = (scriptItems) => {
    const lineStats = scriptItems.filter(item => item.type === DIALOGUE).map(item => ({
        partId: item.partId,
        sceneId: item.parentId,
        wordCount: item.text.split[' '].length + 1
    }))

    return lineStats;
}


const getPartsWithStats = (partPersons, lineStats) => {

    const partsWithStats = lineStats.reduce((acc, line) => {
        const partId = line.partId || 'unallocated'
        acc[partId] = acc[partId]
            ? { ...acc, [partId]: { ...acc[partId], wordCount: acc[partId].wordCount + line.wordCount, lineCount: acc[partId].lineCount + 1 } }
            : { part: partPersons[partId] || { id: 'none', name: 'unallocated' }, wordCount: line.wordCount, lineCount: 1 };
    }, {})

    return partsWithStats
}

const getCastWithParts = (cast, partStats) => {

    const castParts = partStats.reduce((acc, part) => {
        const personId = part.personId || 'unallocated'
        acc[personId] = acc[personId]
            ? { ...acc, [personId]: { ...acc[personId], parts: [...acc[personId].parts, part], wordCount: acc[personId].wordCount + part.wordCount, totalParts: acc[personId].partCount + 1 } }
            : { person: cast[personId] || { id: 'none', firstName: 'unallocated' }, parts: [part], wordCount: part.wordCount, partCount: 1 };
    }, {})

    return castParts;
}

const getCastWithScenes = ( castParts) => {

    const castScenes =  castParts.reduce((acc, castMember) => {
        const personId = castMember.personId
        const scenes = castMember.parts.
        acc[personId] = acc[personId]
            ? { ...acc, [personId]: { ...acc[personId], scenes: [...acc[personId].scenes, castPart.parts.mapScen], wordCount: acc[personId].wordCount + part.wordCount, totalParts: acc[personId].partCount + 1 } }
            : { person: cast[personId] || { id: 'none', firstName: 'unallocated' }, parts: [part], wordCount: part.wordCount, partCount: 1 };
    }, {})

    return castScenes;


NEED TO ADD IN NUMBER OF SCENES AND SCENES themelves getCastWithScenes.