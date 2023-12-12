
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, COMMENT } from "../../../dataAccess/scriptItemTypes";
import { getLatest } from '../../../dataAccess/localServerUtils';
import { refreshCurtain } from "./curtain";
import { initial, merge } from "lodash";

import { log, SCRIPT_EDITOR_SCENE_ORDER as logType } from '../../../logging';

const debug = true;
//Sorts ScriptItems and also works out curtain opening as requires same linked list calculation.
//--------------------------------------------------------------------------------------------------

export function refreshSceneOrder(currentSceneOrder = [], newScriptItems = [], viewAsPartPerson, currentPartPersons) {

    const mergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

    const { head, mergedSceneOrderWithUpdatedHead } = getHead(mergedSceneOrder)

    if (Object.keys(head).length === 0) return []

    const sortedSceneOrder = sortSceneOrder(head, mergedSceneOrderWithUpdatedHead)

    const zIndexedSceneOrder = updateZIndex(sortedSceneOrder)
    let finalSceneOrder;

    //different processes for different head types
    if (head.type === SCENE) {
        const curtainSceneOrder = (head.type === SCENE) ? refreshCurtain(zIndexedSceneOrder) : zIndexedSceneOrder

        const alignedSceneOrder = (head.type === SCENE) ? alignRight(curtainSceneOrder, viewAsPartPerson, currentPartPersons) : curtainSceneOrder

        finalSceneOrder = updateFocusOverrides(alignedSceneOrder)
    }

    if (head.type === SHOW) {
        finalSceneOrder = addSceneNumbers(zIndexedSceneOrder)
    }

    if (finalSceneOrder) {
        return finalSceneOrder;
    } else {
        return []
    }


}

export const mergeSceneOrder = (currentSceneOrder, newScriptItems) => {

    const mergedSceneOrder = getLatest([...currentSceneOrder, ...newScriptItems])

    return mergedSceneOrder;
}


export const getHead = (mergedSceneOrder) => {



    let head = null;

    const show = mergedSceneOrder.find(item => item.type === SHOW)

    const scene = mergedSceneOrder.find(item => item.type === SCENE)

    log(logType, 'getHead', { show, scene, mergedSceneOrder })

    if (show) {
        head = show
    }
    else if (scene) {
        //this calculation is required as scene is part of both the show linked llist and its own linked list so needs a nextId swap.
        head = copy(scene)
        let headNextId = mergedSceneOrder.find((item) => item.previousId === head.id && item.type !== COMMENT).id;
        head.nextSceneId = scene.nextId
        head.nextId = headNextId
    }


    if (head === null || head === undefined) {
        log(debug, ('Script:SceneOrder getHead - no head found'))
        const emptyHead = {};
        return {
            head: emptyHead,
            mergedSceneOrderWithUpdatedHead: []
        }
    }

    const mergedSceneOrderWithUpdatedHead = mergedSceneOrder.map(item => {

        if (item.id === head.id) {
            return { ...head }
        } else {
            return item
        }

    })

    return { head, mergedSceneOrderWithUpdatedHead };
}


export const sortSceneOrder = (head, unsortedSceneOrder) => {

    //create objectMap of all items in the targetArray
    const idToObjectMap = {};

    for (const item of unsortedSceneOrder) {
        idToObjectMap[item.id] = (item.id === head.id) ? head : item;
    }

    //log(debug,'error check', { idToObjectMap })
    //Sort the targetArray by nextId
    const sortedLinkedList = [];
    let currentId = head.id

    while (currentId !== null) {
        let currentItem = idToObjectMap[currentId];

        if (currentItem) {
            currentId = currentItem.nextId;
            sortedLinkedList.push(currentItem);

        } else {
            currentId = null;
        }
    }

    return sortedLinkedList;
}


export const updateZIndex = (sortedSceneOrder) => {

    const startingZIndex = 1000000;
    const zIndexInterval = 1000;

    let zIndexedSceneOrder = [...copy(sortedSceneOrder)]

    const resetZIndex = () => {

        let zIndex = startingZIndex;

        zIndexedSceneOrder.forEach(item => {
            item.zIndex = zIndex;
            zIndex = zIndex - zIndexInterval;
        })
    }

    const head = zIndexedSceneOrder[0]
    if (head.zIndex !== startingZIndex) {
        resetZIndex()
    }

    try {

        for (let i = 0; i < zIndexedSceneOrder.length; i++) {

            const item = zIndexedSceneOrder[i]

            if (item.zIndex && item.zIndex > 0) {

                //do nothing as z-Index already set and if changed will cause a re-render.next
            } else {

                const previousZIndex = zIndexedSceneOrder[i - 1].zIndex
                const nextZIndex = zIndexedSceneOrder[i + 1]?.zIndex || null

                if (nextZIndex === null) {

                    zIndexedSceneOrder[i].zIndex = previousZIndex - zIndexInterval
                } else {

                    if (previousZIndex - nextZIndex < 2) { throw new Error('not enough space between scriptItems to insert another') }

                    const newZIndex = Math.floor((previousZIndex + nextZIndex) / 2)
                    zIndexedSceneOrder[i].zIndex = newZIndex

                }

            }
        }
    } catch (error) {
        resetZIndex()
    }

    return zIndexedSceneOrder;
}


export const updateFocusOverrides = (sceneOrder, newPartIds = null) => {

    const scene = copy(sceneOrder.find(item => item.type === SCENE))
    const partIds = newPartIds || scene.partIds

    const synopsis = copy(sceneOrder.find(item => item.type === SYNOPSIS))
    const initialStaging = copy(sceneOrder.find(item => item.type === INITIAL_STAGING))
    const finalScriptItem = copy(sceneOrder.find(item => item.nextId === null))

    scene.previousFocusId = scene.previousId
    scene.nextFocusId = synopsis.id
    synopsis.previousFocusId = scene.id
    synopsis.nextFocusId = partIds[0]
    initialStaging.previousFocusId = partIds[partIds.length - 1]
    initialStaging.nextFocusId = initialStaging.nextId

    finalScriptItem.nextFocusId = scene.nextSceneId


    const newSceneOrder = sceneOrder.map(item => {
        if (item.type === SCENE) return scene
        if (item.type === SYNOPSIS) return synopsis
        if (item.type === INITIAL_STAGING) return initialStaging
        if (item.id === finalScriptItem.id) return finalScriptItem
        return copy(item)
    })

    return newSceneOrder;
}




const addSceneNumbers = (sceneOrder) => {

    let i = 1;
    const numberedSceneOrder = sceneOrder.map(scene => {
        if (scene.type === SCENE) {
            const numberedScene = { ...scene, sceneNumber: i }
            i++;
            return numberedScene

        } else {
            return scene
        }


    })

    return numberedSceneOrder
}

export const alignRight = (sceneOrder, viewAsPartPerson, currentPartPersons, scriptItemUpdates = []) => {

    const mergedSceneOrder = mergeSceneOrder(sceneOrder, scriptItemUpdates)

    const partIdsOrderInBody = [...new Set(mergedSceneOrder.filter(item => item.type !== SCENE).map(item => item.partIds[0]).filter(id => id !== undefined))] || []

    //you have to do this next step in two stages as multiple parts can be played by the same person and you can pick the wrong one if you don't do this
    const viewAsPartPersons = Object.values(currentPartPersons).filter(partPerson => partPerson.personId === viewAsPartPerson?.id || partPerson.id === viewAsPartPerson?.id) || []

    const viewAsPartId = (viewAsPartPersons.find(item => partIdsOrderInBody.includes(item.id)))?.id || null

    const righthandPartId = viewAsPartId || partIdsOrderInBody[1]
    //log(true, 'error check: alignRight', { partIdsOrderInBody, viewAsPartPerson, viewAsPartId,righthandPartId })
    const alignedSceneOrder = mergedSceneOrder.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

    return alignedSceneOrder

}


export const getSceneOrderUpdates = (currentScriptItemUpdates, currentScriptItems, sceneOrders, viewAsPartPerson, currentPartPersons) => {

    const sceneIds = currentScriptItemUpdates.map(item => item.parentId)

    const uniqueSceneIds = [...new Set(sceneIds)]

    //output variables
    let sceneOrderUpdates = []
    let previousCurtainUpdates = []


    uniqueSceneIds.forEach(sceneId => {

        const nextSceneIdFromScriptItemUpdates = currentScriptItemUpdates.find(item => item.id === sceneId)?.nextId || null
        const nextSceneId = nextSceneIdFromScriptItemUpdates || currentScriptItems[sceneId]?.nextId || 0 //0 is the default value for the peviousCurtainOpen state at the end of the show. (relevant for moving scenes)

        const newSceneScriptItems = currentScriptItemUpdates.filter(item => item.parentId === sceneId || item.id === sceneId)


        const newSceneOrder = refreshSceneOrder(sceneOrders[sceneId], newSceneScriptItems, viewAsPartPerson, currentPartPersons)

        if (newSceneOrder.length > 0) { //length = 0 can occur if the scene is inActive
            sceneOrderUpdates.push(newSceneOrder)

            const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1]?.curtainOpen;
            previousCurtainUpdates.push({ sceneId: nextSceneId, previousCurtainOpen })

        }
    })



    return { sceneOrderUpdates, previousCurtainUpdates }
}




export const isSceneAffectedByViewAsPartPerson = (scene, viewAsPartPerson, currentPartPersons) => {

    const scenePartPersonIds = scene.partIds.map(partId => currentPartPersons[partId]).map(partPerson => ({ sceneId: scene.id, partId: partPerson?.id, personId: partPerson?.personId }))

    const match = scenePartPersonIds.some(scenePartPerson => scenePartPerson.partId === viewAsPartPerson?.id || scenePartPerson.personId === viewAsPartPerson?.id)

    return match
}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}