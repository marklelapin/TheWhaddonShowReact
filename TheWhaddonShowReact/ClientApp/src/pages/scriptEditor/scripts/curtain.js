
import { OPEN_CURTAIN, CLOSE_CURTAIN, CURTAIN_TYPES } from "../../../dataAccess/scriptItemTypes.js";
import { mergeSceneOrder } from './sceneOrder.js'

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




export const newScriptItemsForToggleCurtain = (scriptItem, overrideNewValue = null,) => {

    const currentlyOpensCurtain = opensCurtain(scriptItem)
    const currentlyClosesCurtain = closesCurtain(scriptItem)

    const finalCurtainState = (overrideNewValue !==null) ? overrideNewValue : !opensCurtain(scriptItem)

    if (currentlyClosesCurtain && finalCurtainState === false) {
        return [];
    }

    if (currentlyOpensCurtain && finalCurtainState === true) {
        return []
    }

    let newScriptItem = copy(scriptItem)
    if (finalCurtainState === false) {
        newScriptItem = changeToCloseCurtain(newScriptItem)
    }

    if (finalCurtainState === true) {
        newScriptItem = changeToOpenCurtain(newScriptItem)
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


export const curtainText = (scriptItem, previousCurtain = null) => {

    let output = ''

    if (previousCurtain === false && closesCurtain(scriptItem)) output = 'Curtain remains closed.';
    if (previousCurtain === true && opensCurtain(scriptItem)) output = 'Curtain remains open.';
    if (previousCurtain === false && opensCurtain(scriptItem)) output = 'Curtain opens.';
    if (previousCurtain === true && closesCurtain(scriptItem)) output = 'Curtain closes.';
    if (previousCurtain === null && opensCurtain(scriptItem)) output = 'Curtain opens.';
    if (previousCurtain === null && closesCurtain(scriptItem)) output = 'Curtain closes.';
    return output;
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}