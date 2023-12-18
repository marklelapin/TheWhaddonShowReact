import {
    UPDATE_TEXT, UPDATE_PART_IDS, UPDATE_TAGS,
    ADD_TAG, REMOVE_TAG, UPDATE_ATTACHMENTS, UPDATE_TYPE,
    TOGGLE_CURTAIN,
    ADD_COMMENT, DELETE_COMMENT, ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM, DELETE_NEXT_SCRIPT_ITEM,
    ADD_SCENE, DELETE_SCENE, MOVE_SCENE, ADD_PART_TAG,
    REMOVE_PART_TAG, UPDATE_PART_NAME, ALLOCATE_PERSON_TO_PART,
    ADD_PART, DELETE_PART, DELETE_NEXT_PART, SWAP_PART
} from '../../../actions/scriptEditor';

import {
    part1,
    part2,
    part3,
    part5,
    part10,
    part13,

    dialogue11,
    dialogue13,
    dialogue14,

    dialogue21,
    dialogue22,
    dialogue23,
    dialogue24,
    dialogue25,

    initialStaging3,

    scene1,
    scene2,
    scene3,
    scene4,
    scene7,

    personA,

    mockCurrentScriptItems as currentScriptItems,
    mockSceneOrders as sceneOrders,
    mockCurrentPartPersons as currentPartPersons,
    mockStoredPersons as storedPersons,
    mockPreviousCurtainOpen as previousCurtainOpen,
    show,
    comment25
} from './mockData'

import { getTriggerUpdates } from '../scripts/trigger'

import { CURTAIN, LIGHTING, SOUND, DIALOGUE, OPEN_CURTAIN, CLOSE_CURTAIN } from '../../../dataAccess/scriptItemTypes'
import { START, END, ABOVE, BELOW, UP, DOWN } from '../scripts/utility'
import { log } from '../../../logging'

const anyValue = expect.anything()

it(UPDATE_TEXT, (scriptItem = dialogue11, tempText = 'new text') => {
    const debug = false;

    const trigger = dispatchTrigger(UPDATE_TEXT, { scriptItem, value: tempText }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TEXT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, text: 'new text' }])
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si12", "position": "end" })

})

it(UPDATE_PART_IDS, (scriptItem = dialogue11, selectedPartIds = ['p1', 'p7']) => {
    const debug = false;

    const trigger = dispatchTrigger(UPDATE_PART_IDS, { scriptItem, value: selectedPartIds }) //this should be direct match with call in code.

    log(debug, 'UPDATE_PART_IDS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show, part1)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, partIds: ['p1', 'p7'] }])
    expect(sceneOrderUpdates.length).toEqual(scriptItemUpdates.length)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si11", "position": "end" })

})

it(UPDATE_TAGS, (scriptItem = dialogue11, tags = ['white', 'red']) => {
    const debug = false;

    const trigger = dispatchTrigger(UPDATE_TAGS, { scriptItem, value: tags }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TAGS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, tags: ['white', 'red'] }])
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si11", "position": "end" })

})

it(ADD_TAG, (scriptItem = dialogue11, tag = 'red') => {
    const debug = false;

    const trigger = dispatchTrigger(ADD_TAG, { scriptItem, tag }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TAGS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, tags: ['blue', 'green', 'red'] }])
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si11", "position": "end" })

})

it(REMOVE_TAG, (scriptItem = dialogue11, tag = 'green') => {
    const debug = false;

    const trigger = dispatchTrigger(REMOVE_TAG, { scriptItem, tag }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TAGS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, tags: ['blue'] }])
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si11", "position": "end" })

})



it.each([
    [dialogue11, LIGHTING],
    [dialogue14, CURTAIN],
    [dialogue13, DIALOGUE] // going from curtain.

])(UPDATE_TYPE, (scriptItem, type) => {
    const debug = false;

    const trigger = dispatchTrigger(UPDATE_TYPE, { scriptItem, value: type }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TAGS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)
    log(debug, 'UPDATE_TYPE actualResult', { actualResult })
    log(debug, 'UPDATE_TYPE actualResult PreviousCurtainUpdates', { previousCurtainUpdates: actualResult.previousCurtainUpdates })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(showComments).toEqual(null)


    if (type === LIGHTING) {
        expect(scriptItemUpdates).toEqual([{ ...copy(dialogue11), created: anyValue, type: LIGHTING }])
        expect(sceneOrderUpdates).toEqual([])
        expect(previousCurtainUpdates).toEqual([])
        expect(moveFocus).toEqual({ "id": "si11", "position": "end" })
    }

    if (type === CURTAIN) {
        expect(scriptItemUpdates).toEqual([{ ...copy(dialogue14), created: anyValue, type: CURTAIN, tags: [OPEN_CURTAIN]}])
        expect(sceneOrderUpdates.length).toBeGreaterThan(0)
        expect(previousCurtainUpdates).toEqual([{ sceneId: scene2.id, previousCurtainOpen: true }])
        expect(moveFocus).toEqual({ "id": "si14", "position": "end" })
    }

    if (type === DIALOGUE) { //coming from curtain type
        expect(scriptItemUpdates).toEqual([{ ...copy(dialogue13), created: anyValue, type: DIALOGUE, tags: [], text: '' }])
        log(debug, 'UPDATE_TYPE sceneOrderUpdates', { newSceneOrder: sceneOrderUpdates[0] })
        expect(sceneOrderUpdates.length).toEqual(1)
        log(debug, 'UPDATE_TYPE previousCurtainUpdates', { previousCurtainUpdates })
        expect(previousCurtainUpdates).toEqual([{ sceneId: scene2.id, previousCurtainOpen: true }])
        expect(moveFocus).toEqual({ "id": "si13", "position": "end" })
    }

})


it(TOGGLE_CURTAIN, (scriptItem = dialogue13) => {
    const debug = false;

    const trigger = dispatchTrigger(TOGGLE_CURTAIN, { scriptItem }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TAGS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue13, created: anyValue, tags: [OPEN_CURTAIN] }])
    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([{ sceneId: scene2.id, previousCurtainOpen: true }])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si13", "position": "end" })

})

it(ADD_COMMENT, (scriptItem = dialogue21) => {
    const debug = false;

    const trigger = dispatchTrigger(ADD_COMMENT, { scriptItem }) //this should be direct match with call in code.

    log(debug, 'UPDATE_COMMENT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_COMMENT actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates.length).toEqual(2)
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(true)
    expect(moveFocus).toEqual(null)
})

it(DELETE_COMMENT, (scriptItem = comment25) => {
    const debug = false;

    const trigger = dispatchTrigger(DELETE_COMMENT, { scriptItem }) //this should be direct match with call in code.

    log(debug, 'UPDATE_COMMENT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_COMMENT actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates.length).toEqual(2)
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ id: dialogue25.id, position: END })
})

it.each([
    [1, dialogue23, ABOVE, 'changedText'],
    [2, dialogue23, BELOW, 'changedText'],

])(ADD_SCRIPT_ITEM, (scenario, scriptItem, position, tempTextValue) => {
    const debug = false;

    const trigger = (scenario === 3) ? dispatchTrigger(ADD_SCRIPT_ITEM, { scriptItem }) : dispatchTrigger(ADD_SCRIPT_ITEM, { position, scriptItem, tempTextValue })//this should be direct match with call in code.

    log(debug, 'UPDATE_COMMENT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_COMMENT actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates.length).toEqual(3)
    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)

    expect(moveFocus).toEqual(null)

})

it.each([
    [1, dialogue23, UP],
    [2, dialogue23, DOWN],
    [3, dialogue23, undefined]

])(DELETE_SCRIPT_ITEM, (scenario, scriptItem, direction) => {
    const debug = false;

    const trigger = dispatchTrigger(DELETE_SCRIPT_ITEM, { scriptItem, direction })

    log(debug, 'UPDATE_COMMENT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_COMMENT actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates.length).toEqual(3)
    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)

    if (scenario === 1) expect(moveFocus).toEqual({ id: dialogue22.id, position: END })
    if (scenario === 2) expect(moveFocus).toEqual({ id: dialogue24.id, position: START })
    if (scenario === 3) expect(moveFocus).toEqual({ id: dialogue24.id, position: START })

})

it.each([
    [1, dialogue23, UP]

])(DELETE_NEXT_SCRIPT_ITEM, (scenario, scriptItem, direction) => {
    const debug = false;

    const trigger = dispatchTrigger(DELETE_NEXT_SCRIPT_ITEM, { scriptItem, direction })

    log(debug, 'UPDATE_COMMENT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_COMMENT actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates.length).toEqual(3)
    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)

    if (scenario === 1) expect(moveFocus).toEqual({ id: dialogue23.id, position: END })


})


it.each([
    [scene2]

])(ADD_SCENE, (scene) => {
    const debug = false;

    const trigger = dispatchTrigger(ADD_SCENE, { scriptItem: scene })

    log(debug, 'ADD_SCENE trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'ADD_SCENE actualResult', { previousCurtainUpdates: actualResult.previousCurtainUpdates })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    const newSceneId = scriptItemUpdates.find(item => item.previousId === scene.id).id

    log(debug, 'ADD_SCENE newSceneId', { newSceneId })
    expect(partUpdates.length).toEqual(1)
    expect(partPersonUpdates.length).toEqual(1)
    expect(scriptItemUpdates.length).toEqual(7)
    expect(sceneOrderUpdates.length).toEqual(2)
    expect(previousCurtainUpdates).toEqual([{ sceneId: newSceneId, previousCurtainOpen: true }, { sceneId: scene3.id, previousCurtainOpen: true }])
    expect(showComments).toEqual(null)

    expect(moveFocus).toEqual({ id: newSceneId, position: END })

})


it.each([
    [scene2]

])(DELETE_SCENE, (scriptItem) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(DELETE_SCENE, { scriptItem })

    log(debug, 'DELETE_SCENE trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'DELETE_SCENE actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult



    expect(partUpdates.length).toEqual(0)
    expect(partPersonUpdates.length).toEqual(0)
    expect(scriptItemUpdates.length).toEqual(3)
    expect(sceneOrderUpdates.length).toEqual(1) //just one update = showOrder
    expect(previousCurtainUpdates).toEqual([{ sceneId: scriptItem.nextId, previousCurtainOpen: true }])
    expect(showComments).toEqual(null)

    expect(moveFocus).toEqual({ id: scene3.id, position: END })

})

xit.each([
   [1, scene1.id, scene3.id],
  [2, scene1.id, scene7.id],
    [3, scene7.id, scene1.id],
])(MOVE_SCENE, (scenario,sceneId, newPreviousId) => {
    const debug = false;

    const trigger = dispatchTrigger(MOVE_SCENE, { sceneId, value: newPreviousId })

   // log(debug, 'MOVE_SCENE trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    //log(debug, 'MOVE_SCENE actualResult', { actualResult })


    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    let expectedPreviousCurtain;
    switch (scenario) {
        case 1: expectedPreviousCurtain = [{ sceneId: scene1.id, previousCurtainOpen: false }, { sceneId: scene4.id, previousCurtainOpen: true },{ sceneId: scene2.id, previousCurtainOpen: false }];  break;
        case 2: expectedPreviousCurtain = [{ sceneId: scene1.id, previousCurtainOpen: false }, { sceneId: '0', previousCurtainOpen: false }, {sceneId: scene2.id, previousCurtainOpen: false}]; break;
        case 3: expectedPreviousCurtain = [{ sceneId: scene7.id, previousCurtainOpen: true }, { sceneId: scene2.id, previousCurtainOpen: false }, { sceneId: '0', previousCurtainOpen: false }]; break;
        default: break;
    }

    log(debug, 'MOVE_SCENE curtainupates',{expectedPreviousCurtain,previousCurtainUpdates})

    const expectedScriptItemsLength = (scenario ===1) ? 5 : 4

    const expectedMoveFocusId = (scenario === 3) ? scene7.id : scene1.id

    expect(partUpdates.length).toEqual(0)
    expect(partPersonUpdates.length).toEqual(0)
    expect(scriptItemUpdates.length).toEqual(expectedScriptItemsLength)
    expect(sceneOrderUpdates.length).toEqual(1)
    const showOrder = sceneOrderUpdates[0]
    //log(debug, 'MOVE_SCENE showOrder', { showOrder })
    expect(showOrder[0].id).toEqual(show.id) //just one update = showOrder
    expect(previousCurtainUpdates).toEqual(expectedPreviousCurtain)
    expect(showComments).toEqual(null)

    expect(moveFocus).toEqual({ id: expectedMoveFocusId, position: END })

})


//        case MOVE_SCENE:
//const newPreviousId = value;
//scriptItemUpdates = newScriptItemsForMoveScene(scene, newPreviousId, currentScriptItems)
//doRefreshShowOrder = true;
//moveFocus = { id: sceneId, position: END };
//break;




it.each([
    [1, ABOVE, scene1.id, part2.id, 'newName'],
    [2, BELOW, scene1.id, part2.id, null],

])(ADD_PART, (scenario, position, sceneId, partId, tempName) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(ADD_PART, { position, sceneId, partId, tempTextValue: tempName })

    log(debug, 'ADD_PART trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'ADD_PART actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    const newPartId = partUpdates.find(item => item.id !== part2.id).id

    expect(scriptItemUpdates.length).toEqual(1)
    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual(null)


    if (scenario === 1) {
        expect(scriptItemUpdates[0].partIds).toEqual([part1.id, newPartId, part2.id, part3.id])
        expect(partUpdates.length).toEqual(2)
        expect(partPersonUpdates.length).toEqual(2)
    }

    if (scenario === 2) {
        expect(partUpdates.length).toEqual(1)
        expect(partPersonUpdates.length).toEqual(1)
        expect(scriptItemUpdates[0].partIds).toEqual([part1.id, part2.id, newPartId, part3.id])
    }

})

it(ADD_PART_TAG, (partId = part2.id, tag = 'blue') => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(ADD_PART_TAG, { partId, tag })

    log(debug, 'ADD_PART_TAG trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'ADD_PART_TAG actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates.length).toEqual(1)
    expect(partPersonUpdates.length).toEqual(1)
    expect(scriptItemUpdates).toEqual([])
    expect(sceneOrderUpdates).toEqual([]) //just one update = showOrder
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ id: part2.id, position: END })

    expect(partUpdates[0].tags).toEqual(['red', 'orange', 'blue'])

})

it(REMOVE_PART_TAG, (partId = part2.id, tag = 'red') => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(REMOVE_PART_TAG, { partId, tag })

    log(debug, 'REMOVE_PART_TAG trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'REMOVE_PART_TAG actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates.length).toEqual(1)
    expect(partPersonUpdates.length).toEqual(1)
    expect(scriptItemUpdates).toEqual([])
    expect(sceneOrderUpdates).toEqual([]) //just one update = showOrder
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ id: part2.id, position: END })

    expect(partUpdates[0].tags).toEqual(['orange'])

})


it(UPDATE_PART_NAME, (partId = part2.id, tempName = 'newName') => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(UPDATE_PART_NAME, { partId, value: tempName })

    log(debug, 'UPDATE_PART_NAME trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'UPDATE_PART_NAME actualResult', { actualResult })
    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates.length).toEqual(1)
    expect(partPersonUpdates.length).toEqual(1)
    expect(scriptItemUpdates).toEqual([])
    expect(sceneOrderUpdates).toEqual([]) //just one update = showOrder
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ id: part2.id, position: END })

    expect(partUpdates[0].name).toEqual('newName')

})


it(ALLOCATE_PERSON_TO_PART, (partId = part2.id, person = personA) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(ALLOCATE_PERSON_TO_PART, { partId, personId: person.id })

    log(debug, 'ALLOCATE_PERSON_TO_PART trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'ALLOCATE_PERSON_TO_PART actualResult', { actualResult })

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(partUpdates.length).toEqual(1)
    expect(partPersonUpdates.length).toEqual(1)
    expect(scriptItemUpdates).toEqual([])
    expect(sceneOrderUpdates.length).toBeGreaterThan(0)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ id: part2.id, position: END })

    expect(partUpdates[0].personId).toEqual(personA.id)

})

it.each([
    [1, UP, scene3.id, part13.id],
    [2, DOWN, scene3.id, part13.id],

])(DELETE_PART, (scenario, direction, sceneId, partId) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(DELETE_PART, { direction, sceneId, partId })

    log(debug, 'DELETE_PART trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'DELETE_PART actualResult', { actualResult })


    const {
        partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(scriptItemUpdates.length).toEqual(1)
    expect(scriptItemUpdates[0].partIds).toEqual(['p4', 'p5'])

    expect(partUpdates.length).toEqual(1) //because Part13 is not allocated elsewhere (could be zero in other circumstances)
    expect(partPersonUpdates.length).toEqual(1)

    expect(sceneOrderUpdates.length).toEqual(1)
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)


    if (scenario === 1) expect(moveFocus).toEqual({ id: `part-${part5.id}-scene-${scene3.id}`, position: END })

    if (scenario === 2) expect(moveFocus).toEqual({ id: initialStaging3.id, position: START })

})


it.each([
    [1, UP, scene3.id, part5.id],
    [2, DOWN, scene3.id, part5.id],

])(DELETE_NEXT_PART, (scenario, direction, sceneId, partId) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(DELETE_NEXT_PART, { direction, sceneId, partId })

    log(debug, 'DELETE_NEXT_PART trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'DELETE_NEXT_PART actualResult', { actualResult })


    const {
        partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    expect(scriptItemUpdates.length).toEqual(1)
    expect(scriptItemUpdates[0].partIds).toEqual(['p4', 'p5'])

    expect(partUpdates.length).toEqual(1) //because Part13 is not allocated elsewhere (could be zero in other circumstances)
    expect(partPersonUpdates.length).toEqual(1)

    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)


    if (scenario === 1) expect(moveFocus).toEqual({ id: `part-${part5.id}-scene-${scene3.id}`, position: END })

    if (scenario === 2) expect(moveFocus).toEqual({ id: initialStaging3.id, position: START })

})

it(SWAP_PART, (sceneId = scene1.id, oldPartId = part3.id, newPartId = part10.id) => {
    const debug = false;
    window.alert = jest.fn()
    window.confirm = jest.fn(() => true)

    const trigger = dispatchTrigger(SWAP_PART, { sceneId, oldPartId, newPartId })

    log(debug, 'SWAP_PART trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show)

    log(debug, 'SWAP_PART actualResult', { actualResult })


    const {
        partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult


    expect(partUpdates.length).toEqual(1) 
    expect(partPersonUpdates.length).toEqual(1)

    expect(scriptItemUpdates.length).toEqual(3)

    expect(sceneOrderUpdates.length).toEqual(1)
    expect(showComments).toEqual(null)


   expect(moveFocus).toEqual({ id: newPartId, position: END })

})



xit(UPDATE_ATTACHMENTS, () => { })


const dispatchTrigger = (type, payload) => {
    return { ...payload, triggerType: type }
}

const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}