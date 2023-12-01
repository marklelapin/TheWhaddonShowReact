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
    addPersonInfo
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

import { SCENE, CURTAIN_TYPES, DIALOGUE } from '../../../dataAccess/scriptItemTypes';
import { END, UP } from './utility';

export const getTriggerUpdates = (props) => {

    const { trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, show } = props

    //output variables
    let partUpdates = [];
    let scriptItemUpdates = [];
    let sceneOrderUpdates = [];
    let previousCurtainUpdates = [];
    let moveFocus = null;


    const { type, value, tag, scriptItem, position, direction, tempTextValue,
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


    switch (type) {

        case UPDATE_TEXT: scriptItemUpdates.push({ ...scriptItem, text: value });
            moveFocus = { id: scriptItem.nextId, position: END }
            break;
        case UPDATE_PART_IDS: scriptItemUpdates.push({ ...scriptItem, partIds: value });
            doRefreshAlignment = true;
            break;
        case UPDATE_TAGS: scriptItemUpdates.push({ ...scriptItem, tags: value });
            break;
        case ADD_TAG: scriptItemUpdates.push({ ...scriptItem, tags: [...scriptItem.tags.filter(item => item !== tag).push(tag)] });
            break;
        case REMOVE_TAG: scriptItemUpdates.push({ ...scriptItem, tags: scriptItem.tags.filter(item => item !== tag) });
            break;
        case UPDATE_ATTACHMENTS: scriptItemUpdates.push({ ...scriptItem, attachments: value });
            break;
        case UPDATE_TYPE: let newTypeUpdate = { ...scriptItem, type: value };
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
            break;
        case OPEN_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, true);
            doRefreshCurtain = true;
            break;
        case CLOSE_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, false);
            doRefreshCurtain = true;
            break;
        case TOGGLE_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem);
            doRefreshCurtain = true;
            break;
        case ADD_COMMENT:
            scriptItemUpdates = newScriptItemsForAddComment(scriptItem, value)
            moveFocus = null //newly creatd add script item will by default become focus.
            dispatch(updateShowComments(true));
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
            scriptItemUpdates = newScriptItemsForDelete(scriptItem, currentScripItems);
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
            const nextScriptItem2 = currentScriptItems[scriptItem.nextId]
            scriptItemUpdates = newScriptItemsForCreateHeader(scriptItem, nextScriptItem2);
            doRefreshSceneOrder = true;
            doRefreshShowOrder = true;
            moveFocus = { id: scriptItemUpdates[0].id };
            break;
        case DELETE_SCENE:
            scriptItemUpdates = newScriptItemsForSceneDelete(scriptItem, sceneScriptItems());
            doRefreshShowOrder = true;
            const newSceneFocus = scriptItem.nextId || scriptItem.previousId;
            moveFocus = { id: newSceneFocus, position: END };
            break;
        case MOVE_SCENE:
            const showSceneOrder = sceneOrders[show.id]
            const newPreviousId = value;
            scriptItemUpdates = newScriptItemsForMoveScene(sceneId, newPreviousId, showSceneOrder)
            doRefreshShowOrder = true;
            moveFocus = { id: sceneId, position: END };
            break;
        case CLEAR_SCRIPT:
            dispatch(clearScriptEditorState);
            return;
        case ADD_PART_TAG: partUpdates.push({ ...part, tags: [...part.tags.filter(item => item !== tag).push(tag)] });
            break;
        case REMOVE_PART_TAG: partUpdates.push({ ...part, tags: part.tags.filter(item => item !== tag) })
            break;
        case UPDATE_PART_NAME: partUpdates.push({ ...part, name: value });
            break;
        case ALLOCATE_PERSON_TO_PART:
            partUpdates.push({ ...part, personId });
            break;
        case ADD_PART:
            const partToAddFrom = currentPartPersons[partId]
            const { newPartUpdates, newScriptItemUpdates, newMoveFocus } = newUpdatesForAddPart(direction, partToAddFrom, tempTextValue, scene);
            partUpdates = [...newPartUpdates]
            scriptItemUpdates = [...newScriptItemUpdates];
            moveFocus = newMoveFocus //default to newly created part.
            break;
        case DELETE_PART:
            const partToDelete = currentPartPersons[partId]
            const { newPartUpdates2, newScriptItemUpdates2, newMoveFocus2 } = newUpdatesForDeletePart(direction, partToDelete, sceneScriptItems(), sceneOrders)
            partUpdates = [...newPartUpdates2]
            scriptItemUpdates = [newScriptItemUpdates2]
            moveFocus = newMoveFocus2
            break;
        case DELETE_NEXT_PART:
            const currentPart = currentPartPersons[partId]
            const { newPartUpdates3, newScriptItemUpdates3, newMoveFocus3 } = newUpdatesForDeleteNextPart(direction, currentPart, sceneScriptItems(), sceneOrders)
            partUpdates = [...newPartUpdates3]
            scriptItemUpdates = [...newScriptItemUpdates3]
            moveFocus = newMoveFocus3;
            break;
        case SWAP_PART:
            scriptItemUpdates = newScriptItemsForSwapPart(sceneScriptItems(), oldPartId, newPartId);
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

    //SceneOrderUpdates
    let newSceneOrder = sceneOrder;

    if (doRefreshSceneOrder) {
        newSceneOrder = refreshSceneOrder(sceneOrder, scriptItemUpdates) //adds updates into sceneOrder and reorders.
        sceneOrderUpdates.push(newSceneOrder)
    }

    if (doRefreshShowOrder) {
        const newShowOrder = refreshSceneOrder(sceneOrders[show.id], scriptItemUpdates)
        sceneOrderUpdates.push(newShowOrder)
    }

    if (doRefreshAlignment) {
        const newScenePartPersonIds = newSceneOrder[0].partIds.map(partId => ({ sceneId: scene.id, partId: partId, personId: currentPartPersons[partId].personId }))
        newSceneOrder = alignRight(sceneOrder, viewAsPartPerson, newScenePartPersonIds, scriptItemUpdates)
        sceneOrderUpdates.push(newSceneOrder)
    }


    if (doRefreshCurtain) {
        newSceneOrder = refreshCurtain(newSceneOrder, null, scriptItemUpdates) //works out changes to curtainOpen values across
        sceneOrderUpdates.push(newSceneOrder)
        const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1].curtainOpen;
        previousCurtainUpdates.push({ sceneId: sceneId.nextId, previousCurtainOpen })

    }

    //ScriptItemUpdates
    const preparedScriptItemUpdates = prepareUpdates(scriptItemUpdates) || []
    const preparedPartUpdates = prepareUpdates(partUpdates) || []
    return {
        partUpdates,
        partPersonUpdates,
        scriptItemUpdates,
        sceneOrderUpdates,
        previousCurtainUpdates,
        moveFocus
    }

}