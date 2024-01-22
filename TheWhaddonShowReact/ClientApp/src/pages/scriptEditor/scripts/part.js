import { PartUpdate } from '../../../dataAccess/localServerModels'
import { UP, DOWN, START, END, BELOW } from './utility.js'
import { SCENE } from '../../../dataAccess/scriptItemTypes'
import { getLatest } from '../../../dataAccess/localServerUtils'
import { getOrderedSceneScriptItems } from './scriptItem';
import { log, PART as logType } from '../../../dataAccess/logging';

export const addPersonsInfo = (parts, persons) => {

    const partPerson = parts.map(part => addPersonInfo(part, persons.find(person => person.id === part.personId)))

    return partPerson

}

export const addPersonInfo = (part, person) => {

    let updatedPart = { ...part }
    updatedPart.firstName = part.name
    updatedPart.avatarInitials = (part.name) ? part.name.split(' ').map(word => word[0]).join('') : '?';
    updatedPart.pictureRef = person?.pictureRef || null
    updatedPart.personName = person?.firstName || null

    return updatedPart
}


export const newUpdatesForAddPart = (position, part, tempTextValue, scene) => {

    //output
    let newPartUpdates = []
    let newScriptItemUpdates = []

    //update part if temptTextValue
    if (tempTextValue !== null && tempTextValue !== undefined) {
        newPartUpdates.push({ ...copy(part), name: tempTextValue })
    }

    const newPart = new PartUpdate()
    newPartUpdates.push(newPart)

    //add part
    const partIndex = scene.partIds.findIndex(id => id === part.id)
    const partBeforeIndex = (position === BELOW) ? partIndex : partIndex - 1

    const startArray = { ...scene }.partIds.slice(0, partBeforeIndex + 1) || []
    const endArray = { ...scene }.partIds.slice(partBeforeIndex + 1) || []
    const newPartArray = [newPart.id]

    const newPartIds = [...startArray, ...newPartArray, ...endArray]

    newScriptItemUpdates.push({ ...scene, partIds: newPartIds })

    return { newPartUpdates, newScriptItemUpdates }
}


export const newUpdatesForDeleteNextPart = (partPriorToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show,currentPartPersons) => {
    
    const nextPartIdToDelete = nextPartId(partPriorToDelete, sceneToDeleteFrom)
    if (nextPartIdToDelete) {
const nextPartToDelete = currentPartPersons[nextPartIdToDelete]
    return newUpdatesForDeletePart(nextPartToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show)
    }
    else return { newPartUpdates: [], newScriptItemUpdates: [] }

}

export const newUpdatesForDeletePart = (partToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show) => {

    const sceneScriptItems = getOrderedSceneScriptItems(sceneOrders[sceneToDeleteFrom.id], currentScriptItems)

    //log(true, 'error check', { partToDelete, sceneScriptItems })
    const isPartAllocated = sceneScriptItems.some(item => item.partIds.includes(partToDelete.id) && item.type !== SCENE)
    //log(true, 'error check isPartAllocated', { isPartAllocated })

    if (sceneToDeleteFrom.partIds.length === 1) {
        alert('cant delete last part');
        return { newPartUpdates: [], newScriptItemUpdates: [] }
    }
    if (isPartAllocated) {
        alert('cant delete part as allocated within the scene');
        return { newPartUpdates: [], newScriptItemUpdates: [] }
    }

    //log(true, 'error check', { sceneScriptItems})
    //output
    const newScriptItemUpdates = sceneScriptItems.map(item => {
        if (item.partIds.some(id => id === partToDelete.id)) {
            return { ...copy(item), partIds: copy(item).partIds.filter(partId => partId !== partToDelete.id) }
        } else {
            return null
        }
    }).filter(item => item !== null)

    //log(true, 'error check ScriptItemUpdates', { newScriptItemUpdates })

    const newPartUpdates = [];
    const showOrder = sceneOrders[show.id]

    //log(true, 'error check', { showOrder })

    const usedElsewhere = showOrder.some(scene => scene.partIds.includes(partToDelete.id) && scene.id !== sceneToDeleteFrom.id);
    //const usedElseWhere = Object.values(sceneOrders).some(sceneOrder => sceneOrder[0].partIds.includes(partToDelete.id))

    if (!usedElsewhere) {
        newPartUpdates.push({ ...copy(partToDelete), isActive: false }) //only delete if not usedElsewhere
    }

    return { newPartUpdates, newScriptItemUpdates }
}


export const getDeleteNextMoveFocus = (partPriorToDelete, scene, direction, previousFocusId, nextFocusId,currentPartPersons) => {

    const nextPartIdToDelete = nextPartId(partPriorToDelete, scene)
    if (nextPartIdToDelete) {
        const nextPartToDelete = currentPartPersons[nextPartIdToDelete]
        return getDeleteMoveFocus(nextPartToDelete, scene, direction,previousFocusId,nextFocusId)
    }
    else return ({ id: partPriorToDelete.id, position: END })
}

export const getDeleteMoveFocus = (partToDelete, scene, direction, previousFocusId, nextFocusId) => {

    let newFocusId = null;
    let newFocusPosition = END;

    if (direction === UP && previousPartId(partToDelete, scene)) {
        newFocusId = partEditorRowId(previousPartId(partToDelete,scene),scene.id)
        newFocusPosition = END
    } else if (direction === UP && !previousPartId(partToDelete, scene)) {
        newFocusId = previousFocusId;
        newFocusPosition = END
    } else if (direction === DOWN && nextPartId(partToDelete,scene)) {
        newFocusId = partEditorRowId(nextPartId(partToDelete,scene), scene.id)
        newFocusPosition = START
    } else if (direction === DOWN && !nextPartId(partToDelete,scene)) {
        newFocusId = nextFocusId;
        newFocusPosition = START
    }

    return { id: newFocusId, position: newFocusPosition }
}


const previousPartId = (part, scene) => {

    const partIndex = scene.partIds.findIndex(id => id === part.id)

    if (partIndex > 0) {
        return scene.partIds[partIndex - 1]
    } else {
        return null
    }
}

const nextPartId = (part, scene) => {
    const partIndex = scene.partIds.findIndex(id => id === part.id)
    if (partIndex < scene.partIds.length - 1) {
        return scene.partIds[partIndex + 1]
    } else {
        return null
    }
}

export const newPartPersonsFromPartUpdates = (partUpdates, currentPartPersons, storedPersons) => {

   
    const currentPartUpdates = partUpdates.filter(update => new Date(update.created) > new Date(currentPartPersons[update.id]?.created || 0))
    //log(true, 'error check:', { currentPartUpdates })
    const latestCurrentPartUpdates = getLatest(currentPartUpdates, true)
    const persons = getLatest(storedPersons)
   
    const newPartPersons = latestCurrentPartUpdates.map(partUpdate => {
        const person = persons.find(person => person.id === partUpdate.personId) || null
        const partPerson = addPersonInfo(partUpdate, person)
        return partPerson;
    });

    return newPartPersons
}


export const newPartPersonsFromPersonUpdates = (personUpdates, currentPartPersons) => {
    const latestPersonUpdates = getLatest(personUpdates, true)

    const newPartPersons = []
    for (const key in currentPartPersons) {
        if (currentPartPersons.hasOwnProperty(key)) {
            const part = currentPartPersons[key]
            const newPerson = latestPersonUpdates.find(item => item.id === part.personId)
            if (newPerson) {
                newPartPersons.push(addPersonInfo(part, newPerson))
            }

        }
    }

    return newPartPersons;
}


export const partEditorRowId = (partId, sceneId) => {
    if (partId && sceneId) {
        return `part-${partId}-scene-${sceneId}`
    }
    return null
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export const isViewAsPartPerson = (viewAsPartPerson, scriptItem, currentPartPersons) => {

    if (viewAsPartPerson === null || viewAsPartPerson === undefined || scriptItem === null || scriptItem === undefined || currentPartPersons === null || currentPartPersons === undefined) return false

    const partIds = scriptItem.partIds || []
    const personIds = Object.values(currentPartPersons).filter(partPerson => partIds.includes(partPerson.id) && partPerson.personId).map(partPerson => partPerson.personId) || []
    const ids = [...partIds, ...personIds]

    
    const isViewAsPartPerson = (ids.includes(viewAsPartPerson.id) || ids.includes(viewAsPartPerson.personId))

    log(logType, 'isViewAsPartPerson', { viewAsPartPerson, scriptItem, isViewAsPartPerson })

    return  isViewAsPartPerson
}
