import { refreshSceneOrder } from './sceneOrder'

import { UNDO, REDO, CONFIRM_UNDO } from '../../../actions/scriptEditor'

export const getUndoUpdates = (triggerType, sceneOrder, currentScriptItems, storedScriptItems, redoList, undoSceneId, currentPartPersons, viewAsPartPerson) => {


    let output = {}

    switch (triggerType) {
        case UNDO: output = undo(sceneOrder, currentScriptItems, storedScriptItems, undoSceneId) || {}; return
        case REDO: output = redo(sceneOrder, redoList, currentPartPersons, viewAsPartPerson) || {}; return
        case CONFIRM_UNDO: output = confirmUndo(currentScriptItems, redoList) || {}; return;
        default: break;
    }

    return output
}


///Undo processing
export const undo = (currentSceneOrder, currentScriptItems, storedScriptItems,currentPartPersons,  storedParts, storedPersons, undoSceneId) => {

    const sceneId = currentSceneOrder[0].id
    if (sceneId !== undoSceneId) {
        confirmUndo() //confirm undo for current undo Scene before moving to new one.
    }

    const latestCreatedDate = currentSceneOrder.reduce((a, b) => (new Date(a.created) > new Date(b.created)) ? a : b).created
    let currentScriptItemUpdates = []; //the changed scriptItems that will now be posted to currentScriptItems
    let redoListUpdates = []; //the original scriptItems that will be put back if redo is confirmed
    let sceneOrderUpdates = []

    const newSceneOrder = currentSceneOrder.map(item => {

        if (new Date(item.created) === new Date(latestCreatedDate)) {

            //add the item to the list of items adding to redo list
            redoListUpdates.push(currentScriptItems[item.id])

            //update line in sceneOrder
            const scriptItemHistory = storedScriptItems.filter(scriptItem => scriptItem.id === item.id && new Date(scriptItem.created) < latestCreatedDate)
            let undoScriptItem;

            if (scriptItemHistory.length > 0) {
                undoScriptItem = scriptItemHistory.reduce((a, b) => (new Date(a.created) > new Date(b.created) ? a : b))
            } else {
                undoScriptItem = { ...currentScriptItems[item.id], isActive: false }
            }

            //add the undoneSCriptItemt to the list of items to updaten currentScriptItems
            currentScriptItemUpdates.push(undoScriptItem)

            return { ...item, created: undoScriptItem.created }

        } else {
            return item;
        }
    })

    sceneOrderUpdates.push(newSceneOrder)

    return { currentScriptItemUpdates, sceneOrderUpdates, redoListUpdates }

}


export const redo = (currentSceneOrder, redoList, currentPartPersons,viewAsPartPerson) => {

    const scene = currentSceneOrder[0]

    const redoCreated = redoList[redoList.length - 1].created
    const currentScriptItemUpdates = redoList.filter(item => new Date(item.created) === new Date(redoCreated))
    const scenePartPersonIds = scene.partIds.map(partId => ({ sceneId: scene.id, partId, personId: currentPartPersons[partId].personId }))
    const sceneOrder = refreshSceneOrder(currentSceneOrder, currentScriptItemUpdates, viewAsPartPerson, currentPartPersons)

    const sceneOrderUpdates = [sceneOrder]

    return { redoCreated, currentScriptItemUpdates, sceneOrderUpdates }

}

export const confirmUndo = (currentScriptItems, redoList) => {

    const undoneIds = [...new Set(redoList.map(item => item.id))]

    const currentScriptItemUpdates = undoneIds.map(item => currentScriptItems[item.id])

    const doResetUndo = true

    return { currentScriptItemUpdates, doResetUndo }

}