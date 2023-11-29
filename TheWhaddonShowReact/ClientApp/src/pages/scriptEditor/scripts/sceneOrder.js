
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING,COMMENT } from "../../../dataAccess/scriptItemTypes";
import { getLatest } from '../../../dataAccess/localServerUtils';
import { refreshCurtain } from "./curtain";
import { initial, merge } from "lodash";

import { log } from '../../../helper';

const debug = true;
//Sorts ScriptItems and also works out curtain opening as requires same linked list calculation.
//--------------------------------------------------------------------------------------------------

export function refreshSceneOrder(currentSceneOrder = [], newScriptItems = [], viewAsPartPerson, scenePartPersonIds) {

    const mergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

    const { head, mergedSceneOrderWithUpdatedHead } = getHead(currentSceneOrder, mergedSceneOrder)

    if (Object.keys(head).length === 0) return [] 

    const sortedSceneOrder = sortSceneOrder(head, mergedSceneOrderWithUpdatedHead)

    const zIndexedSceneOrder = updateZIndex(sortedSceneOrder)

    let finalSceneOrder;

    //different processes for different head types
    if (head.type === SCENE) {
        const curtainSceneOrder = (head.type === SCENE) ? refreshCurtain(zIndexedSceneOrder) : zIndexedSceneOrder

        const alignedSceneOrder = (head.type === SCENE) ? alignRight(curtainSceneOrder, viewAsPartPerson, scenePartPersonIds) : curtainSceneOrder

        finalSceneOrder = refreshHeaderFocus(alignedSceneOrder)
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

const mergeSceneOrder = (currentSceneOrder, newScriptItems) => {

    const mergedSceneOrder = getLatest([...currentSceneOrder, ...newScriptItems])

    return mergedSceneOrder;
}


const getHead = (currentSceneOrder, mergedSceneOrder) => {

    let draftHead = null;

    if (currentSceneOrder.length > 0) {
        draftHead = currentSceneOrder[0]
    }
    else {
        const show = mergedSceneOrder.find(item => item.type === SHOW)
        const scene = mergedSceneOrder.find(item => item.type === SCENE)

        if (show) { draftHead = show } else { draftHead = scene }

    }

    if (draftHead === null || draftHead === undefined) {
        log(debug, ('Script:SceneOrder getHead - no head found'))
        const emptyHead = {};
        return {
            head: emptyHead, mergedSceneOrderWithUpdatedHead: []
        }
    }




    //this calculates a new nextId for head to allow it to swap between different linked lists. e.g. a SCene is part ofthe Show linked list but also the head of the Scene linked list
    const headNextId = mergedSceneOrder.filter((item) => item.previousId === draftHead.id && item.type !== COMMENT)[0].id;
    const head = { ...draftHead, nextId: headNextId }
    const mergedSceneOrderWithUpdatedHead = mergedSceneOrder.map(item => {

        if (item.id === head.id) {
            return { ...head }
        } else {
            return item
        }

    })

    return { head, mergedSceneOrderWithUpdatedHead };
}


const sortSceneOrder = (head, unsortedSceneOrder) => {

    //create objectMap of all items in the targetArray
    const idToObjectMap = {};

    for (const item of unsortedSceneOrder) {
        idToObjectMap[item.id] = item;
    }

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


const updateZIndex = (sortedSceneOrder) => {

    const startingZIndex = 1000000;
    const zIndexInterval = 1000;

    let zIndexedSceneOrder = [...sortedSceneOrder]

    const resetZIndex = () => {
        let zIndex = startingZIndex;

        sortedSceneOrder.forEach(item => {
            item.zIndex = zIndex;
            zIndex = zIndex - zIndexInterval;
        })
    }

    const head = sortedSceneOrder[0]
    if (head.zIndex !== startingZIndex) {
        resetZIndex()
    }

    try {

        for (let i = 0; i < sortedSceneOrder.length; i++) {

            const item = sortedSceneOrder[i]

            if (item.zIndex && item.zIndex > 0) {
                //do nothing as z-Index already set and if changed will cause a re-render.
            } else {

                const previousZIndex = zIndexedSceneOrder[i - 1].zIndex
                const nextZIndex = zIndexedSceneOrder[i + 1].zIndex || null

                if (nextZIndex === null) {
                    zIndexedSceneOrder[i].zIndex = previousZIndex - zIndexInterval
                } else {
                    if (previousZIndex - nextZIndex < 2) { throw new Error('not enough space between scriptItems to insert another') }
                    const newZIndex = Math.floor((previousZIndex + nextZIndex) / 2)
                    zIndexedSceneOrder[i].zIndex = newZIndex
                }

            }
        }
    } catch {
        resetZIndex()
    }

    return zIndexedSceneOrder;
}


const refreshHeaderFocus = (sceneOrder, scenePartIds = null) => {


    const scene = sceneOrder.find(item => item.type === SCENE)
    const synopsis = sceneOrder.find(item => item.type === SYNOPSIS)
    const initialStaging = sceneOrder.find(item => item.type === INITIAL_STAGING)
    const partIds = scenePartIds || scene.partIds

    scene.previousFocusId = scene.previousId
    scene.nextFocusId = synopsis.id
    synopsis.previousFocusId = scene.id
    synopsis.nextFocusId = partIds[0]
    initialStaging.previousFocusId = partIds[partIds.length - 1]
    initialStaging.nextFocusId = initialStaging.nextId

    const newSceneOrder = sceneOrder.map(item => {
        if (item.type === SCENE) { return scene }
        if (item.type === SYNOPSIS) { return synopsis }
        if (item.type === INITIAL_STAGING) { return initialStaging }
        return item
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

export const alignRight = (sceneOrder, viewAsPartPerson, scenePartPersonIds, scriptItemUpdates = []) => {

    const mergedSceneOrder = mergeSceneOrder(sceneOrder, scriptItemUpdates)

    //work out alignment
    const partIdsOrder = [...new Set(mergedSceneOrder.map(item => item.partIds[0]))]

    const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

    const righthandPartId = scenePartPersonIds?.find(ids => ids.partId === viewAsPartPerson?.id || ids.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

    const alignedSceneOrder = mergedSceneOrder.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

    return alignedSceneOrder


}
