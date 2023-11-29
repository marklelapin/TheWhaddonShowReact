import { PartUpdate } from '../../../dataAccess/localServerModels'
import { UP, DOWN, START, END, BELOW } from './utility.js'
import {SYNOPSIS,INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes'


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


export const setupParts = (parts, persons) => {

    let updateParts = [...parts]

    updateParts = updateParts.map(part => addPersonInfo(part, persons))

    updateParts = updateParts.sort((a, b) => a.name.localeCompare(b.name))

    return updateParts;
}


// functions for useState hook for allocatedParts
export const addNewPart = (existingParts) => {

    const parts = [...existingParts]

    const newPart = new PartUpdate()
    newPart.new = true
    parts.push(newPart)

    return parts

}

export const newUpdatesForAddPart = (direction, part, tempTextValue, scene) => {

    //output
    let newPartUpdates = []
    let newScriptItemUpdates = []

    //update part if temptTextValue
    if (tempTextValue) {
        newPartUpdates.push({ ...part, name: tempTextValue })
    }

    const newPart = new PartUpdate()
    newPartUpdates.push(newPart)

    //add part
    const partIndex = scene.partIds.findIndex(id => id === part.id)
    const partBeforeIndex = (direction === BELOW) ? partIndex : partIndex - 1

    const startArray = { ...scene }.partIds.slice(0, partBeforeIndex + 1) || []
    const endArray = { ...scene }.partIds.slice(partBeforeIndex + 1) || []
    const newPartArray = [newPart.id]

    const newPartIds = [...startArray, ...newPartArray, ...endArray]

    newScriptItemUpdates.push({ ...scene, partIds: newPartIds })

    const newMoveFocus = null;

    return { newPartUpdates, newScriptItemUpdates, newMoveFocus }
}


export const newUpdatesForDeleteNextPart = (direction, part, sceneScriptItems, sceneOrders) => {

    const scene = sceneScriptItems[0]
    const nextPartToDelete = nextPart(part, scene)

    return newUpdatesForDeletePart(direction,nextPartToDelete,sceneScriptItems,sceneOrders)
}


export const newUpdatesForDeletePart = (direction, partToDelete, sceneScriptItems, sceneOrders) => {

    const scene = sceneScriptItems[0]
    const isPartAllocated = sceneScriptItems.some(item => item.partIds.includes(partToDelete.id))

    if (scene.partIds.length === 1) { alert('cant delete last part'); return }
    if (isPartAllocated) { alert('cant delete part as allocated within the scene'); return }

    //output
    const newPartUpdates = [];
    
    const newScriptItemUpdates = [{...scene, partIds: scene.partIds.filter(partId => partId !== partToDelete.id)}]

    const usedElseWhere = sceneOrders.some(sceneOrder => sceneOrder[0].partIds.includes(partToDelete.id)) 

    if (!usedElseWhere) {
        newPartUpdates.push({...partToDelete,isActive : false}) //only delete if not usedElsewhere
    }

    const previousFocusId = sceneScriptItems.find(item => item.type === SYNOPSIS).id
    const nextFocusId = sceneScriptItems.find(item =>item.type === INITIAL_STAGING).id

    const newMoveFocus = getDeleteMoveFocus(partToDelete,scene,direction,previousFocusId,nextFocusId)

    return { newPartUpdates, newScriptItemUpdates, newMoveFocus }
}



const getDeleteMoveFocus = (partToDelete, scene, direction, previousFocusId, nextFocusId) => {

    let newFocusId = null;
    let newFocusPosition = END;

    if (direction === UP && previousPart(partToDelete,scene)) {
        newFocusId = previousPart(partToDelete).id
        newFocusPosition = END
    } else if (direction === UP && !previousPart(partToDelete)) {
        newFocusId = previousFocusId;
        newFocusPosition = END
    } else if (direction === DOWN && nextPart(partToDelete)) {
        newFocusId = nextPart(partToDelete).id
        newFocusPosition = START
    } else if (direction === DOWN && !nextPart(partToDelete)) {
        newFocusId = nextFocusId;
        newFocusPosition = START
    }

    return {id : newFocusId ,position: newFocusPosition}
} 


const previousPart = (part, scene) => {

    const partIndex = scene.partIds.findIndex(id => id === part.id)

    if (partIndex > 0) {
        return scene.parts[partIndex - 1]
    } else {
        return null
    }
}

const nextPart = (part, scene) => {
    const partIndex = scene.partIds.findIndex(id => id === part.id)

    if (partIndex < scene.parts.length - 1) {
        return scene.parts[partIndex + 1]
    } else {
        return null
    }
}