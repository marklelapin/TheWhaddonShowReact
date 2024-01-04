import { refreshSceneOrder } from './sceneOrder'

import { UNDO, REDO, CONFIRM_UNDO } from '../../../actions/scriptEditor'
import { SCRIPT_ITEM, PART } from '../../../dataAccess/localServerModels'

import {log, SCRIPT_EDITOR_UNDO as logType} from '../../../logging'

export const getUndoUpdates = (triggerType, sceneOrder, currentScriptItems, storedScriptItems, redoList, undoSceneId, currentPartPersons, storedParts, viewAsPartPerson) => {


    let output = {}

    switch (triggerType) {
        case UNDO: output = undo(sceneOrder, currentScriptItems, storedScriptItems, currentPartPersons, storedParts, undoSceneId, viewAsPartPerson, redoList) || {}; break;
        case REDO: output = redo(sceneOrder, redoList, currentPartPersons, viewAsPartPerson) || {}; break;
        case CONFIRM_UNDO:
            output = confirmUndo(currentScriptItems, currentPartPersons, redoList) || {}
            break;

        default: break;
    }

    return output
}


///Undo processing
export const undo = (currentSceneOrder, currentScriptItems, storedScriptItems, currentPartPersons, storedParts, undoSceneId, viewAsPartPerson,redoList) => {

    log(logType, 'undo', { undoSceneId })

    const sceneId = currentSceneOrder[0].id
    if (sceneId !== undoSceneId && undoSceneId!== null) {
        confirmUndo(currentScriptItems,currentPartPersons,redoList) //confirm undo for current undo Scene before moving to new one.
    }

    //output
    let redoListUpdates = []; //the original scriptItems that will be put back if redo is confirmed
    let sceneOrderUpdates = [];

    const latestCreatedDate = getLatestCreatedDate(currentSceneOrder, currentPartPersons)
    const { currentScriptItemUpdates, redoListScriptItemUpdates } = getUndoScriptItemUpdates(currentSceneOrder, currentScriptItems, storedScriptItems, latestCreatedDate)
    const { currentPartPersonUpdates, redoListPartPersonUpdates } = getUndoPartPersonUpdates(currentPartPersons, storedParts, latestCreatedDate)

    const mergedPartPersons = [...Object.values(currentPartPersons).map(item=>currentPartPersonUpdates.find(update=>update.id===item.id) || item)]

    redoListUpdates = [...redoListScriptItemUpdates.map(item => ({ ...item, redoType: SCRIPT_ITEM })), ...redoListPartPersonUpdates.map(item => ({ ...item, redoType: PART }))]

    if (currentScriptItemUpdates.length > 0) {
        const mergedSceneOrder = getUndoMergeSceneOrder(currentSceneOrder, currentScriptItemUpdates) //this is different to the standard mergedSceneOrder in sceneOrder.js as doesn't filter for latest.
        const newSceneOrder = refreshSceneOrder(mergedSceneOrder, [], viewAsPartPerson, mergedPartPersons)
        sceneOrderUpdates.push(newSceneOrder)
    }
    log(logType,'undo output', { currentScriptItemUpdates, currentPartPersonUpdates, redoListUpdates,  sceneOrderUpdates : sceneOrderUpdates.length })
    return { currentScriptItemUpdates, currentPartPersonUpdates, sceneOrderUpdates, redoListUpdates }

}


export const redo = (currentSceneOrder, redoList, currentPartPersons, viewAsPartPerson) => {
    log(logType,'redo', { redoList })
    const redoCreated = redoList[redoList.length - 1]?.created
    const currentScriptItemUpdates = redoList.filter(item => new Date(item.created).getTime() === new Date(redoCreated).getTime() && item.redoType === SCRIPT_ITEM)
    const currentPartPersonUpdates = redoList.filter(item => new Date(item.created).getTime() === new Date(redoCreated).getTime() && item.redoType === PART)

    const mergedPartPersons = [...Object.values(currentPartPersons).map(item=>currentPartPersonUpdates.find(update=>update.id===item.id) || item)]

    const sceneOrder = refreshSceneOrder(currentSceneOrder, currentScriptItemUpdates, viewAsPartPerson, mergedPartPersons)

    const sceneOrderUpdates = [sceneOrder]

    const totalRedo = currentScriptItemUpdates.length + currentPartPersonUpdates.length

    const doResetUndo =  (totalRedo === redoList.length) ? true : false

    log(logType,'redo output', {redoCreated, currentScriptItemUpdates, currentPartPersonUpdates,sceneOrderUpdates: sceneOrderUpdates.length})
    return { redoCreated, currentScriptItemUpdates, currentPartPersonUpdates,sceneOrderUpdates, doResetUndo }

}

export const confirmUndo = (currentScriptItems, currentPartPersons, redoList) => {
    log(logType, 'confirmUndo', { redoList })

    const undoneScriptItemIds = [...new Set(redoList.filter(item => item.redoType === SCRIPT_ITEM).map(item => item.id))]

    const undonePartIds = [...new Set(redoList.filter(item => item.redoType === PART).map(item => item.id))]

    const scriptItemUpdates = undoneScriptItemIds.map(id => currentScriptItems[id])
    const partUpdates = undonePartIds.map(id=> currentPartPersons[id])

    const doResetUndo = true
    log(logType, 'confirm undo output', {scriptItemUpdates,partUpdates,doResetUndo})
    return { scriptItemUpdates,partUpdates, doResetUndo }

}



export const getLatestCreatedDate = (currentSceneOrder, currentPartPersons) => {

    const latestScriptItemUpdate = currentSceneOrder.reduce((a, b) => (new Date(a.created) > new Date(b.created)) ? a : b)
    const latestPartPersonUpdate = Object.values(currentPartPersons).reduce((a, b) => (new Date(a.created) > new Date(b.created)) ? a : b)

    const latestCreatedDate = (new Date(latestScriptItemUpdate.created) > new Date(latestPartPersonUpdate.created)) ? latestScriptItemUpdate.created : latestPartPersonUpdate.created

    return latestCreatedDate;
}

export const getUndoScriptItemUpdates = (currentSceneOrder, currentScriptItems, storedScriptItems, latestCreatedDate) => {

    const currentScriptItemUpdates = []; //the changed scriptItems that will now be posted to currentScriptItems
    const redoListScriptItemUpdates = []; //the original scriptItems that will be put back if redo is confirmed

    currentSceneOrder.forEach(item => {

        if (new Date(item.created).getTime() === new Date(latestCreatedDate).getTime()) {
            const scriptItemHistory = storedScriptItems.filter(scriptItem => scriptItem.id === item.id && new Date(scriptItem.created) < new Date(latestCreatedDate))
            let undoScriptItem;
            if (scriptItemHistory.length > 0) {
                undoScriptItem = scriptItemHistory.reduce((a, b) => (new Date(a.created) > new Date(b.created) ? a : b))
            } else {
                undoScriptItem = { ...currentScriptItems[item.id], isActive: false }
            }

            (undoScriptItem) && currentScriptItemUpdates.push(undoScriptItem)
            
            redoListScriptItemUpdates.push(currentScriptItems[item.id])
        }

    })

    return { currentScriptItemUpdates, redoListScriptItemUpdates };
}

export const getUndoPartPersonUpdates = (currentPartPersons, storedParts, latestCreatedDate) => {

    const currentPartPersonUpdates = []; //the changed partPersons that will now be posted to currentPartPersons
    const redoListPartPersonUpdates = []; //the original partPersons that will be put back if redo is confirmed

    Object.values(currentPartPersons).forEach(partPerson => {

        if (new Date(partPerson.created).getTime() === new Date(latestCreatedDate).getTime()) {

            const partPersonHistory = storedParts.filter(part => part.id === partPerson.id && new Date(part.created) < new Date(latestCreatedDate))
            let undoPartPerson;
            if (partPersonHistory.length > 0) {
                undoPartPerson = partPersonHistory.reduce((a, b) => (new Date(a.created) > new Date(b.created) ? a : b))
            } else {
                undoPartPerson = { ...partPerson, isActive: false }
            }

            currentPartPersonUpdates.push(undoPartPerson)
            redoListPartPersonUpdates.push(currentPartPersons[partPerson.id])
        }
    })

    return { currentPartPersonUpdates, redoListPartPersonUpdates };
}

export const getUndoMergeSceneOrder = (currentSceneOrder, scriptItemUpdates) => {

    const newSceneOrder = currentSceneOrder.map(item => {

        const newScriptItem = scriptItemUpdates.find(scriptItem => scriptItem.id === item.id)

        if (newScriptItem) {
            return newScriptItem
        } else {
            return item
        }
    })

    return newSceneOrder;

}