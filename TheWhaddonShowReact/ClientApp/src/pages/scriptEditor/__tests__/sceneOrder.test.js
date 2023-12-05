
import {
    sortSceneOrder,
    updateZIndex,
    refreshHeaderFocus,
    alignRight,
    refreshSceneOrder,
    mergeSceneOrder,
    getHead,

} from '../scripts/sceneOrder'

import {
    show,
    act1,
    scene1, synopsis1, initialStage1, initialCurtain1, dialogue11, dialogue12, dialogue13, dialogue14,
    scene2,
    scene3,
    scene4,
    scene5,
    act2,
    scene6,
    scene7,

    mockSceneOrders,
    mockZIndexSceneOrders,

} from './mockData'

import { log } from '../../../helper';

xit.each([



])('refreshSceneOrder', (currentSceneOrder = [], newScriptItems = [], viewAsPartPerson, scenePartPersonIds) => {

    //const mergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

    //const { head, mergedSceneOrderWithUpdatedHead } = getHead(currentSceneOrder, mergedSceneOrder)

    //if (Object.keys(head).length === 0) return []

    //const sortedSceneOrder = sortSceneOrder(head, mergedSceneOrderWithUpdatedHead)

    //const zIndexedSceneOrder = updateZIndex(sortedSceneOrder)

    //let finalSceneOrder;

    ////different processes for different head types
    //if (head.type === SCENE) {
    //	const curtainSceneOrder = (head.type === SCENE) ? refreshCurtain(zIndexedSceneOrder) : zIndexedSceneOrder

    //	const alignedSceneOrder = (head.type === SCENE) ? alignRight(curtainSceneOrder, viewAsPartPerson, scenePartPersonIds) : curtainSceneOrder

    //	finalSceneOrder = refreshHeaderFocus(alignedSceneOrder)
    //}

    //if (head.type === SHOW) {
    //	finalSceneOrder = addSceneNumbers(zIndexedSceneOrder)
    //}

    //if (finalSceneOrder) {
    //	return finalSceneOrder;
    //} else {
    //	return []
    //}


})

xit.each([


])('mergeSceneOrder', (currentSceneOrder = [], newScriptItems = []) => {

    //const actualMergedSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)

    //expect(mergedSceneOrder).toEqual([...currentSceneOrder, ...newScriptItems])

})

xit.each([


])('getHead', (currentSceneOrder = [], mergedSceneOrder = []) => {

    const { head, mergedSceneOrderWithUpdatedHead } = getHead(currentSceneOrder, mergedSceneOrder)

    //export const getHead = (currentSceneOrder, mergedSceneOrder) => {

    //    let draftHead = null;

    //    if (currentSceneOrder.length > 0) {
    //        draftHead = currentSceneOrder[0]
    //    }
    //    else {
    //        const show = mergedSceneOrder.find(item => item.type === SHOW)
    //        const scene = mergedSceneOrder.find(item => item.type === SCENE)

    //        if (show) { draftHead = show } else { draftHead = scene }

    //    }

    //    if (draftHead === null || draftHead === undefined) {
    //        log(debug, ('Script:SceneOrder getHead - no head found'))
    //        const emptyHead = {};
    //        return {
    //            head: emptyHead, mergedSceneOrderWithUpdatedHead: []
    //        }
    //    }
    ////this calculates a new nextId for head to allow it to swap between different linked lists. e.g. a SCene is part ofthe Show linked list but also the head of the Scene linked list
    //const headNextId = mergedSceneOrder.filter((item) => item.previousId === draftHead.id && item.type !== COMMENT)[0].id;
    //const head = { ...draftHead, nextId: headNextId }
    //const mergedSceneOrderWithUpdatedHead = mergedSceneOrder.map(item => {

    //    if (item.id === head.id) {
    //        return { ...head }
    //    } else {
    //        return item
    //    }

    //})

    //return { head, mergedSceneOrderWithUpdatedHead };
    expect(head).toEqual(mergedSceneOrder[0])
    expect(mergedSceneOrderWithUpdatedHead).toEqual(mergedSceneOrder)

})

it.each([
    [1, scene1, [synopsis1, initialCurtain1, dialogue12, dialogue11, dialogue14, dialogue13, initialStage1, scene1]],
    [2, show, [scene1, scene3, act1, act2, scene7, scene2, show, scene6, scene5, scene4]]
])('sortSceneOrder', (scenario, draftHead, unsortedSceneOrder) => {

    const debug = false;


    const head = (scenario === 1) ? { ...copy(draftHead), nextId: synopsis1.id } : copy(draftHead) //handles two different linked lists for scenes

    let expectedSceneOrder;

    if (scenario === 1) {
        expectedSceneOrder = mockSceneOrders[scene1.id].map(item => {
            if (item.id === head.id) {
                return head
            } else {
                return copy(item);
            }
        })
    }

    if (scenario === 2) {
        expectedSceneOrder = mockSceneOrders[show.id].map(item => copy(item))
    }



    //log(debug, 'sortSCeneOrder', { head, unsortedSceneOrder })

    const actualSortedSceneOrder = sortSceneOrder(head, unsortedSceneOrder).map(item => copy(item))

    log(debug, 'sortSceneOrder', { actualSortedSceneOrder, expectedSceneOrder })

    //log(debug,'expectedSortedSceneOrder',expectedIds)

    expect(actualSortedSceneOrder).toEqual(expectedSceneOrder)

})


it.each([
    //[1,mockZIndexSceneOrders['noExistingZIndexes']],
    [2, mockZIndexSceneOrders['someExistingZIndexes']],
    //[3, mockZIndexSceneOrders['closeExistingZindexes']],
    //[4, mockZIndexSceneOrders['messedUpZIndexes']],

])('updateZIndex ', (scenario, sortedSceneOrder) => {

    const debug = true;

    const zIndexedSceneOrder = updateZIndex(sortedSceneOrder)
    log(debug, 'updateZIndex', { zIndexedSceneOrder })


    expect(zIndexedSceneOrder[0].zIndex).toEqual(1000000)

    //zIndex decreases as index increases
    zIndexedSceneOrder.forEach((item, index) => {
        if (index > 0) {
            expect(item.zIndex).toBeLessThan(zIndexedSceneOrder[index - 1].zIndex)
        }
    })

    //check preservation of original zIndexes
    if (scenario === 2) {
        expect(zIndexedSceneOrder[0].zIndex).toEqual(1000000) //these match the zindexs set in mock data.
        expect(zIndexedSceneOrder[1].zIndex).toEqual(900000)
        expect(zIndexedSceneOrder[3].zIndex).toEqual(800000)
        expect(zIndexedSceneOrder[4].zIndex).toEqual(300000)
        expect(zIndexedSceneOrder[6].zIndex).toEqual(25000)
    }

    //for (let index = 0; index < zIndexedSceneOrder.length; index++) {
    //	expect(zIndexedSceneOrder[index].zIndex).toEqual(sortedSceneOrder[index].zIndex || zIndexedSceneOrder[index].zindex)
    //}

})




xit.each([

])('refreshHeaderFocus', (sceneOrder, scenePartIds) => {

    //export const refreshHeaderFocus = (sceneOrder, scenePartIds = null) => {
    //const scene = sceneOrder.find(item => item.type === SCENE)
    //const synopsis = sceneOrder.find(item => item.type === SYNOPSIS)
    //const initialStaging = sceneOrder.find(item => item.type === INITIAL_STAGING)
    //const partIds = scenePartIds || scene.partIds

    //scene.previousFocusId = scene.previousId
    //scene.nextFocusId = synopsis.id
    //synopsis.previousFocusId = scene.id
    //synopsis.nextFocusId = partIds[0]
    //initialStaging.previousFocusId = partIds[partIds.length - 1]
    //initialStaging.nextFocusId = initialStaging.nextId

    //const newSceneOrder = sceneOrder.map(item => {
    //	if (item.type === SCENE) { return scene }
    //	if (item.type === SYNOPSIS) { return synopsis }
    //	if (item.type === INITIAL_STAGING) { return initialStaging }
    //	return item
    //})

    //return newSceneOrder;

})


xit.each([

])('alignRight', (sceneOrder, viewAsPartPerson, scenePartPersonIds, scriptItemUpdates = []) => {

    //const mergedSceneOrder = mergeSceneOrder(sceneOrder, scriptItemUpdates)

    ////work out alignment
    //const partIdsOrder = [...new Set(mergedSceneOrder.map(item => item.partIds[0]).filter(id => id !== undefined))]

    //const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

    //const righthandPartId = scenePartPersonIds?.find(ids => ids.partId === viewAsPartPerson?.id || ids.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

    //const alignedSceneOrder = mergedSceneOrder.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

    //return alignedSceneOrder


})


xit.each([

])('getSceneORderUpdates', (currentScriptItemUpdates, currentScriptItems, sceneOrders) => {

    //const sceneIds = [currentScriptItemUpdates.map(item => item.parentId)]
    //const uniqueSceneIds = [...new Set(sceneIds)]

    ////output variables
    //let sceneOrderUpdates = []
    //let previousCurtainUpdates = []

    //uniqueSceneIds.forEach(sceneId => {

    //	const nextSceneIdFromScriptItemUpdates = currentScriptItemUpdates.find(item => item.id === sceneId)?.nextId || null
    //	const nextSceneId = nextSceneIdFromScriptItemUpdates || currentScriptItems[sceneId]?.nextId || null

    //	const newSceneScriptItems = currentScriptItemUpdates.filter(item => item.parentId === sceneId || item.id === sceneId)
    //	const newSceneOrder = refreshSceneOrder(sceneOrders[sceneId], newSceneScriptItems)

    //	if (newSceneOrder.length > 0) { //this can occur if the scene is inActive
    //		sceneOrderUpdates.push(newSceneOrder)

    //		if (nextSceneId) {
    //			const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1]?.curtainOpen;
    //			previousCurtainUpdates.push({ sceneId: nextSceneId, previousCurtainOpen })
    //		}
    //	}
    //})

    //return { sceneOrderUpdates, previousCurtainUpdates }
})



xit.each([

])('alignRightIfAffectedByViewAsPartPerson', (scene, viewAsPartPerson, sceneOrders, currentPartPersons) => {

    //const scenePartPersonIds = scene.partIds.map(partId => currentPartPersons[partId]).map(partPerson => ({ sceneId: scene.id, partId: partPerson.id, personId: partPerson.personId }))

    //const matchesPart = scenePartPersonIds.some(partPerson => partPerson.partId === viewAsPartPerson.id)

    //if (!matchesPart) {
    //	const matchesPerson = scenePartPersonIds.some(partPerson => partPerson.personId === viewAsPartPerson.id)
    //	if (!matchesPerson) return [];
    //}

    //const newSceneOrder = alignRight(sceneOrders[scene.id], viewAsPartPerson, scenePartPersonIds)

    //return newSceneOrder
})


const copy = (object) => {
    return JSON.parse(JSON.stringify(object));
}