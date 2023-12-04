import {
    UPDATE_TEXT, UPDATE_PART_IDS, UPDATE_TAGS,
    ADD_TAG, REMOVE_TAG, UPDATE_ATTACHMENTS, UPDATE_TYPE,
    OPEN_CURTAIN, CLOSE_CURTAIN, TOGGLE_CURTAIN,
    ADD_COMMENT, DELETE_COMMENT, ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM, DELETE_NEXT_SCRIPT_ITEM,
    ADD_SCENE, DELETE_SCENE, MOVE_SCENE, ADD_PART_TAG,
    REMOVE_PART_TAG, UPDATE_PART_NAME, ALLOCATE_PERSON_TO_PART,
    ADD_PART, DELETE_PART, DELETE_NEXT_PART, SWAP_PART
    , CLEAR_SCRIPT
} from '../../../actions/scriptEditor';
import {
    newScriptItemsForCreate,
    newScriptItemsForDelete,
    newScriptItemsForSceneDelete,
    newScriptItemsForDeleteComment,
    newScriptItemsForSwapPart,
    newScriptItemsForAddComment,
    newScriptItemsForCreateHeader,
    newScriptItemsForMoveScene
} from '../scripts/scriptItem'
import {
    newUpdatesForAddPart,
    newUpdatesForDeletePart,
    newUpdatesForDeleteNextPart,
    addPersonInfo,
    getDeleteMoveFocus,
    getDeleteNextMoveFocus
} from '../scripts/part'
import {
    refreshCurtain,
    clearCurtainTags,
    newScriptItemsForToggleCurtain
} from '../scripts/curtain'

import {
    refreshSceneOrder,
    alignRight,
} from '../scripts/sceneOrder'

import { getLatest, prepareUpdates } from '../../../dataAccess/localServerUtils'

import { SCENE, CURTAIN_TYPES, DIALOGUE, SYNOPSIS, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';
import { END, UP } from './utility';

export const getTriggerUpdates = (trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, show, viewAsPartPerson = null) => {


    //output variables
    let partUpdates = [];
    let partPersonUpdates = [];
    let scriptItemUpdates = [];
    let sceneOrderUpdates = [];
    let previousCurtainUpdates = [];
    let moveFocus = null;
    let showComments = null;



    const { triggerType, value, tag, scriptItem, position, direction, tempTextValue,
        oldPartId, newPartId, partId, personId,
    } = trigger

    const sceneId = trigger.sceneId || (scriptItem?.type === SCENE) ? scriptItem.id : scriptItem.parentId
    const scene = currentScriptItems[sceneId]
    const sceneOrder = sceneOrders[sceneId]
    const part = currentPartPersons[partId]
    const sceneScriptItems = () => {
        return sceneOrder.map(item => currentScriptItems[item.id])
    }

    //the following processes get completed at end of the function as they are dependent on preparing the final scriptItemUpdates
    let doRefreshAlignment = false; //if true will refresh the rightAlign calculation of sceneOrder
    let doRefreshSceneOrder = false; //if true will refresh the sceneOrder calculation of sceneOrder
    let doRefreshShowOrder = false; //if true will refresh the showOrder calculation of sceneOrder
    let doRefreshCurtain = false; //if true will refresh the curtain calculation of sceneOrder


    switch (triggerType) {

        case UPDATE_TEXT: scriptItemUpdates.push({ ...copy(scriptItem), text: value });
            moveFocus = { id: scriptItem.nextId, position: END }
            break;
        case UPDATE_PART_IDS: scriptItemUpdates.push({ ...copy(scriptItem), partIds: value });
            doRefreshAlignment = true;
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case UPDATE_TAGS: scriptItemUpdates.push({ ...copy(scriptItem), tags: value });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case ADD_TAG: scriptItemUpdates.push({ ...copy(scriptItem), tags: [...copy(scriptItem).tags.filter(item => item !== tag).push(tag)] });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case REMOVE_TAG: scriptItemUpdates.push({ ...copy(scriptItem), tags: copy(scriptItem).tags.filter(item => item !== tag) });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case UPDATE_ATTACHMENTS: scriptItemUpdates.push({ ...copy(scriptItem), attachments: value });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case UPDATE_TYPE: let newTypeUpdate = { ...copy(scriptItem), type: value };
            if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type
                newTypeUpdate = newScriptItemsForToggleCurtain(newTypeUpdate, true) //set it to open curtain.
                scriptItemUpdates.push(newTypeUpdate)
                doRefreshCurtain = true;
            } else if (CURTAIN_TYPES.includes(scriptItem.type)) { //i.e. its coming from a curtain type
                newTypeUpdate.text = '';
                newTypeUpdate = clearCurtainTags(newTypeUpdate)
                scriptItemUpdates.push(newTypeUpdate)
                doRefreshCurtain = true;
            } else {
                scriptItemUpdates.push(newTypeUpdate);
            }
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case OPEN_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, true);
            doRefreshCurtain = true;
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case CLOSE_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, false);
            doRefreshCurtain = true;
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case TOGGLE_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem);
            doRefreshCurtain = true;
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case ADD_COMMENT:
            scriptItemUpdates = newScriptItemsForAddComment(scriptItem, value)
            moveFocus = null //newly creatd add script item will by default become focus.
            showComments = true;
            break;
        case DELETE_COMMENT:
            scriptItemUpdates = newScriptItemsForDeleteComment(scriptItem, currentScriptItems);  //todo
            moveFocus = { id: scriptItem.previousId, position: END };
            break;
        case ADD_SCRIPT_ITEM:
            scriptItemUpdates = newScriptItemsForCreate(position, scriptItem, currentScriptItems, DIALOGUE, tempTextValue);
            doRefreshSceneOrder = true;
            moveFocus = null;
            break;
        case DELETE_SCRIPT_ITEM:
            scriptItemUpdates = newScriptItemsForDelete(scriptItem, currentScriptItems);
            doRefreshSceneOrder = true;
            if (direction === UP) {
                moveFocus = { id: scriptItem.previousId, position: END };
            } else {
                moveFocus = { id: scriptItem.nextId, position: END };
            };
            break;
        case DELETE_NEXT_SCRIPT_ITEM:
            const nextScriptItem = currentScriptItems[scriptItem.nextId]
            scriptItemUpdates = newScriptItemsForDelete(nextScriptItem, currentScriptItems);
            doRefreshSceneOrder = true
            moveFocus = { id: scriptItem.Id, position: END };
            break;
        case ADD_SCENE:
            scriptItemUpdates = newScriptItemsForCreateHeader(scriptItem, currentScriptItems);
            doRefreshSceneOrder = true;
            doRefreshShowOrder = true;
            moveFocus = { id: scriptItemUpdates[0].id };
            break;
        case DELETE_SCENE:
            scriptItemUpdates = newScriptItemsForSceneDelete(scriptItem, currentScriptItems);
            doRefreshShowOrder = true;
            const newSceneFocus = scriptItem.nextId || scriptItem.previousId;
            moveFocus = { id: newSceneFocus, position: END };
            break;
        case MOVE_SCENE:
            const newPreviousId = value;
            scriptItemUpdates = newScriptItemsForMoveScene(scene, newPreviousId, currentScriptItems)
            doRefreshShowOrder = true;
            moveFocus = { id: sceneId, position: END };
            break;
        case ADD_PART_TAG: partUpdates.push({ ...copy(part), tags: copy(part).tags.filter(item => item !== tag).push(tag) })
            moveFocus = { id: partId, position: END };
            break;
        case REMOVE_PART_TAG: partUpdates.push({ ...copy(part), tags: copy(part).tags.filter(item => item !== tag) })
            moveFocus = { id: part.Id, position: END };
            break;
        case UPDATE_PART_NAME: partUpdates.push({ ...copy(part), name: value });
            moveFocus = { id: part.Id, position: END };
            break;
        case ALLOCATE_PERSON_TO_PART:
            partUpdates.push({ ...copy(part), personId });
            moveFocus = { id: part.Id, position: END };
            break;
        case ADD_PART:
            const partToAddFrom = currentPartPersons[partId]
            const addPartResult = newUpdatesForAddPart(direction, partToAddFrom, tempTextValue, scene);
            partUpdates = addPartResult.newPartUpdates
            scriptItemUpdates = addPartResult.newScriptItemUpdates;
            moveFocus = null //default to newly created part.
            break;
        case DELETE_PART:
            const partToDelete = currentPartPersons[partId]
            const deletePartResult = newUpdatesForDeletePart(partToDelete, scene, sceneOrders, currentScriptItems, show)
            partUpdates = deletePartResult.newPartUpdates
            scriptItemUpdates = deletePartResult.newScriptItemUpdates

            //TODO----
            const previousFocusId = sceneScriptItems.find(item => item.type === SYNOPSIS).id
            const nextFocusId = sceneScriptItems.find(item => item.type === INITIAL_STAGING).id
            moveFocus = getDeleteMoveFocus(partToDelete, scene, direction, previousFocusId, nextFocusId)
            break;
        case DELETE_NEXT_PART:
            const partPriorToDelete = currentPartPersons[partId]
            const deleteNextPartResult = newUpdatesForDeleteNextPart(partPriorToDelete, scene, sceneOrders, currentScriptItems, show, currentPartPersons)
            partUpdates = deleteNextPartResult.newPartUpdates
            scriptItemUpdates = deleteNextPartResult.newScriptItemUpdates
            moveFocus = getDeleteNextMoveFocus(partPriorToDelete, scene, direction, previousFocusId, nextFocusId)
            break;
        case SWAP_PART:
            scriptItemUpdates = newScriptItemsForSwapPart(oldPartId, newPartId, sceneScriptItems());
            moveFocus = { id: newPartId, position: END };
            doRefreshAlignment = true
            break;
        default: break;
    }


    if (partUpdates.length > 0) {
        const persons = getLatest(storedPersons)
        partPersonUpdates = partUpdates.map(partUpdate => {
            const person = persons.find(person => person.id === partUpdate.personId)
            const partPerson = addPersonInfo(partUpdate, person)
            return partPerson
        })
    }

    const preparedScriptItemUpdates = prepareUpdates(scriptItemUpdates) || []
    const preparedPartUpdates = prepareUpdates(partUpdates) || []


    //SceneOrderUpdates
    let newSceneOrder = sceneOrder;

    if (doRefreshSceneOrder) {
        newSceneOrder = refreshSceneOrder(sceneOrder, preparedScriptItemUpdates) //adds updates into sceneOrder and reorders.
        sceneOrderUpdates.push(newSceneOrder)
    }

    if (doRefreshShowOrder) {
        const newShowOrder = refreshSceneOrder(sceneOrders[show.id], preparedScriptItemUpdates)
        sceneOrderUpdates.push(newShowOrder)
    }

    if (doRefreshAlignment) {
        const newScenePartPersonIds = newSceneOrder[0].partIds.map(partId => ({ sceneId: scene.id, partId: partId, personId: currentPartPersons[partId].personId }))
        newSceneOrder = alignRight(sceneOrder, viewAsPartPerson, newScenePartPersonIds, preparedScriptItemUpdates)
        sceneOrderUpdates.push(newSceneOrder)
    }


    if (doRefreshCurtain) {
        newSceneOrder = refreshCurtain(newSceneOrder, null, preparedScriptItemUpdates) //works out changes to curtainOpen values across
        sceneOrderUpdates.push(newSceneOrder)
        const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1].curtainOpen;
        previousCurtainUpdates.push({ sceneId: sceneId.nextId, previousCurtainOpen })

    }

    //ScriptItemUpdates

    return {
        partUpdates : preparedPartUpdates,
        partPersonUpdates,
        scriptItemUpdates : preparedScriptItemUpdates,
        sceneOrderUpdates,
        previousCurtainUpdates,
        moveFocus,
        showComments
    }

}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}