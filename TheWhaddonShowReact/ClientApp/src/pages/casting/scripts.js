import { SCENE, DIALOGUE } from '../../dataAccess/scriptItemTypes';
import { log, CASTING_SCRIPTS as logType } from '../../dataAccess/logging';

const getLineStats = (scriptItems) => {
    const lineStats = Object.values(scriptItems).filter(item => item.type === DIALOGUE).map(item => ({
        partId: item.partId,
        sceneId: item.parentId,
        wordCount: item.text.split[' ']?.length + 1
    }))
    log(logType,'lineStats',lineStats)
    return lineStats;
}


const getPartsWithStats = (partPersons, scriptItems) => {

    const lineStats = getLineStats(scriptItems)


    const partsWithStats = lineStats.reduce((acc, line) => {
        const partId = line.partId || 'unallocated'
        acc[partId] = (acc[partId])
            ? { ...acc, [partId]: { ...acc[partId], wordCount: acc[partId].wordCount + line.wordCount, lineCount: acc[partId].lineCount + 1 } }
            : { part: partPersons[partId] || { id: 'none', name: 'unallocated' }, wordCount: line.wordCount, lineCount: 1 };

        return acc;
    }, {})
    log(logType, 'partsWithStats', partsWithStats)
    return partsWithStats
}

const getCastWithParts = (cast, partPersons, scriptItems) => {

    const partStats = getPartsWithStats(partPersons, scriptItems)

    const castParts = Object.values(partStats).reduce((acc, part) => {
        const personId = part.personId || 'unallocated'
        acc[personId] = acc[personId]
            ? { ...acc, [personId]: { ...acc[personId], parts: [...acc[personId].parts, part], wordCount: acc[personId].wordCount + part.wordCount, totalParts: acc[personId].partCount + 1 } }
            : { person: cast[personId] || { id: 'none', firstName: 'unallocated' }, parts: [part], wordCount: part.wordCount, partCount: 1 };
        return acc;
    }, {})
    log(logType, 'castParts', castParts)
    return castParts;
}

export const getCastWithPartsAndScenes = (cast, partPersons, scriptItems) => {

    const castWithParts = getCastWithParts(cast, partPersons, scriptItems)

    const sceneScriptItems = Object.values(scriptItems).filter(item => item.type === SCENE)

    const castPartScenes = Object.values(castWithParts).map(castMember => {
        const personPartIds = castMember.parts.map(part => part.partId)
        const scenes = sceneScriptItems.filter(scene => scene.partIds.some(partId => personPartIds.includes(partId)))
        return { ...castMember, scenes }
    })

    const finalCastPartScenes = cast.map(castMember => castPartScenes.find(item => item.person.id === castMember.id) || { person: castMember, scenes: [], parts: [] })

    return finalCastPartScenes;
}