
import { SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN, DIALOGUE } from "dataAccess/scriptItemTypes"; 

import { ScriptItemUpdate } from 'dataAccess/localServerModels';
import { sortLatestScriptItems } from '../../../dataAccess/localServerUtils';

export const above = 'above'
export const below = 'below'


export function newScriptItemsForCreate(placement, _existingScriptItem, _currentScriptItems, type = 'Dialogue') {

    const currentScriptItems = [..._currentScriptItems] 
    const existingScriptItem = { ..._existingScriptItem }


    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.previousId)

    let nextScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.nextId)

    let newScriptItem = new ScriptItemUpdate(type)
    newScriptItem.parentId = existingScriptItem.parentId

    let newScriptItems = [];

    if (placement === above) {

        previousScriptItem.nextId = newScriptItem.id
        previousScriptItem.changed = true

        newScriptItem.previousId = previousScriptItem.id
        newScriptItem.nextId = existingScriptItem.id
        newScriptItem.changed = true;

        existingScriptItem.previousId = newScriptItem.id
        existingScriptItem.changed = true

        newScriptItems = [previousScriptItem, newScriptItem, existingScriptItem]

    }

    if (placement === below) {

        existingScriptItem.nextId = newScriptItem.id;
        existingScriptItem.changed = true

        newScriptItem.previousId = existingScriptItem.id
        newScriptItem.nextId = (nextScriptItem) ? nextScriptItem.id : null
        newScriptItem.changed = true

        if (nextScriptItem) {
            nextScriptItem.previousId = newScriptItem.id
            nextScriptItem.changed = true
        }

        newScriptItems = [existingScriptItem, newScriptItem, nextScriptItem]

    }

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems 

}
export default newScriptItemsForCreate


export function newScriptItemsForDelete(scriptItemToDelete, currentScriptItems) {

    let deleteScriptItem = { ...scriptItemToDelete }

    let previousScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.previousId)
    let nextScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.nextId)

    if (previousScriptItem) {

        if (nextScriptItem) {
            previousScriptItem.nextId = nextScriptItem.id
        } else {
            previousScriptItem.nextId = null
        }

        previousScriptItem.changed = true
    }

    if (nextScriptItem) {
        nextScriptItem.previousId = previousScriptItem.id
        nextScriptItem.changed = true
    }

    deleteScriptItem.isActive = false
    deleteScriptItem.changed = true


    const newScriptItems = [];
    newScriptItems.push(previousScriptItem)
    newScriptItems.push(nextScriptItem)
    newScriptItems.push(deleteScriptItem)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}

export function newScriptItemsForSceneDelete(sceneToDelete, currentScenes) {

    let deleteScene = { ...sceneToDelete }

    let previousScene = currentScenes.find(scene => scene.id === deleteScene.previousId)
    let nextScene = currentScenes.find(scene => scene.id === deleteScene.nextId)


    if (previousScene) {

        if (nextScene) {
            previousScene.nextId = nextScene.id
        } else {
            previousScene.nextId = null
        }
    }

    if (nextScene) {
        nextScene.previousId = previousScene.id
    }

    deleteScene.isActive = false

    const newScriptItems = [];
    newScriptItems.push(previousScene)
    newScriptItems.push(nextScene)
    newScriptItems.push(deleteScene)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems


}

export function createHeaderScriptItems(previousScene,nextScene = null) {

    let newPreviousScene = { ...previousScene }
    let newNextScene = (nextScene) ? { ...nextScene } : null

    let scene = new ScriptItemUpdate(SCENE)
    let synopsis = new ScriptItemUpdate(SYNOPSIS)
    let initialStaging = new ScriptItemUpdate(INITIAL_STAGING)
    let initialCurtain = new ScriptItemUpdate(INITIAL_CURTAIN)

    let dialogue = new ScriptItemUpdate(DIALOGUE)

    scene.text = 'New Scene'

    //nextIds
    newPreviousScene.nextId = scene.id
    scene.nextId = synopsis.id
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
    newUpdates.push(newNextScene)

    return newUpdates
}