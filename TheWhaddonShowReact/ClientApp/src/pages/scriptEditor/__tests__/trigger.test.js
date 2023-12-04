import {
    UPDATE_TEXT, UPDATE_PART_IDS, UPDATE_TAGS,
    ADD_TAG, REMOVE_TAG, UPDATE_ATTACHMENTS, UPDATE_TYPE,
    OPEN_CURTAIN, CLOSE_CURTAIN, TOGGLE_CURTAIN,
    ADD_COMMENT, DELETE_COMMENT, ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM, DELETE_NEXT_SCRIPT_ITEM,
    ADD_SCENE, DELETE_SCENE, MOVE_SCENE, ADD_PART_TAG,
    REMOVE_PART_TAG, UPDATE_PART_NAME, ALLOCATE_PERSON_TO_PART,
    ADD_PART, DELETE_PART, DELETE_NEXT_PART, SWAP_PART
} from '../../../actions/scriptEditor';

import {
    part1,

    dialogue11,
    dialogue14,

    mockCurrentScriptItems as currentScriptItems,
    mockSceneOrders as sceneOrders,
    mockCurrentPartPersons as currentPartPersons,
    mockStoredPersons as storedPersons,
    show
} from './mockData'

import { getTriggerUpdates } from '../scripts/trigger'

import { log } from '../../../helper'

const anyValue = expect.anything()

it(UPDATE_TEXT, (scriptItem = dialogue11, tempText = 'new text') => {
    const debug = true;

    const trigger = dispatchTrigger(UPDATE_TEXT, { scriptItem, value: tempText }) //this should be direct match with call in code.

    log(debug, 'UPDATE_TEXT trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, show)

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
    expect(scriptItemUpdates).toEqual([{...dialogue11,created: anyValue ,text : 'new text'}])
    expect(sceneOrderUpdates).toEqual([])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si12", "position": "end" })

})


xit(UPDATE_PART_IDS, (scriptItem = dialogue11, selectedPartIds = ['p1', 'p7']) => {
    const debug = true;

    const trigger = dispatchTrigger(UPDATE_PART_IDS, { scriptItem, value: selectedPartIds }) //this should be direct match with call in code.

    log(debug, 'UPDATE_PART_IDS trigger', { trigger })

    const actualResult = getTriggerUpdates(trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, show, part1)

    const { partUpdates = [],
        partPersonUpdates = [],
        scriptItemUpdates = [],
        sceneOrderUpdates = [],
        previousCurtainUpdates = [],
        moveFocus = null,
        showComments = null,
    } = actualResult

    const expectedSceneOrder = sceneOrders['s1'].map(item => {

        if (item.id === dialogue11.id) {
            return { ...copy(item), alignRight: true, created: anyValue, partIds: ['p1', 'p7'] } //TODO - go back to this once alignRight is tested.
        } else if (item.id === dialogue14.id) {
            return {...copy(item), alignRight: true }
        }
        else {
            return { ...item, alignRight: false }
        }
    })

    expect(partUpdates).toEqual([])
    expect(partPersonUpdates).toEqual([])
    expect(scriptItemUpdates).toEqual([{ ...dialogue11, created: anyValue, partIds: ['p1','p7'] }])
    expect(sceneOrderUpdates).toEqual([expectedSceneOrder])
    expect(previousCurtainUpdates).toEqual([])
    expect(showComments).toEqual(null)
    expect(moveFocus).toEqual({ "id": "si11", "position": "end" })

})










const dispatchTrigger = (type, payload) => {
    return { ...payload, triggerType: type }
}

const copy = (object) => {
return JSON.parse(JSON.stringify(object))
}   

//    case UPDATE_PART_IDS: scriptItemUpdates.push({ ...scriptItem, partIds: value });
//doRefreshAlignment = true;
//break;
//        case UPDATE_TAGS: scriptItemUpdates.push({ ...scriptItem, tags: value });
//break;
//        case ADD_TAG: scriptItemUpdates.push({ ...scriptItem, tags: [...scriptItem.tags.filter(item => item !== tag).push(tag)] });
//break;
//        case REMOVE_TAG: scriptItemUpdates.push({ ...scriptItem, tags: scriptItem.tags.filter(item => item !== tag) });
//break;
//        case UPDATE_ATTACHMENTS: scriptItemUpdates.push({ ...scriptItem, attachments: value });
//break;
//        case UPDATE_TYPE: let newTypeUpdate = { ...scriptItem, type: value };
//if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type
//    newTypeUpdate = newScriptItemsForToggleCurtain(newTypeUpdate, true) //set it to open curtain.
//    scriptItemUpdates.push(newTypeUpdate)
//    doRefreshCurtain = true;
//} else if (CURTAIN_TYPES.includes(scriptItem.type)) { //i.e. its coming from a curtain type
//    newTypeUpdate.text = '';
//    newTypeUpdate = clearCurtainTags(newTypeUpdate)
//    scriptItemUpdates.push(newTypeUpdate)
//    doRefreshCurtain = true;
//} else {
//    scriptItemUpdates.push(newTypeUpdate);
//}
//break;
//        case OPEN_CURTAIN:
//scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, true);
//doRefreshCurtain = true;
//break;
//        case CLOSE_CURTAIN:
//scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, false);
//doRefreshCurtain = true;
//break;
//        case TOGGLE_CURTAIN:
//scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem);
//doRefreshCurtain = true;
//break;
//        case ADD_COMMENT:
//scriptItemUpdates = newScriptItemsForAddComment(scriptItem, value)
//moveFocus = null //newly creatd add script item will by default become focus.
//dispatch(updateShowComments(true));
//break;
//        case DELETE_COMMENT:
//scriptItemUpdates = newScriptItemsForDeleteComment(scriptItem, currentScriptItems);  //todo
//moveFocus = { id: scriptItem.previousId, position: END };
//break;
//        case ADD_SCRIPT_ITEM:
//scriptItemUpdates = newScriptItemsForCreate(position, scriptItem, currentScriptItems, DIALOGUE, tempTextValue);
//doRefreshSceneOrder = true;
//moveFocus = null;
//break;
//        case DELETE_SCRIPT_ITEM:
//scriptItemUpdates = newScriptItemsForDelete(scriptItem, currentScriptItems);
//doRefreshSceneOrder = true;
//if (direction === UP) {
//    moveFocus = { id: scriptItem.previousId, position: END };
//} else {
//    moveFocus = { id: scriptItem.nextId, position: END };
//};
//break;
//        case DELETE_NEXT_SCRIPT_ITEM:
//const nextScriptItem = currentScriptItems[scriptItem.nextId]
//scriptItemUpdates = newScriptItemsForDelete(nextScriptItem, currentScriptItems);
//doRefreshSceneOrder = true
//moveFocus = { id: scriptItem.Id, position: END };
//break;
//        case ADD_SCENE:
//const nextScriptItem2 = currentScriptItems[scriptItem.nextId]
//scriptItemUpdates = newScriptItemsForCreateHeader(scriptItem, currentScriptItems);
//doRefreshSceneOrder = true;
//doRefreshShowOrder = true;
//moveFocus = { id: scriptItemUpdates[0].id };
//break;
//        case DELETE_SCENE:
//scriptItemUpdates = newScriptItemsForSceneDelete(scriptItem, currentScriptItems);
//doRefreshShowOrder = true;
//const newSceneFocus = scriptItem.nextId || scriptItem.previousId;
//moveFocus = { id: newSceneFocus, position: END };
//break;
//        case MOVE_SCENE:
//const newPreviousId = value;
//scriptItemUpdates = newScriptItemsForMoveScene(scene, newPreviousId, currentScriptItems)
//doRefreshShowOrder = true;
//moveFocus = { id: sceneId, position: END };
//break;
//        case ADD_PART_TAG: partUpdates.push({ ...part, tags: [...part.tags.filter(item => item !== tag).push(tag)] });
//break;
//        case REMOVE_PART_TAG: partUpdates.push({ ...part, tags: part.tags.filter(item => item !== tag) })
//break;
//        case UPDATE_PART_NAME: partUpdates.push({ ...part, name: value });
//break;
//        case ALLOCATE_PERSON_TO_PART:
//partUpdates.push({ ...part, personId });
//break;
//        case ADD_PART:
//const partToAddFrom = currentPartPersons[partId]
//const addPartResult = newUpdatesForAddPart(direction, partToAddFrom, tempTextValue, scene);
//partUpdates = addPartResult.newPartUpdates
//scriptItemUpdates = addPartResult.newScriptItemUpdates;
//moveFocus = null //default to newly created part.
//break;
//        case DELETE_PART:
//const partToDelete = currentPartPersons[partId]
//const deletePartResult = newUpdatesForDeletePart(partToDelete, scene, sceneOrders, currentScriptItems, show)
//partUpdates = deletePartResult.newPartUpdates
//scriptItemUpdates = deletePartResult.newScriptItemUpdates

////TODO----
//const previousFocusId = sceneScriptItems.find(item => item.type === SYNOPSIS).id
//const nextFocusId = sceneScriptItems.find(item => item.type === INITIAL_STAGING).id
//const newMoveFocus = getDeleteMoveFocus(partToDelete, scene, direction, previousFocusId, nextFocusId)
//moveFocus = newMoveFocus2
//break;
//        case DELETE_NEXT_PART:
//const partPriorToDelete = currentPartPersons[partId]
//const deleteNextPartResult = newUpdatesForDeleteNextPart(partPriorToDelete, scene, sceneOrders, currentScriptItems, show, currentPartPersons)
//partUpdates = deleteNextPartResult.newPartUpdates
//scriptItemUpdates = deleteNextPartResult.newScriptItemUpdates
//moveFocus = newMoveFocus3;
//break;
//        case SWAP_PART:
//scriptItemUpdates = newScriptItemsForSwapPart(oldPartId, newPartId, sceneScriptItems());
//moveFocus = { id: newPartId, position: END };
//doRefreshAlignment = true
//break;


//it('dummy test',()=> {

//    expect(true).toBe(true)

//})