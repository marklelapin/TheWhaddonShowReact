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
    newUpdatesForSwapPart,
    newScriptItemsForAddComment,
    newUpdatesForCreateHeader,
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
    updateFocusOverrides,
} from '../scripts/sceneOrder'

import { getLatest, prepareUpdates } from '../../../dataAccess/localServerUtils'

import { SCENE, CURTAIN_TYPES, DIALOGUE, SYNOPSIS, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';
import { END, UP, START } from './utility';

import { log, SCRIPT_EDITOR_TRIGGER as logType } from '../../../logging'

export const getTriggerUpdates = (trigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show, viewAsPartPerson = null) => {


    //output variables
    let partUpdates = [];
    let partPersonUpdates = [];
    let scriptItemUpdates = [];
    let sceneOrderUpdates = [];
    let previousCurtainUpdates = [];
    let moveFocus = null;
    let showComments = null;

    log(logType, 'getTriggerUpdates', { trigger })

    const { triggerType, value, tag, scriptItem, position, direction, tempTextValue,
        oldPartId, newPartId, partId, personId
    } = trigger

    const sceneId = trigger.sceneId || ((scriptItem?.type === SCENE) ? scriptItem?.id : scriptItem?.parentId)

    const scene = currentScriptItems[sceneId]

    const sceneOrder = sceneOrders[sceneId]
    let sceneOrderOverride = []; //used to override the sceneOrder calculation of sceneOrder (e.g. when adding a new scene)



    const part = currentPartPersons[partId]
    const sceneScriptItems = () => {
        return sceneOrder.map(item => currentScriptItems[item.id])
    }

    //the following processes get completed at end of the function as they are dependent on preparing the final scriptItemUpdates
    let doRefreshAlignment = false; //if true will refresh the rightAlign calculation of sceneOrder
    let doRefreshSceneOrder = false; //if true will refresh the sceneOrder calculation of sceneOrder
    let doRefreshShowOrder = false; //if true will refresh the showOrder calculation of sceneOrder
    let doRefreshCurtain = false; //if true will refresh the curtain calculation of sceneOrder
    let doPreviousCurtainUpdate = false;

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
        case ADD_TAG:
            const newTags = copy(scriptItem).tags.filter(item => item !== tag)
            newTags.push(tag)
            scriptItemUpdates.push({ ...copy(scriptItem), tags: newTags });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case REMOVE_TAG: scriptItemUpdates.push({ ...copy(scriptItem), tags: copy(scriptItem).tags.filter(item => item !== tag) });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case UPDATE_ATTACHMENTS: scriptItemUpdates.push({ ...copy(scriptItem), attachments: value });
            moveFocus = { id: scriptItem.id, position: END }
            break;
        case UPDATE_TYPE:
            let newTypeUpdate = { ...copy(scriptItem), type: value };
            if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type

                newTypeUpdate = newScriptItemsForToggleCurtain(newTypeUpdate, sceneOrder, previousCurtainOpen, true) //set it to open curtain.
                scriptItemUpdates = newTypeUpdate
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
        case TOGGLE_CURTAIN:
            scriptItemUpdates = newScriptItemsForToggleCurtain(scriptItem, sceneOrder, previousCurtainOpen);
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
            if (CURTAIN_TYPES.includes(scriptItem.type)) doPreviousCurtainUpdate = true;
            if (direction === UP) {
                moveFocus = { id: scriptItem.previousId, position: END };
            } else {
                moveFocus = { id: scriptItem.nextId, position: START };
            };
            break;
        case DELETE_NEXT_SCRIPT_ITEM:
            const nextScriptItem = currentScriptItems[scriptItem.nextId]

            scriptItemUpdates = newScriptItemsForDelete(nextScriptItem, currentScriptItems);
            doRefreshSceneOrder = true
            if (scriptItemUpdates.some(item => CURTAIN_TYPES.includes(item.type))) doPreviousCurtainUpdate = true;
            moveFocus = { id: scriptItem.id, position: END };
            break;
        case ADD_SCENE:
            const newHeaderResult = newUpdatesForCreateHeader(scriptItem, currentScriptItems);
            scriptItemUpdates = newHeaderResult.scriptItemUpdates;
            const newSceneId = scriptItemUpdates.find(item => item.previousId === scriptItem.id).id
            partUpdates = newHeaderResult.partUpdates;
            previousCurtainUpdates.push({ sceneId: newSceneId, previousCurtainOpen: previousCurtainOpen[scriptItem.nextId] }) //copies over previousCurtain from previous next scene. Further update added later for that next scene.
            doPreviousCurtainUpdate = true;
            sceneOrderOverride = scriptItemUpdates.filter(item => item.id === newSceneId || item.parentId === newSceneId)
            doRefreshSceneOrder = true;
            doRefreshShowOrder = true;
            moveFocus = { id: scriptItemUpdates[1].id, position: END };
            break;
        case DELETE_SCENE:
            scriptItemUpdates = newScriptItemsForSceneDelete(scriptItem, currentScriptItems);
            doRefreshShowOrder = true;
            previousCurtainUpdates.push({ sceneId: scriptItem.nextId, previousCurtainOpen: previousCurtainOpen[scriptItem.id] })
            const newSceneFocus = scriptItem.nextId || scriptItem.previousId;
            moveFocus = { id: newSceneFocus, position: END };
            break;
        case MOVE_SCENE:
            const newPreviousId = value;
            scriptItemUpdates = newScriptItemsForMoveScene(scene, newPreviousId, currentScriptItems)
            doRefreshShowOrder = true;

            //update the previous curtain where the previous scene is changing
            const newPreviousScene = currentScriptItems[newPreviousId]

            //THINK VERY HARD BEFORE CHANGING THIS NEXT SECTION. IT IS REALLY FIDDLY WITH A LOT OF EDGE CASES!!!
            //CHECK UNIT TESTING BEFORE CHANGING ANYTHING HERE.

            if (!newPreviousScene.nextId) { //moving scene to end of show
                previousCurtainUpdates.push({ sceneId: scene.id, previousCurtainOpen: previousCurtainOpen['0'] })
                previousCurtainUpdates.push({ sceneId: '0', previousCurtainOpen: previousCurtainOpen[scene.id] })
            } else { //moving scene to within the script
                previousCurtainUpdates.push({ sceneId: scene.id, previousCurtainOpen: previousCurtainOpen[newPreviousScene.nextId] })
                previousCurtainUpdates.push({ sceneId: newPreviousScene.nextId, previousCurtainOpen: previousCurtainOpen[scene.nextId || '0'] })
            }

            if (!scene.nextId) { //moving scene from end of show
                previousCurtainUpdates.push({ sceneId: '0', previousCurtainOpen: previousCurtainOpen[scene.id] })
            } else {
                previousCurtainUpdates.push({ sceneId: scene.nextId, previousCurtainOpen: previousCurtainOpen[scene.id] })
            }

            moveFocus = { id: sceneId, position: END };
            break;
        case ADD_PART_TAG:
            const newPartTags = [...copy(part).tags.filter(item => item !== tag)]
            newPartTags.push(tag)
            partUpdates.push({ ...copy(part), tags: newPartTags });
            moveFocus = { id: partId, position: END };
            break;
        case REMOVE_PART_TAG: partUpdates.push({ ...copy(part), tags: copy(part).tags.filter(item => item !== tag) })
            moveFocus = { id: part.id, position: END };
            break;
        case UPDATE_PART_NAME:
            partUpdates.push({ ...copy(part), name: value });
            moveFocus = { id: part.id, position: END };
            break;
        case ALLOCATE_PERSON_TO_PART:
            partUpdates.push({ ...copy(part), personId })
            doRefreshAlignment = true;
            moveFocus = { id: part.id, position: END };
            break;
        case ADD_PART:
            const partToAddFrom = currentPartPersons[partId]
            const addPartResult = newUpdatesForAddPart(position, partToAddFrom, tempTextValue, scene);
            partUpdates = addPartResult.newPartUpdates
            scriptItemUpdates = addPartResult.newScriptItemUpdates;
            sceneOrderUpdates.push(updateFocusOverrides(sceneOrder, scriptItemUpdates[0].partIds))
            moveFocus = null //default to newly created part.
            break;
        case DELETE_PART:
            const partToDelete = currentPartPersons[partId]

            const deletePartResult = newUpdatesForDeletePart(partToDelete, scene, sceneOrders, currentScriptItems, show)

            partUpdates = deletePartResult.newPartUpdates || []
            scriptItemUpdates = deletePartResult.newScriptItemUpdates || []

            if (scriptItemUpdates.length > 0) {
                sceneOrderUpdates.push(updateFocusOverrides(sceneOrder, scriptItemUpdates[0].partIds))
            }


            const previousFocusId = sceneOrder.find(item => item.type === SYNOPSIS).id
            const nextFocusId = sceneOrder.find(item => item.type === INITIAL_STAGING).id

            moveFocus = getDeleteMoveFocus(partToDelete, scene, direction, previousFocusId, nextFocusId)
            break;
        case DELETE_NEXT_PART:
            const partPriorToDelete = currentPartPersons[partId]
            const deleteNextPartResult = newUpdatesForDeleteNextPart(partPriorToDelete, scene, sceneOrders, currentScriptItems, show, currentPartPersons)
            partUpdates = deleteNextPartResult.newPartUpdates
            scriptItemUpdates = deleteNextPartResult.newScriptItemUpdates

            const previousFocusId2 = sceneOrder.find(item => item.type === SYNOPSIS).id
            const nextFocusId2 = sceneOrder.find(item => item.type === INITIAL_STAGING).id

            moveFocus = getDeleteNextMoveFocus(partPriorToDelete, scene, direction, previousFocusId2, nextFocusId2, currentPartPersons)
            break;
        case SWAP_PART:
            const { newPartUpdates, newScriptItemUpdates } = newUpdatesForSwapPart(oldPartId, newPartId, sceneScriptItems(), sceneOrders[show.id], currentPartPersons);
            partUpdates = newPartUpdates;
            scriptItemUpdates = newScriptItemUpdates;
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

    log(logType, 'getTriggerUpdates preparedScriptItemUpdates', preparedScriptItemUpdates)
    log(logType, 'getTriggerUpdates preparedPartUpates', preparedPartUpdates)
    //SceneOrderUpdates
    let newSceneOrder = (sceneOrderOverride.length > 0) ? sceneOrderOverride : sceneOrder ;

    if (doRefreshSceneOrder) {
        newSceneOrder = refreshSceneOrder(newSceneOrder, preparedScriptItemUpdates, viewAsPartPerson, currentPartPersons) //adds updates into sceneOrder and reorders.
        sceneOrderUpdates.push(newSceneOrder)

        if (doPreviousCurtainUpdate) {
            const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1].curtainOpen
            previousCurtainUpdates.push({ sceneId: scene.nextId, previousCurtainOpen })
        }
    }

    if (doRefreshShowOrder) {
        //log(true, 'error check: refreshShowOrdre', {showOrder: sceneOrders[show.id],preparedScriptItemUpdates})
        const newShowOrder = refreshSceneOrder(sceneOrders[show.id], preparedScriptItemUpdates, viewAsPartPerson, currentPartPersons)
        //log(true, 'error check: newShowOrder', {newShowOrder})
        sceneOrderUpdates.push(newShowOrder)
    }

    if (doRefreshAlignment) {

        if (triggerType === ALLOCATE_PERSON_TO_PART) {
            const sceneOrdersAffected = Object.values(sceneOrders).filter(sceneOrder => sceneOrder[0].partIds.includes(partId))

            sceneOrdersAffected.forEach(sceneOrder => {
                const newCurrentPartPersons = { ...copy(currentPartPersons), [partId]: { ...copy(part), personId } }
                const newSceneOrder = alignRight(sceneOrder, viewAsPartPerson, newCurrentPartPersons, preparedScriptItemUpdates)
                sceneOrderUpdates.push(newSceneOrder)
            })

        }

        if (triggerType !== ALLOCATE_PERSON_TO_PART) {
            newSceneOrder = alignRight(sceneOrder, viewAsPartPerson, currentPartPersons, preparedScriptItemUpdates)
            sceneOrderUpdates.push(newSceneOrder)
        }

    }


    if (doRefreshCurtain) {

        newSceneOrder = refreshCurtain(newSceneOrder, preparedScriptItemUpdates) //works out changes to curtainOpen values across
        sceneOrderUpdates.push(newSceneOrder)
        const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1].curtainOpen;
        previousCurtainUpdates.push({ sceneId: scene?.nextId || '0', previousCurtainOpen })

    }




    //ScriptItemUpdates

    return {
        partUpdates: preparedPartUpdates,
        partPersonUpdates,
        scriptItemUpdates: preparedScriptItemUpdates,
        sceneOrderUpdates,
        previousCurtainUpdates,
        moveFocus,
        showComments
    }

}


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}