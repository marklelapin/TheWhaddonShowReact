
import { SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, CURTAIN, INITIAL_CURTAIN, DIALOGUE, COMMENT } from "../../../dataAccess/scriptItemTypes";
import {OPEN_CURTAIN, CLOSE_CURTAIN } from "../../../dataAccess/scriptItemTypes";
import { ScriptItemUpdate } from '../../../dataAccess/localServerModels';
import { getLatest } from '../../../dataAccess/localServerUtils';
import { log } from '../../../helper';

import { ABOVE, BELOW } from './utility';
import { updatePreviousCurtain } from '../../../actions/scriptEditor';

//Sorts ScriptItems and also works out curtain opening as requires same linked list calculation.
//--------------------------------------------------------------------------------------------------
export function sortLatestScriptItems(head, scriptItems, undoDateTime = null) {

    const latestScriptItems = getLatest(scriptItems, undoDateTime);

    const sortedScriptItems = sortScriptItems(head, latestScriptItems);

    const activeComments = latestScriptItems.filter(item => item.isActive && item.type === COMMENT)
    const commentedScriptItems = sortedScriptItems.map(item => ({ ...item, comment: activeComments.find(comment => comment.id === item.commentId) }))

    return commentedScriptItems;

}

export function sortScriptItems(head, scriptItems) {

    const debug = true

    if (scriptItems.length === 1) return scriptItems;


    log(debug, 'Sort Head: ', head)
    log(debug, 'Sort ScriptItems', scriptItems)

    if (scriptItems.length === 0) return [];

    let targetArray = [...scriptItems];

    log(debug, 'EventsCheck sortScriptItems', { head: head, scriptItems: scriptItems })

    //this calculates a new nextId for head to allow it to swap between different linked lists. e.g. a SCene is part ofthe Act linked list but also the head of the Scene linked list
    const originalHeadNextId = head.nextId //this gets put back at end of process.
    const headNextId = targetArray.filter((item) => item.previousId === head.id)[0].id;
    targetArray = targetArray.map(item => item.id === head.id ? { ...item, nextId: headNextId } : item)

    log(debug, 'EventsCheck sortScriptItems after head change', { targetArray: targetArray })

    //create objectMap of all items in the targetArray
    const idToObjectMap = {};

    for (const item of targetArray) {
        idToObjectMap[item.id] = item;
    }

    //Sort the targetArray by nextId
    const sortedLinkedList = [];
    let currentId = head.id
    const initialCurtain = scriptItems.find(item => item.type === INITIAL_CURTAIN)
    let curtainOpen = (initialCurtain) ? initialCurtain.tags.includes(OPEN_CURTAIN) : false
    let previousCurtainOpen;

    while (currentId !== null) {
        let currentItem = idToObjectMap[currentId];

        if (currentItem) {
            if (opensCurtain(currentItem)) { curtainOpen = true }
            if (closesCurtain(currentItem)) { curtainOpen = false }

            currentItem.previousCurtainOpen = previousCurtainOpen;
            currentItem.curtainOpen = curtainOpen;
            previousCurtainOpen = curtainOpen;

            currentId = currentItem.nextId;
            currentItem = (currentItem.id === head.id) ? { ...currentItem, nextId: originalHeadNextId } : currentItem //returns head.nextId back to original

            sortedLinkedList.push(currentItem);

        } else {
            currentId = null;
        }

    }



    return sortedLinkedList;
}




export function addSceneNumbers(scenes) {

    let i = 1;
    const numberedScenes = scenes.map(scene => {
        if (scene.type === SCENE) {
            const numberedScene = { ...scene, sceneNumber: i }
            i++;
            return numberedScene

        } else {
            return scene
        }


    })

    return numberedScenes
}


//Functions to create scriptItem updates for various crud style operations
//----------------------------------------------------------------------------------

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




export function newScriptItemsForCreate(placement, _existingScriptItem, _currentScriptItems, type = DIALOGUE) {

    const currentScriptItems = [..._currentScriptItems]
    const existingScriptItem = { ..._existingScriptItem }


    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.previousId)

    let nextScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.nextId)

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

    let deleteScriptItem = { ...scriptItemToDelete }
    const newScriptItems = [];

    let previousScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.previousId)
    let nextScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.nextId)

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
    initialCurtain.tags.push('OpenCurtain')

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

    const scene = scenes.find(scene => scene.id === sceneId)

    if (sceneId === newPreviousId || scene.previousId === newPreviousId) return []

    const newNextId = [...scenes].find(scene => scene.id === newPreviousId)?.nextId || null
    const oldPreviousId = [...scenes].find(scene => scene.id === sceneId)?.previousId || null
    const oldNextId = [...scenes].find(scene => scene.id === sceneId)?.nextId || null

    const affectedIds = [...new Set([sceneId, newPreviousId, newNextId, oldPreviousId, oldNextId])].filter(item => item !== null)

    let updateObjects = [...scenes]
        .filter(scene => affectedIds.includes(scene.id))
        .reduce((idToObjectMap, scene) => {
            idToObjectMap[scene.id] = scene;
            return idToObjectMap;
        }, {})

    updateObjects[sceneId].previousId = newPreviousId //handles case where swaping with element directly next to it.
    updateObjects[sceneId].nextId = newNextId //handles case where swaping with element directly next to it.
    updateObjects[sceneId].parentId = updateObjects[newPreviousId].parentId

    updateObjects[newPreviousId].nextId = sceneId
    if (newNextId) { updateObjects[newNextId].previousId = sceneId }

    updateObjects[oldPreviousId].nextId = oldNextId
    if (oldNextId) { updateObjects[oldNextId].previousId = oldPreviousId }

    const updates = Object.values(updateObjects)

    return updates

}



export function updatePreviousCurtainValue(scene, scriptItems, dispatch) {

    const sortedScriptItems = sortLatestScriptItems(scene, scriptItems)

    if (scene.nextId) {
        const finalCurtainOpen = sortedScriptItems[sortedScriptItems.length - 1].curtainOpen
        dispatch(updatePreviousCurtain(scene.nextId, finalCurtainOpen))
    }

}

///Curtain Functions
//----------------------------------------------------------------------------------

export const newScriptItemsForToggleCurtain = (scriptItem,overrideNewValue=null) => {


    if (scriptItem.curtainOpen === undefined) {
        console.error('toggle Curtain called on scriptItem with no curtainOpen value. Assumed closed.')
    }
    const currentlyOpen = scriptItem.curtainOpen || false

    const currentlyOpensCurtain = (overrideNewValue) ? !overrideNewValue : opensCurtain(scriptItem)

    let newScriptItem = { ...scriptItem }



    if (currentlyOpen === false && currentlyOpensCurtain) {

        newScriptItem = changeToCloseCurtain(newScriptItem)
        newScriptItem.text = 'Curtain remains closed.'
    }

    if (currentlyOpen && currentlyOpensCurtain === false) {

        newScriptItem = changeToOpenCurtain(newScriptItem)
        newScriptItem.text = 'Curtain remains open.'
    }

    if (currentlyOpen === false && currentlyOpensCurtain === false) {
        newScriptItem = changeToOpenCurtain(newScriptItem)
        newScriptItem.text = 'Curtain opens.'
    }

    if (currentlyOpen && currentlyOpensCurtain) {
        newScriptItem = changeToCloseCurtain(newScriptItem)
        newScriptItem.text = 'Curtain closes.'
    }

    return newScriptItem;
}


const changeToOpenCurtain = (scriptItem) => {

    let newScriptItem = { ...scriptItem }

    newScriptItem.tags = newScriptItem.tags.filter(tag => tag !== CLOSE_CURTAIN)
    newScriptItem.tags.push(OPEN_CURTAIN)

    return newScriptItem;
}

const changeToCloseCurtain = (scriptItem) => {

    let newScriptItem = { ...scriptItem }

    newScriptItem.tags = newScriptItem.tags.filter(tag => tag !== OPEN_CURTAIN)
    newScriptItem.tags.push(CLOSE_CURTAIN)

    return newScriptItem;
}

const opensCurtain = (scriptItem) => {

    if (scriptItem.type === 'InitialCurtain' || scriptItem.type === 'Curtain') {
        return scriptItem.tags.includes(OPEN_CURTAIN)
    }

    return false
}

const closesCurtain = (scriptItem) => {

    if (scriptItem.type === 'InitialCurtain' || scriptItem.type === 'Curtain') {
        return scriptItem.tags.includes(CLOSE_CURTAIN)
    }

    return false
}

export const clearCurtainTags = (scriptItem) => {

    let newScriptItem = { ...scriptItem }

    newScriptItem.tags = newScriptItem.tags.filter(tag => tag !== OPEN_CURTAIN && tag !== CLOSE_CURTAIN)
}