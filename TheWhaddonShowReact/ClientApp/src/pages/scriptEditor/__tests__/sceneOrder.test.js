
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

    part4,
    part5,
    part6,
    part10,

    personA,
    personB,


    show,
    act1,
    scene1, synopsis1, initialStaging1, initialCurtain1, dialogue11, dialogue12, dialogue13, dialogue14,
    scene2, removePart6FromScene2, removePart6FromScene2EarlierDate, synopsis2, initialStaging2, initialCurtain2, dialogue21, dialogue22, dialogue23, dialogue24, dialogue25,
    scene3,
    scene4,
    scene5,
    act2,
    scene6,
    scene7,

    mockSceneOrders,
    mockZIndexSceneOrders,
    mockCurrentPartPersons


} from './mockData'

import { log } from '../../../helper';

it.each([
    //[1,[scene2, synopsis2, dialogue24, dialogue25, dialogue21, dialogue22, initialCurtain2, initialStaging2, dialogue23], [], part6, mockCurrentPartPersons],
    [2,mockSceneOrders[scene2.id], removePart6FromScene2, part6, mockCurrentPartPersons]
])('refreshSceneOrder', (scenario, currentSceneOrder = [], newScriptItems = [], viewAsPartPerson, currentPartPersons) => {

    const debug = false;

    log(debug, 'refreshSceneOrder - input', {currentSceneOrder, newScriptItems, viewAsPartPerson })

    const newSceneOrder = refreshSceneOrder(currentSceneOrder, newScriptItems, viewAsPartPerson, currentPartPersons)

    log(debug, 'newSceneOrder - actual', newSceneOrder)
    //check curtain
    let expectedCurtainOpen = [false,false,false,true,true,true,true,true,true];
    expect(newSceneOrder.map(item => item.curtainOpen)).toEqual(expectedCurtainOpen)

    //check alignRight
    let expectedAlignRight = (scenario === 1)
        ? [true, false, false, false, false, false, true, false, true]
        : [true, false, false, false, false, true, false, true, true];
    expect(newSceneOrder.map(item=> item.alignRight)).toEqual(expectedAlignRight)

    //check zindex
    newSceneOrder.forEach((item, index) => {
        if (index > 0) {
            expect(item.zIndex).toBeLessThan(newSceneOrder[index - 1].zIndex)
        }
    })

})

it.each([
    [1, mockSceneOrders[scene2.id], removePart6FromScene2],
    [2, mockSceneOrders[scene2.id], removePart6FromScene2EarlierDate],
    [3, mockSceneOrders[scene2.id], []]
])('mergeSceneOrder', (scenario, currentSceneOrder = [], newScriptItems = []) => {
    const debug = false;

    log(debug, 'mergeSceneOrder - input', { currentSceneOrder, newScriptItems })
    const newSceneOrder = mergeSceneOrder(currentSceneOrder, newScriptItems)
    log(debug, 'newSceneOrder - actual', newSceneOrder)

    switch (scenario) {
        case 1:
            expect(copy(newSceneOrder[0])).toEqual({ ...copy(currentSceneOrder[0]), partIds: ['p4', 'p5','p6'] })
            expect(newSceneOrder[1]).toEqual(currentSceneOrder[1])
            expect(newSceneOrder[2]).toEqual(currentSceneOrder[2])
            expect(newSceneOrder[3]).toEqual(currentSceneOrder[3])
            expect(newSceneOrder[4]).toEqual(currentSceneOrder[4])
            expect(newSceneOrder[5]).toEqual(currentSceneOrder[5])
            expect(copy(newSceneOrder[6])).toEqual({ ...copy(currentSceneOrder[6]), partIds: [], created: "2023-12-01T00:01:00.000Z" })
            expect(newSceneOrder[7]).toEqual(currentSceneOrder[7])
            expect(copy(newSceneOrder[8])).toEqual({ ...copy(currentSceneOrder[8]), partIds: ['p4', 'p5'], created: "2023-12-01T00:01:00.000Z" })
            break;

        case 2: expect(newSceneOrder).toEqual(currentSceneOrder); break;
        case 3: expect(newSceneOrder).toEqual(currentSceneOrder); break;
        default: break;
    }
})

it.each([
    // [1, mockSceneOrders[scene2.id]],
    [2, mockSceneOrders[show.id]]

])('getHead', (scenario, mergedSceneOrder = []) => {
    const debug = false;

    // log(debug, 'getHead', { currentSceneOrder, mergedSceneOrder })
    const { head, mergedSceneOrderWithUpdatedHead } = getHead(mergedSceneOrder)
    log(debug, 'getHead actual', { head, mergedSceneOrderWithUpdatedHead })
    if (scenario === 1) {
        expect(head.id).toEqual(scene2.id)
        expect(head.nextId).toEqual(synopsis2.id)
    }
    if (scenario === 2) {
        expect(head.id).toEqual(show.id)
        expect(head.nextId).toEqual(act1.id)

        const scene2 = mergedSceneOrderWithUpdatedHead.find(item => item.id === 's2')

        expect(scene2.nextId).toEqual(scene3.id)
    }



})

it.each([
    [1, scene1, [synopsis1, initialCurtain1, dialogue12, dialogue11, dialogue14, dialogue13, initialStaging1, scene1]],
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
    [1, mockZIndexSceneOrders['noExistingZIndexes']],
    [2, mockZIndexSceneOrders['someExistingZIndexes']],
    [3, mockZIndexSceneOrders['closeExistingZindexes']],
    [4, mockZIndexSceneOrders['messedUpZIndexes']],

])('updateZIndex ', (scenario, sortedSceneOrder) => {

    const debug = false;

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


})




it.each([
    [mockSceneOrders[scene1.id], ['p4', 'p5', 'p6', 'p10']]
])('refreshHeaderFocus', (sceneOrder, scenePartIds) => {

    const newSceneOrder = refreshHeaderFocus(sceneOrder, scenePartIds)

    expect(newSceneOrder[0]).toEqual({ ...copy(sceneOrder[0]), previousFocusId: act1.id, nextFocusId: synopsis1.id })
    expect(newSceneOrder[1]).toEqual({ ...copy(sceneOrder[1]), previousFocusId: scene1.id, nextFocusId: part4.id })
    expect(newSceneOrder[2]).toEqual({ ...copy(sceneOrder[2]), previousFocusId: part10.id, nextFocusId: initialCurtain1.id })
    expect(newSceneOrder[3]).toEqual(copy(sceneOrder[3]))
    expect(newSceneOrder[4]).toEqual(copy(sceneOrder[4]))
    expect(newSceneOrder[5]).toEqual(copy(sceneOrder[5]))
    expect(newSceneOrder[6]).toEqual(copy(sceneOrder[6]))
    expect(newSceneOrder[7]).toEqual(copy(sceneOrder[7]))
})


it.each([
    [mockSceneOrders[scene2.id], part4, undefined, [true, false, false, false, true, false, false, true, true]],
    [mockSceneOrders[scene2.id], personA, undefined, [true, false, false, false, true, false, false, true, true]],

    [mockSceneOrders[scene2.id], part5, undefined, [true, false, false, false, false, true, false, true, true]],
    [mockSceneOrders[scene2.id], personB, undefined, [true, false, false, false, false, true, false, true, true]],

    [mockSceneOrders[scene2.id], part6, undefined, [true, false, false, false, false, false, true, false, true]],

    [mockSceneOrders[scene2.id], null, undefined, [true, false, false, false, false, true, false, true, true]], //no matches with viewAsPartPerson so should default to second part of dialogue = part 5.
    [mockSceneOrders[scene2.id], part10, undefined, [true, false, false, false, false, true, false, true, true]], //no matches with viewAsPartPerson so should default to first part = part 5.
    [mockSceneOrders[scene2.id], part6, removePart6FromScene2, [true, false, false, false, false, true, false, true, true]] //no matches with viewAsPartPerson so should default to first part = part 5.

])('alignRight', (sceneOrder, partOrPerson, scriptItemUpdates = [], expectedAlignRight) => {

    const debug = false;


    log(debug, 'alignRight before test', { partOrPerson, mockCurrentPartPersons })
    const actualResult = alignRight(sceneOrder, partOrPerson, mockCurrentPartPersons, scriptItemUpdates)

    log(debug, 'alignRight actualResult: ', actualResult)

    const actualAlignRight = actualResult.map(item => item.alignRight)

    expect(actualAlignRight).toEqual(expectedAlignRight)

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