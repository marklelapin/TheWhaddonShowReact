
import { OPEN_CURTAIN, SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, DIALOGUE, HEADER_TYPES, INITIAL_CURTAIN, COMMENT } from "../../../dataAccess/scriptItemTypes";
import { ABOVE, BELOW } from './utility';

import { ScriptItemUpdate } from "../../../dataAccess/localServerModels";


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

    
    const existingScriptItem = { ..._existingScriptItem, text: (tempTextValue) ? tempTextValue : existingScriptItem.text }
    const surroundingScriptItems = getSurroundingScriptItems(existingScriptItem, currentScriptItems)


    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = surroundingScriptItems.find(item => item.id === existingScriptItem.previousId)

    let nextScriptItem = surroundingScriptItems.find(item => item.id === existingScriptItem.nextId)

    let newScriptItem = new ScriptItemUpdate(type)
    newScriptItem.parentId = existingScriptItem.parentId

    let newScriptItems = [];

    if (placement === ABOVE) {

        previousScriptItem.nextId = newScriptItem.id
        previousScriptItem.changed = true

        newScriptItem.previousId = previousScriptItem.id
        newScriptItem.nextId = existingScriptItem.id
        newScriptItem.changed = true;

        existingScriptItem.previousId = newScriptItem.id
        existingScriptItem.changed = true

        newScriptItems = [previousScriptItem, newScriptItem, existingScriptItem]

    }

    if (placement === BELOW) {

        existingScriptItem.nextId = newScriptItem.id;
        existingScriptItem.changed = true

        newScriptItem.previousId = existingScriptItem.id
        newScriptItem.nextId = (nextScriptItem) ? nextScriptItem.id : null
        newScriptItem.changed = true

        if (nextScriptItem) {
            nextScriptItem.previousId = newScriptItem.id
            nextScriptItem.changed = true
        }

        newScriptItems = [existingScriptItem, newScriptItem]

        if (nextScriptItem) { newScriptItems.push(nextScriptItem) }

    }

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}

export function newScriptItemsForDelete(scriptItemToDelete, currentScriptItems) {

    const surroundingScriptItems = getSurroundingScriptItems(scriptItemToDelete, currentScriptItems)

    if (HEADER_TYPES.includes(scriptItemToDelete.type)) {
        alert('You cannot delete a header item')
        return;
    }

    let deleteScriptItem = { ...scriptItemToDelete }
    const newScriptItems = [];

    let previousScriptItem = surroundingScriptItems.find(item => item.id === deleteScriptItem.previousId)
    let nextScriptItem = surroundingScriptItems.find(item => item.id === deleteScriptItem.nextId)

    if (previousScriptItem) {

        if (nextScriptItem) {
            previousScriptItem.nextId = nextScriptItem.id
        } else {
            previousScriptItem.nextId = null
        }

        previousScriptItem.changed = true

        newScriptItems.push(previousScriptItem)
    }

    if (nextScriptItem) {
        nextScriptItem.previousId = previousScriptItem.id
        nextScriptItem.changed = true

        newScriptItems.push(nextScriptItem)
    }

    deleteScriptItem.isActive = false
    deleteScriptItem.changed = true
    newScriptItems.push(deleteScriptItem)





    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}



export function newScriptItemsForSceneDelete(sceneToDelete, currentScenes) {

    let deleteScene = { ...sceneToDelete }
    const newScriptItems = [];

    let previousScene = currentScenes.find(scene => scene.id === deleteScene.previousId)
    let nextScene = currentScenes.find(scene => scene.id === deleteScene.nextId)



    if (previousScene) {

        if (nextScene) {
            previousScene.nextId = nextScene.id
        } else {
            previousScene.nextId = null
        }

        newScriptItems.push(previousScene)
    }

    if (nextScene) {
        nextScene.previousId = previousScene.id

        newScriptItems.push(nextScene)
    }

    deleteScene.isActive = false

    newScriptItems.push(deleteScene)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems


}

export function newScriptItemsForCreateHeader(previousScene, nextScene = null) {

    let newPreviousScene = { ...previousScene }
    let newNextScene = (nextScene) ? { ...nextScene } : null

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



    const newUpdates = [newPreviousScene, scene, synopsis, initialStaging, initialCurtain, dialogue]
    if (newNextScene) { newUpdates.push(newNextScene) }

    return newUpdates
}


export function newScriptItemsForMoveScene(sceneId, newPreviousId, scenes) {

    let movingScene = scenes.find(scene => scene.id === sceneId)
    if (sceneId === newPreviousId || movingScene.previousId === newPreviousId) return []

    let oldPreviousScene = scenes.find(scene => scene.id === movingScene.previousId)
    let oldNextScene = scenes.find(scene => scene.id === movingScene.nextId)
    let newPreviousScene = scenes.find(scene => scene.id === newPreviousId)
    let newNextScene = scenes.find(scene => scene.id === newPreviousScene.nextId)


    oldPreviousScene.nextId = oldNextScene?.id || null
    if (oldNextScene) { oldNextScene.previousId = oldPreviousScene.id }

    movingScene.previousId = newPreviousScene.id
    movingScene.nextId = newNextScene?.id || null

    newPreviousScene.nextId = movingScene.id
    if (newNextScene) { newNextScene.previousId = movingScene.id }


    const updates = []

    updates.push(oldPreviousScene)
    if (oldNextScene) { updates.push(oldNextScene) }
    updates.push(movingScene)
    updates.push(newPreviousScene)
    if (newNextScene) { updates.push(newNextScene) }

    return updates

}

export const newScriptItemsForAddComment = (_scriptItem, tempTextValue = null) => {

    let newScriptItem = { ..._scriptItem }
    if (tempTextValue) { newScriptItem.text = tempTextValue }

    let newComment = new ScriptItemUpdate(COMMENT)

    newComment.parentId = newScriptItem.parentId
    newComment.previousId = newScriptItem.id

    newScriptItem.commentId = newComment.id

    const newUpdates = [newComment, newScriptItem]

    return newUpdates
}

export const newScriptItemsForDeleteComment = (_scriptItem, scriptItems) => {

    const deleteCommentUpdate = { ..._scriptItem, isActive: false }
    const surroundingScriptItems = getSurroundingScriptItems(deleteCommentUpdate, scriptItems)

    const scriptItemUpdate = { ...surroundingScriptItems.find(item => item.id === _scriptItem.previousId), commentId: null }



    const newUpdates = [deleteCommentUpdate, scriptItemUpdate]

    return newUpdates;
}


export const newScriptItemsForSwapPart = (scriptItems, oldPartId, newPartId) => {

    const scene = scriptItems.find(item => item.type = SCENE)

    if (scene.partIds.includes(newPartId)) {
        alert('The part is already associated with this scene')
        return;
    }

    const newUpdates = [...scriptItems].map(item => ({ ...item, partIds: [...item.partIds].map(partId => (partId === oldPartId) ? newPartId : partId) }))

    return newUpdates;

}


export const getSurroundingScriptItems = (scriptItem,currentScriptItems) => {

    const previousScriptItem = currentScriptItems[scriptItem.previousId]
    const nextScriptItem = currentScriptItems[scriptItem.nextId]

    const surroundingScriptItems = []

    surroundingScriptItems.push(previousScriptItem)
    surroundingScriptItems.push(scriptItem)
    if (nextScriptItem) { surroundingScriptItems.push(nextScriptItem) }

    return surroundingScriptItems;
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

    return currentScriptItemUpdates

}