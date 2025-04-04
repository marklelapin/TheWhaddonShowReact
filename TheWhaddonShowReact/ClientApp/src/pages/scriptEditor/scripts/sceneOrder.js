﻿
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, COMMENT } from "../../../dataAccess/scriptItemTypes";
import { getLatest } from '../../../dataAccess/localServerUtils';
import { refreshCurtain } from "./curtain";

import { log, SCRIPT_EDITOR_SCENE_ORDER as logType } from '../../../dataAccess/logging';

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
    log(logType, 'refreshSceneOrder', { finalSceneOrder })

    if (finalSceneOrder) {
        return finalSceneOrder;
    } else {
        return []
    }

}

export const mergeSceneOrder = (currentSceneOrder, newScriptItems) => {

    const preparedNewScriptItems = newScriptItems.map(item => { //adds current scene order calcs into newSCriptItems to preserver these before they are overwritten in later operations if required.
        const currentSceneOrderItem = currentSceneOrder.find(currentItem => currentItem.id === item.id)
        if (currentSceneOrderItem) {
            return {
                ...item,
                curtainOpen: currentSceneOrderItem.curtainOpen,
                zIndex: currentSceneOrderItem.zIndex,
                nextFocusId: currentSceneOrderItem.nextFocusId,
                previousFocusId: currentSceneOrderItem.previousFocusId,
                alignRight: currentSceneOrderItem.alignRight

            }
        } else {
            return item
        }
    })

    const mergedSceneOrder = getLatest([...currentSceneOrder, ...preparedNewScriptItems])

    return mergedSceneOrder;
}


export const getHead = (mergedSceneOrder) => {

    let head = null;

    const show = mergedSceneOrder.find(item => item.type === SHOW)

    const scene = mergedSceneOrder.find(item => item.type === SCENE)

    log(logType, 'getHead', { show, scene, mergedSceneOrder })

    if (show) {
        head = show
       log(logType,'headFromShow',head)
    }
    else if (scene) {
        //this calculation is required as scene is part of both the show linked list and the head of its own linked list so needs a nextId swap.
        head = copy(scene)
        log(logType,'headfromScene',head)
        if (head != undefined && head != null) {
            let headNextId = mergedSceneOrder.find((item) => item.previousId === head.id && item.type !== COMMENT)?.id;
            head.nextSceneId = scene.nextId
            head.nextId = headNextId ?? null
        }
       
    }
    console.log('finalhead',head)

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

        if (sortedLinkedList.map(item => item?.id).includes(currentItem?.id)) {
            console.error('circular reference in linked list when sorting scene order', currentItem.id)
            currentId = null
        } else if (currentItem) {
            currentId = currentItem.nextId;
            sortedLinkedList.push(copy(currentItem));

        } else {
            currentId = null;
        }
    }

    sortedLinkedList[sortedLinkedList.length - 1].nextId = null; //ensures last item in list has a nextId of null

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

    finalScriptItem.nextFocusId = scene.nextId


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

    let sceneNumber = 0;
    let act = 0;
    const numberedSceneOrder = sceneOrder.map(scene => {
        switch (scene.type) {
            case SHOW: return scene;
            case ACT: act++; return { ...scene, act };
            case SCENE: sceneNumber++; return { ...scene, sceneNumber, act };
            default: return scene;
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
    const alignedSceneOrder = mergedSceneOrder.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId), isViewAsPartPerson: item.partIds.includes(viewAsPartId) }))

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


    //Then do show order update if required
    const sceneUpdates = currentScriptItemUpdates.filter(item => [SHOW, ACT, SCENE].includes(item.type))

    if (sceneUpdates.length > 0) {

        const currentScenes = Object.values(currentScriptItems).filter(item => [SHOW, ACT, SCENE].includes(item.type))

        const mergedScenes = mergeScenes(sceneUpdates, currentScenes)

        const newShowOrder = refreshSceneOrder([], mergedScenes,viewAsPartPerson, currentPartPersons)

        if (newShowOrder) sceneOrderUpdates.push(newShowOrder)
    }

    return { sceneOrderUpdates, previousCurtainUpdates }
}




export const isSceneAffectedByViewAsPartPerson = (scene, viewAsPartPerson, previousViewAsPartPerson, currentPartPersons) => {

    const scenePartPersonIds = scene.partIds.map(partId => currentPartPersons[partId]).map(partPerson => ({ sceneId: scene.id, partId: partPerson?.id, personId: partPerson?.personId }))

    const match = scenePartPersonIds.some(scenePartPerson =>
        scenePartPerson.partId === viewAsPartPerson?.id
        || scenePartPerson.personId === viewAsPartPerson?.id
        || scenePartPerson.personId === previousViewAsPartPerson?.id
        || scenePartPerson.partId === previousViewAsPartPerson?.id
    )

    return match
}


const copy = (object) => {

    if (object === undefined || object === null) {
        return {}
    }
    return JSON.parse(JSON.stringify(object))
}

const mergeScenes = (sceneUpdates, currentScenes) => {
    // Create a map for quick lookup of sceneUpdates
    const sceneUpdatesMap = new Map(sceneUpdates.map(scene => [scene.id, scene]));

    // Iterate over currentScenes, replacing with updates if present
    const mergedScenes = currentScenes.map(scene => {
        const updatedScene = sceneUpdatesMap.get(scene.id);
        return updatedScene ? updatedScene : scene;
    });

    // Add sceneUpdates with IDs not present in currentScenes
    sceneUpdates.forEach(scene => {
        if (!currentScenes.find(s => s.id === scene.id)) {
            mergedScenes.push(scene);
        }
    });

    return mergedScenes;
}