
import { OPEN_CURTAIN, SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, DIALOGUE, HEADER_TYPES, INITIAL_CURTAIN, COMMENT } from "../../../dataAccess/scriptItemTypes";
import { ABOVE, BELOW } from './utility';

import { ScriptItemUpdate, PartUpdate } from "../../../dataAccess/localServerModels";
import { log } from '../../../logging'

export function newScriptItemsForCreateShow(title) {

    const show = new ScriptItemUpdate(SHOW, title)
    const act1 = new ScriptItemUpdate(ACT, 'Act 1')
    const act2 = new ScriptItemUpdate(ACT, 'Act 2')

    show.nextId = act1.id
    act1.previousId = show.id

    act1.nextId = act2.id
    act2.previousId = act1.id

    show.parentId = show.id
    act1.parentId = show.id
    act2.parentId = show.id

    const scriptItems = [show, act1, act2]

    return scriptItems

}




export function newScriptItemsForCreate(placement, _existingScriptItem, currentScriptItems, type = DIALOGUE, tempTextValue) {

    const existingScriptItem = { ...copy(_existingScriptItem), text: (tempTextValue) ? tempTextValue : _existingScriptItem.text }

    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = copy(currentScriptItems[existingScriptItem.previousId])
    let nextScriptItem = (existingScriptItem.nextId) ? copy(currentScriptItems[existingScriptItem.nextId]) : null
    let newScriptItem = new ScriptItemUpdate(type || DIALOGUE)

    newScriptItem.parentId = existingScriptItem.parentId

    let newScriptItems = [];

    if (placement === ABOVE) {

        previousScriptItem.nextId = newScriptItem.id

        newScriptItem.previousId = previousScriptItem.id
        newScriptItem.nextId = existingScriptItem.id

        existingScriptItem.previousId = newScriptItem.id

        newScriptItems = [previousScriptItem, newScriptItem, existingScriptItem]

    }

    if (placement === BELOW) {

        existingScriptItem.nextId = newScriptItem.id;

        newScriptItem.previousId = existingScriptItem.id
        newScriptItem.nextId = (nextScriptItem) ? nextScriptItem.id : null

        if (nextScriptItem) {
            nextScriptItem.previousId = newScriptItem.id
        }

        newScriptItems = [existingScriptItem, newScriptItem]

        if (nextScriptItem) { newScriptItems.push(nextScriptItem) }

    }

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}

export function newScriptItemsForDelete(scriptItemToDelete, currentScriptItems, confirmSceneDelete = false) {

    if (HEADER_TYPES.includes(scriptItemToDelete.type) && confirmSceneDelete === false) {
        alert('You cannot delete a header item')
        return [];
    }

    let deleteScriptItem = copy(scriptItemToDelete)
    const newScriptItems = [];

    let previousScriptItem = copy(currentScriptItems[deleteScriptItem.previousId])
    let nextScriptItem = (deleteScriptItem.nextId) ? copy(currentScriptItems[deleteScriptItem.nextId]) : null


    if (nextScriptItem) {
        previousScriptItem.nextId = nextScriptItem.id
        nextScriptItem.previousId = previousScriptItem.id
        newScriptItems.push(previousScriptItem)
        newScriptItems.push(nextScriptItem)
    } else {
        previousScriptItem.nextId = null
        newScriptItems.push(previousScriptItem)
    }


    deleteScriptItem.isActive = false
    newScriptItems.push(deleteScriptItem)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}

export function newScriptItemsForSceneDelete(sceneToDelete, currentScriptItems) {
    const confirmSceneDelete = window.confirm('Are you sure you want to delete this scene?')

    if (confirmSceneDelete === true) {
        return newScriptItemsForDelete(sceneToDelete, currentScriptItems, confirmSceneDelete)
    } else {
        return []
    }

}

export function newUpdatesForCreateHeader(previousScene, currentScriptItems) {

    let newPreviousScene = copy(previousScene)
    let newNextScene = (previousScene.nextId) ? copy(currentScriptItems[previousScene.nextId]) : null

    let scene = new ScriptItemUpdate(SCENE)
    let synopsis = new ScriptItemUpdate(SYNOPSIS)
    let initialStaging = new ScriptItemUpdate(INITIAL_STAGING)
    let initialCurtain = new ScriptItemUpdate(INITIAL_CURTAIN)
    initialCurtain.tags.push(OPEN_CURTAIN)

    let dialogue = new ScriptItemUpdate(DIALOGUE)

    scene.text = 'New Scene'

    //nextIds
    newPreviousScene.nextId = scene.id
    scene.nextId = previousScene.nextId
    synopsis.nextId = initialStaging.id
    initialStaging.nextId = initialCurtain.id
    initialCurtain.nextId = dialogue.id

    //previousIds
    if (newNextScene) { newNextScene.previousId = scene.id }
    scene.previousId = previousScene.id
    synopsis.previousId = scene.id
    initialStaging.previousId = synopsis.id
    initialCurtain.previousId = initialStaging.id
    dialogue.previousId = initialCurtain.id


    //parentIds
    scene.parentId = previousScene.parentId
    synopsis.parentId = scene.id
    initialStaging.parentId = scene.id
    initialCurtain.parentId = scene.id
    dialogue.parentId = scene.id



    const scriptItemUpdates = [newPreviousScene, scene, synopsis, initialStaging, initialCurtain, dialogue]
    if (newNextScene) { scriptItemUpdates.push(newNextScene) }

    const partUpdates = [{ ...new PartUpdate(), id: scene.partIds[0] }]

    return { scriptItemUpdates, partUpdates }
}


export function newScriptItemsForMoveScene(scene, newPreviousId, currentScriptItems) {

    let movingScene = copy(scene)
    if (scene.id === newPreviousId || movingScene.previousId === newPreviousId) return []

    let oldPreviousScene = copy(currentScriptItems[movingScene.previousId])
    let oldNextScene = (movingScene.nextId) ? copy(currentScriptItems[movingScene.nextId]) : null
    let newPreviousScene = copy(currentScriptItems[newPreviousId])
    let newNextScene = (newPreviousScene.nextId) ? copy(currentScriptItems[newPreviousScene.nextId]) : null

    if (oldPreviousScene.id === newNextScene?.id) {

        oldPreviousScene.nextId = copy(movingScene.nextId)
        oldPreviousScene.previousId = copy(movingScene.id)

        if (oldNextScene) { oldNextScene.previousId = copy(oldPreviousScene.id) }

        newPreviousScene.nextId = copy(movingScene.id)

        newNextScene = null // as same as oldPreviousScene

        movingScene.previousId = copy(newPreviousScene.id)
        movingScene.nextId = copy(oldPreviousScene.id)
    } else if (oldNextScene?.id === copy(newPreviousScene.id)) {

        oldPreviousScene.nextId = copy(oldNextScene.id)
        newPreviousScene.previousId = copy(oldPreviousScene.id)

        newPreviousScene.nextId = copy(movingScene.id)
        movingScene.previousId = copy(newPreviousScene.id)
        movingScene.nextId = copy(oldNextScene.nextId)

        if (newNextScene) { newNextScene.previousId = copy(movingScene.id) }
        oldNextScene = null //as same as newPreviousScene
    } else {
        oldPreviousScene.nextId = copy(movingScene.nextId)
        if (oldNextScene) { oldNextScene.previousId = copy(movingScene.previousId) }

        newPreviousScene.nextId = copy(movingScene.id)
        if (newNextScene) { newNextScene.previousId = copy(movingScene.id) }

        movingScene.previousId = copy(newPreviousScene.id)
        movingScene.nextId = newNextScene?.id || null
    }


    const updates = [];

    updates.push(oldPreviousScene)
    if (oldNextScene) { updates.push(oldNextScene) }
    updates.push(movingScene)
    updates.push(newPreviousScene)
    if (newNextScene) { updates.push(newNextScene) }

    return updates

}

export const newScriptItemsForAddComment = (scriptItem, tempTextValue = null) => {

    let newScriptItem = copy(scriptItem)

    if (tempTextValue || tempTextValue === '') {
        newScriptItem.text = tempTextValue
    }

    let newComment = new ScriptItemUpdate(COMMENT)

    newComment.parentId = newScriptItem.parentId
    newComment.previousId = newScriptItem.id

    newScriptItem.commentId = newComment.id

    const newUpdates = [newComment, newScriptItem]

    return newUpdates
}

export const newScriptItemsForDeleteComment = (scriptItem, currentScriptItems) => {

    const deleteCommentUpdate = { ...copy(scriptItem), isActive: false }

    const scriptItemUpdate = { ...copy(currentScriptItems[scriptItem.previousId]), commentId: null }

    const newUpdates = [deleteCommentUpdate, scriptItemUpdate]

    return newUpdates;
}


export const newUpdatesForSwapPart = (oldPartId, newPartId, currentSceneScriptItemsArray, showOrder, currentPartPersons) => {

    //output
    const newPartUpdates = [];
    let newScriptItemUpdates = [];

    const scene = currentSceneScriptItemsArray.find(item => item.type === SCENE)

    if (scene.partIds.includes(newPartId)) {
        alert('The part is already associated with this scene')
        return;
    }

    newScriptItemUpdates = currentSceneScriptItemsArray.map(item => {

        const copyItem = copy(item)

        if (item.partIds.includes(oldPartId)) {
            return { ...copyItem, partIds: [...copyItem.partIds].map(partId => (partId === oldPartId) ? newPartId : partId) }
        }
        return null

    }).filter(item => item !== null)


    const usedElsewhere = showOrder.some(sceneItem => sceneItem.partIds.includes(oldPartId) && sceneItem.id !== scene.id);

    if (!usedElsewhere) {
        let partToDelete = copy(currentPartPersons[oldPartId])
        partToDelete.isActive = false
        newPartUpdates.push(partToDelete) //only delete if not usedElsewhere
    }

    return { newPartUpdates, newScriptItemUpdates };

}


export const getScriptItemUpdatesLaterThanCurrent = (scriptItemUpdates, currentScriptItems) => {

    //the updates that are newer than the current scriptItems so will affect script Editor
    const updatesLaterThanExisting = scriptItemUpdates.filter(update => new Date(update.created) > new Date(currentScriptItems[update.id]?.created || 0))

    //find the latest currentScriptItemUpdates for each id
    const currentScriptItemUpdates = Object.values(updatesLaterThanExisting.reduce((acc, item) => {
        if (!acc[item.id] || new Date(acc[item.id].created) < new Date(item.created || 0)) {
            acc[item.id] = item;
        }
        return acc;
    }, {}))


    return currentScriptItemUpdates;

}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}

export const getOrderedSceneScriptItems = (sceneOrder, currentScriptItems) => {

    return copy(sceneOrder.map(item => currentScriptItems[item.id]))

}