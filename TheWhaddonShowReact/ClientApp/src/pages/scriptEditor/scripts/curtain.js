
import { OPEN_CURTAIN, CLOSE_CURTAIN, INITIAL_CURTAIN, CURTAIN, CURTAIN_TYPES } from "../../../dataAccess/scriptItemTypes";
import {mergeSceneOrder} from './sceneOrder'
import { log } from '../../../logging'

export function refreshCurtain(sceneOrder, newScriptItems = []) {

    let currentCurtainOpen = false;

    const mergedSceneOrder = mergeSceneOrder(sceneOrder, newScriptItems)


    const newSceneOrder = copy(mergedSceneOrder).map(item => {

        if (opensCurtain(item)) {
            currentCurtainOpen = true;
            return { ...item, curtainOpen: currentCurtainOpen }
        } else if (closesCurtain(item)) {
            currentCurtainOpen = false;
            return { ...item, curtainOpen: currentCurtainOpen }
        } else {
            return { ...item, curtainOpen: currentCurtainOpen }
        }
    })

    return newSceneOrder;
}




export const newScriptItemsForToggleCurtain = (scriptItem, sceneOrder, previousCurtainOpen, overrideNewValue = null,) => {

    let isCurrentlyOpen;
    if (scriptItem.type === INITIAL_CURTAIN) {
        isCurrentlyOpen = previousCurtainOpen[scriptItem.parentId]?.curtainOpen || false
    }
    if (scriptItem.type === CURTAIN) {
        isCurrentlyOpen = sceneOrder.find(item => item.id === scriptItem.id)?.curtainOpen || false
    }


    const currentlyOpensCurtain = (overrideNewValue) ? !overrideNewValue : opensCurtain(scriptItem)



    let newScriptItem = copy(scriptItem)
    if (isCurrentlyOpen === false && currentlyOpensCurtain) {

        newScriptItem = changeToCloseCurtain(newScriptItem)
        newScriptItem.text = 'Curtain remains closed.'
    }

    if (isCurrentlyOpen && currentlyOpensCurtain === false) {

        newScriptItem = changeToOpenCurtain(newScriptItem)
        newScriptItem.text = 'Curtain remains open.'
    }

    if (isCurrentlyOpen === false && currentlyOpensCurtain === false) {
        newScriptItem = changeToOpenCurtain(newScriptItem)
        newScriptItem.text = 'Curtain opens.'
    }

    if (isCurrentlyOpen && currentlyOpensCurtain) {
        newScriptItem = changeToCloseCurtain(newScriptItem)
        newScriptItem.text = 'Curtain closes.'
    }
 
    return [newScriptItem];
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

    if (CURTAIN_TYPES.includes(scriptItem.type)) {
        return scriptItem.tags.includes(OPEN_CURTAIN)
    }

    return false
}

const closesCurtain = (scriptItem) => {

    if (CURTAIN_TYPES.includes(scriptItem.type)) {
        return scriptItem.tags.includes(CLOSE_CURTAIN)
    }

    return false
}

export const clearCurtainTags = (scriptItem) => {

    let newScriptItem = copy(scriptItem)

    newScriptItem.tags = newScriptItem.tags.filter(tag => tag !== OPEN_CURTAIN && tag !== CLOSE_CURTAIN)

    return newScriptItem;
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}