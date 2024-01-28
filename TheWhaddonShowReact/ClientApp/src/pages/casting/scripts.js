import { SCENE, DIALOGUE } from '../../dataAccess/scriptItemTypes';
import { log, CASTING_SCRIPTS as logType } from '../../dataAccess/logging';

export const getLineStats = (scriptItems,sceneId = null) => {

    const dialogueItems = Object.values(scriptItems)
        .filter(item => [DIALOGUE,SCENE].includes(item.type) && (sceneId === null || item.parentId === sceneId || item.id === sceneId))
        .map(item => {
            const partIds = (!item.partIds || item.partIds.length === 0) ? ['unallocated'] : item.partIds
            const words = (item.type === DIALOGUE) ? item.text.split(' ') || [] : [];
            return { sceneId: item.parentId, partIds: partIds, wordCount: words.length + 1 }
        })

    let lineStats = []

    dialogueItems.forEach(dialogueItem => {
        dialogueItem.partIds.forEach(partId => {
            lineStats.push({ sceneId: dialogueItem.sceneId, partId: partId, wordCount: dialogueItem.wordCount })
        })
    })

   // log(logType, 'lineStats', lineStats)
    return lineStats;
}


const getPartsWithStats = (partPersons, scriptItems) => {

    const lineStats = getLineStats(scriptItems)

    const partsWithStats = lineStats.reduce((acc, line) => {
        const partId = line.partId || 'unallocated'
        const personId = partPersons[partId]?.personId || 'unallocated'
        const part = (partPersons[partId]) ? { ...partPersons[partId], personId: personId } : { id: 'unallocated', name: 'unallocated', personId: 'unallocated' }

        if (acc[partId]) {
            acc[partId].wordCount += line.wordCount
            acc[partId].lineCount += 1

        } else {
            acc = { ...acc, [partId]: { part: part, wordCount: line.wordCount, lineCount: 1 } }
        }

        return acc;
    }, {})

   // log(logType, 'partsWithStats', partsWithStats)
    return partsWithStats
}

const getCastWithParts = (cast, partPersons, scriptItems) => {

    const partStats = getPartsWithStats(partPersons, scriptItems)

    const castParts = Object.values(partStats).reduce((acc, partStat) => {
        const part = partStat.part
        const personId = part.personId
        const person = cast.find(castMember => castMember.id === personId) || { id: 'none', firstName: 'nobody' }

        if (acc[personId]) {
            acc[personId].parts.push(part)
            acc[personId].wordCount += partStat.wordCount
            acc[personId].lineCount += partStat.lineCount
        } else {
            acc = { ...acc, [personId]: { person:person, parts: [part], wordCount: partStat.wordCount, lineCount: partStat.lineCount } }
        }
        return acc;
    }, {})
    //log(logType, 'castParts', { castParts })
    return castParts;
}

export const getCastWithPartsAndScenes = (cast, partPersons, scriptItems) => {

    const castWithParts = getCastWithParts(cast, partPersons, scriptItems)

    const sceneScriptItems = Object.values(scriptItems).filter(item => item.type === SCENE)

    const castPartScenes = Object.values(castWithParts).map(castMember => {
        const personPartIds = castMember.parts.map(part => part.id)
        const scenes = sceneScriptItems.filter(scene => scene.partIds.some(partId => personPartIds.includes(partId)))
        return { ...castMember, scenes }
    })

    const finalCastPartScenes = cast.map(castMember => castPartScenes.find(item => item.person.id === castMember.id) || { person: castMember, scenes: [], parts: [], wordCount: 0,lineCount: 0 })

    log(logType, 'finalCastPartScenes', { finalCastPartScenes })
    return finalCastPartScenes;
}

export const isQuickChange = (scene, part, scriptItems,partPersons) => {

    const sceneBefore = Object.values(scriptItems).find(item => item.nextId === scene.id)
    const sceneAfter = Object.values(scriptItems).find(item => item.id === scene.nextId)

    const sceneBeforeContainsPersonInDifferentPart = sceneBefore.partIds.some(partId => partPersons[partId]?.personId === part.personId && partId !== part.id);
    const sceneAfterContainsPersonInDifferentPart = sceneAfter.partIds.some(partId => partPersons[partId]?.personId === part.personId && partId !== part.id)

    return (sceneBeforeContainsPersonInDifferentPart || sceneAfterContainsPersonInDifferentPart)
}

export const isPersonInMultipleParts = (scene, part, partPersons) => {
  
    const isPersonInMultipleParts = scene.partIds.some(partId => partPersons[partId]?.personId === part.personId && partId !== part.id);

    return isPersonInMultipleParts;
}

