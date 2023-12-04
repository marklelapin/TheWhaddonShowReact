import { ABOVE, BELOW, END, START } from '../scripts/utility';
import {
    show,

    scene1,
    scene2,
    scene3,
    scene7,

    part1,
    part2,
    part3,
    part4,
    part5,
    part6,
    part13,
    partFromServer,
    newPart1FromServer,
    earlierPart1FromServer,
    newInactivePart1FromServer,

    dialogue11,
    dialogue12,
    dialogue13,
    dialogue14,

    mockSceneOrders,
    mockCurrentScriptItems,
    mockCurrentPartPersons,
    mockStoredPersons,
} from './mockData'

import {
    newUpdatesForAddPart,
    newUpdatesForDeletePart,
    newUpdatesForDeleteNextPart,
    newPartPersonsFromPersonUpdates,
    newPartPersonsFromPartUpdates
} from '../scripts/part'

import { log } from '../../../helper'

it.each([
    [1, BELOW, part5, 'changedText', scene2], //p5 = middle partID
    [2, BELOW, part5, '', scene2],
    [3, BELOW, part5, null, scene2],
    [4, ABOVE, part5, null, scene2],
    [5, ABOVE, part4, null, scene2], //above the first partId
    [6, BELOW, part6, null, scene2] //below the last partId
])
    ('newUpdatesForAddPart: %s', (scenario, position, part, tempTextValue, scene) => {

        const { newPartUpdates, newScriptItemUpdates } = newUpdatesForAddPart(position, part, tempTextValue, scene)

        const newPart = newPartUpdates[newPartUpdates.length - 1]

        //check lengths
        if (scenario <= 2) {
            expect(newPartUpdates.length).toBe(2)
        } else {
            expect(newPartUpdates.length).toBe(1)
        }

        switch (scenario) {
            case 1:
                expect(newPartUpdates[0]).toEqual({ ...copy(part), name: 'changedText' })
                expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: ['p4', 'p5', newPart.id, 'p6'] }]);
                break;
            case 2:
                expect(copy(newPartUpdates[0])).toEqual({ ...copy(part), name: '' })
                expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: ['p4', 'p5', newPart.id, 'p6'] }]); break;
            case 3: expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: ['p4', 'p5', newPart.id, 'p6'] }]); break;
            case 4: expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: ['p4', newPart.id, 'p5', 'p6'] }]); break;
            case 5: expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: [newPart.id, 'p4', 'p5', 'p6'] }]); break;
            case 6: expect(copy(newScriptItemUpdates)).toEqual([{ ...copy(scene2), partIds: ['p4', 'p5', 'p6', newPart.id] }]); break;
            default: break;
        }
    })

it.each([
    [1, part4, scene3, mockSceneOrders, mockCurrentScriptItems, show], //only 1 part in scene
    [2, part4, scene1, mockSceneOrders, mockCurrentScriptItems, show], //part does not exist in scene.
    [3, part1, scene1, mockSceneOrders, mockCurrentScriptItems, show], //part deleted is allocated in scene so shouldn't be deleted.
    [4, part13, scene3, mockSceneOrders, mockCurrentScriptItems, show], //part not allocated anywhere so should be deleted.
    [5, part5, scene3, mockSceneOrders, mockCurrentScriptItems, show], //part not allocated in scene but allocated elsewhere.
])
    ('newUpdatesForDeletePart', (scenario, partToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show) => {

        window.alert = jest.fn() //ignores alert messages

        const actualResult = newUpdatesForDeletePart(partToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show)
        const actualPartUpdates = actualResult.newPartUpdates
        const actualScriptItemUpdates = actualResult.newScriptItemUpdates

        if (scenario <= 3) {
            expect(actualPartUpdates).toEqual([])
            expect(actualScriptItemUpdates).toEqual([])
        }

        if (scenario === 4) {
            expect(actualPartUpdates.length).toEqual(1) //not allocated anywhere else so should be deleted
            expect(actualScriptItemUpdates.length).toEqual(1) //not allocatd in scene so can be removed from scene update
            expect(actualPartUpdates[0]).toEqual({ ...copy(part13), isActive: false })
            expect(actualScriptItemUpdates[0]).toEqual({ ...copy(scene3), partIds: ['p4', 'p5'] })
        }

        if (scenario === 5) {
            expect(actualPartUpdates.length).toEqual(0) //allocated elsewhere so should not be deleted
            expect(actualScriptItemUpdates.length).toEqual(1)
            expect(actualScriptItemUpdates[0]).toEqual({ ...copy(scene3), partIds: ['p4', 'p13'] })
        }

    })


it.each([
    [1, part5, scene3, mockSceneOrders, mockCurrentScriptItems, show, mockCurrentPartPersons],
    [2, part13, scene3, mockSceneOrders, mockCurrentScriptItems, show, mockCurrentPartPersons] //last partId so should just return nothing
])('newUpdatesForDeleteNextPart', (scenario, partPriorToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show, currentPartPersons) => {

    window.alert = jest.fn() //ignores alert messages

    const actualResult = newUpdatesForDeleteNextPart(partPriorToDelete, sceneToDeleteFrom, sceneOrders, currentScriptItems, show, currentPartPersons)
    const actualPartUpdates = actualResult.newPartUpdates
    const actualScriptItemUpdates = actualResult.newScriptItemUpdates

    if (scenario === 1) {
        expect(actualPartUpdates.length).toEqual(1) //not allocated anywhere else so should be deleted
        expect(actualScriptItemUpdates.length).toEqual(1) //not allocatd in scene so can be removed from scene update
        expect(actualPartUpdates[0]).toEqual({ ...copy(part13), isActive: false })
        expect(actualScriptItemUpdates[0]).toEqual({ ...copy(scene3), partIds: ['p4', 'p5'] })
    }

    if (scenario === 2) { //part 13 is last part so should just return nothing
        expect(actualPartUpdates.length).toEqual(0)
        expect(actualScriptItemUpdates.length).toEqual(0)
    }
})

xit.each([
    
]) ('getDeleteMoveFocus', (partToDelete, scene, direction, previousFocusId, nextFocusId) => {

        //    let newFocusId = null;
        //    let newFocusPosition = END;

        //    if (direction === UP && previousPart(partToDelete, scene)) {
        //        newFocusId = previousPart(partToDelete).id
        //        newFocusPosition = END
        //    } else if (direction === UP && !previousPart(partToDelete)) {
        //        newFocusId = previousFocusId;
        //        newFocusPosition = END
        //    } else if (direction === DOWN && nextPart(partToDelete)) {
        //        newFocusId = nextPart(partToDelete).id
        //        newFocusPosition = START
        //    } else if (direction === DOWN && !nextPart(partToDelete)) {
        //        newFocusId = nextFocusId;
        //        newFocusPosition = START
        //    }

        //    return { id: newFocusId, position: newFocusPosition }
        //}

    })

xit.each([
    [1, [partFromServer], mockCurrentPartPersons, mockStoredPersons],
    [2, [partFromServer], [], []],
    [3, [partFromServer], mockCurrentPartPersons, []],
    [4, [partFromServer], [], mockStoredPersons],
    [5, [newPart1FromServer], mockCurrentPartPersons, mockStoredPersons],
    [6, [newPart1FromServer], mockCurrentPartPersons, []],
    [7, [earlierPart1FromServer], [], mockStoredPersons],
    [8, [earlierPart1FromServer], mockCurrentPartPersons, mockStoredPersons],
    [9, [newInactivePart1FromServer], mockCurrentPartPersons, mockStoredPersons],
    [10, [partFromServer, newPart1FromServer], mockCurrentPartPersons, mockStoredPersons]

])  ('newPartPersonsFromPartUpdates', (scenario, partUpdates, currentPartPersons, storedPersons) => {
        const debug = true;

        log(debug, 'newPartPersonsFromPartUpdates', { scenario, partUpdates })

        const actualResult = newPartPersonsFromPartUpdates(partUpdates, currentPartPersons, storedPersons)
        

        if (scenario <= 8) {
            expect(actualResult.length).toEqual(1)
            //const result = copy(actualResult[0])
            //const pfs = copy(partFromServer)
            //if (scenario ===1) expect(result).toEqual({...pfs, avatarInitials : 'P', firstName:'PartFromServer',personName: null,pictureRef : null })
            //if (scenario === 2) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 3) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 4) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 5) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 6) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 7) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })
            //if (scenario === 8) expect(result).toEqual({ ...pfs, avatarInitials: 'P', firstName: 'PartFromServer', personName: null, pictureRef: null })

        } else if (scenario === 8) {
            expect(actualResult.length).toEqual(0)
        } else if (scenario === 9) {
            expect(actualResult.length).toEqual(1)
        } else if (scenario === 10) {
            expect(actualResult.length).toEqual(2)
        }

    })

xit.each([
    [partFromServer,]

]) ('newPartPersonsFromPersonUpdates', (personUpdates, currentPartPersons) => {

    })
//export const NewPartPersonsFromPartUpdates = (partUpdates, currentPartPersons, storedPersons) => {

//    const currentPartUpdates = partUpdates.filter(update => new Date(update.created) > new Date(currentPartPersons[update.id]?.created || 0))
//    const latestCurrentPartUpdates = getLatest(currentPartUpdates)
//    const persons = getLatest(storedPersons)

//    const newPartPersons = latestCurrentPartUpdates.map(partUpdate => {
//        const person = persons.find(person => person.id === partUpdate.personId) || null
//        const partPerson = addPersonInfo(partUpdate, person)
//        return partPerson;
//    });

//    return newPartPersons
//}


//export const newPartPersonsFromPersonUpdates = (personUpdates, currentPartPersons) => {
//    const latestPersonUpdates = getLatest(personUpdates, true)

//    const newPartPersons = []
//    for (const key in currentPartPersons) {
//        if (currentPartPersons.hasOwnProperty(key)) {
//            const part = currentPartPersons[key]
//            const newPerson = latestPersonUpdates.find(item => item.id === part.personId)
//            if (newPerson) {
//                newPartPersons.push(addPersonInfo(part, newPerson))
//            }

//        }
//    }

//    return newPartPersons;
//}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}