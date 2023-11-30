//React and Redux
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    updateCurrentPartPersons,
    updateShowComments,
    addItemsToRedoList,
    removeItemsFromRedoList,
    resetUndo,
    updateSceneInFocus,
    clearScriptEditorState,
    updateSceneOrders,
    updatePreviousCurtain,
    updateCurrentScriptItems,
    UPDATE_TEXT, UPDATE_PART_IDS, UPDATE_TAGS,
    ADD_TAG, REMOVE_TAG, UPDATE_ATTACHMENTS, UPDATE_TYPE,
    OPEN_CURTAIN, CLOSE_CURTAIN, TOGGLE_CURTAIN,
    ADD_COMMENT, DELETE_COMMENT, ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM, DELETE_NEXT_SCRIPT_ITEM,
    ADD_SCENE, DELETE_SCENE, MOVE_SCENE, ADD_PART_TAG,
    REMOVE_PART_TAG, UPDATE_PART_NAME, ALLOCATE_PERSON_TO_PART,
    ADD_PART, DELETE_PART, DELETE_NEXT_PART, SWAP_PART
    , UNDO, REDO, CONFIRM_UNDO, CLEAR_SCRIPT

} from '../../../actions/scriptEditor';

//utils
import { log } from '../../../helper';
import { getLatest, prepareUpdates } from '../../../dataAccess/localServerUtils';
import { addUpdates } from '../../../actions/localServer';

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
    refreshSceneOrder,
    alignRight,
} from '../scripts/sceneOrder'
import {
    refreshCurtain,
    clearCurtainTags,
    newScriptItemsForToggleCurtain
} from '../scripts/curtain'
import { moveFocusToId, END, UP } from '../scripts/utility';

//constants
import { SHOW, ACT, SCENE, CURTAIN_TYPES, DIALOGUE } from '../../../dataAccess/scriptItemTypes'
import { SCRIPT_ITEM, PART, PERSON } from '../../../dataAccess/localServerModels'

export function ScriptEditorProcessing() {

    //This component is used to process updates from the localServer and update the scriptEditor state and vice versa.

    const _ = require('lodash');
    const dispatch = useDispatch();

    const debug = true;

    ///REDUX
    //localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const storedParts = useSelector(state => state.localServer.parts.history)
    const storedScriptItems = useSelector(state => state.localServer.scriptItems.history)


    //scriptEditor (handles data for display)
    const show = useSelector(state => state.scriptEditor.show) //done
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson) //done
    const scriptItemInFocus = useSelector(state => state.scriptEditor.scriptItemInFocus) //done
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)

    //triggering actions from script Editor to be carried out by this component and sent on to localServer
    const scriptEditorTrigger = useSelector(state => state.scriptEditor.trigger) //done          
    //triggering updates to scriptEditor from external server changes to local Server.
    const localServerTrigger = useSelector((state) => state.localServer.updateTrigger)


    //being populated by this component.
    const sceneOrders = useSelector(state => state.scriptEditor.sceneOrders)
    const currentScriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const currentPartPersons = useSelector(state => state.scriptEditor.currentPartPersons)


    //undo process
    const isUndoInProgress = useSelector(state => state.scriptEditor.isUndoInProgress) || {}
    const undoSceneId = Object.keys(isUndoInProgress)[0]
    const redoList = useSelector(state => state.scriptEditor.redoList)

    useEffect(() => {
        let currentFocus = null;
        for (var key in scriptItemInFocus) {
            if (scriptItemInFocus.hasOwnProperty(key)) {
                currentFocus = scriptItemInFocus[key];
            }
        }

        if (currentFocus && currentFocus.sceneId !== sceneInFocus.id) {

            const newSceneInFocus = currentScriptItems[scriptItemInFocus.parentId]

            dispatch(updateSceneInFocus(newSceneInFocus))
        }

    }, [scriptItemInFocus])



    useEffect(() => {

        const scenes = sceneOrders[show.id]

        if (scenes) {
            scenes.forEach(scene => {
                //for each scene checks to see if it as parts affected by viewAsPartPerson and if so refreshes the alignRight calculation.

                const scenePartPersonIds = scene.partIds.map(partId => currentPartPersons[partId]).map(partPerson => ({ sceneId: scene.id, partId: partPerson.id, personId: partPerson.personId }))

                const matchesPart = scenePartPersonIds.some(partPerson => partPerson.partId === viewAsPartPerson.id)

                if (!matchesPart) {
                    const matchesPerson = scenePartPersonIds.some(partPerson => partPerson.personId === viewAsPartPerson.id)
                    if (!matchesPerson) return;
                }

                const newSceneOrder = alignRight(sceneOrders[scene.id], viewAsPartPerson, scenePartPersonIds)
                dispatch(updateSceneOrders([newSceneOrder]))

            })
        }


    }, [viewAsPartPerson])


    //ScriptEditorTrigger Processing
    //---------------------------------------------------------------------------------
    //the scriptEditorTrigger is used to trigger updates to the scriptEditor state.
    //without this intermediary step there are signficant re-renders of a large number of items.
    //This component spefically targets state that need updating when a scriptItem is changed.


    useEffect(() => {

        log(debug, 'Component:ScriptEditorProcessing: ScriptEditorTrigger', scriptEditorTrigger)

        if (!scriptEditorTrigger || Object.keys(scriptEditorTrigger).length === 0) return

        const { type, value, tag, scriptItem, position, direction, tempTextValue,
            oldPartId, newPartId, sceneId : draftSceneId, partId, personId,
        } = scriptEditorTrigger

        log(debug, 'ScriptEditorTrigger', draftSceneId)
        let sceneId

        if (draftSceneId) {
            sceneId = draftSceneId;
        } else if ([UNDO, REDO, CONFIRM_UNDO].includes(type)) {
            sceneId = undoSceneId
        } else {
            sceneId = (scriptItem?.type === SCENE) ? scriptItem.id : scriptItem.parentId
        }

        const scene = currentScriptItems[sceneId]
        const sceneOrder = sceneOrders[sceneId]
        const part = currentPartPersons[partId]

        //send off undo jobs
        switch (type) {

            case UNDO: undo(sceneOrder); return
            case REDO: redo(sceneOrder); return
            case CONFIRM_UNDO: confirmUndo(); return;
            default: break;
        }

        //process scriptItem jobs

        const sceneScriptItems = () => {
            return sceneOrder.map(item => currentScriptItems[item.id])
        }

        const surroundingScriptItems = (_scriptItem = null) => {

            const item = _scriptItem || scriptItem
            const previousScriptItem = currentScriptItems[item.previousId]
            const nextScriptItem = currentScriptItems[item.nextId]

            const surroundingScriptItems = []

            surroundingScriptItems.push(previousScriptItem)
            surroundingScriptItems.push(item)
            if (nextScriptItem) { surroundingScriptItems.push(nextScriptItem) }

            return surroundingScriptItems;
        }

        let partUpdates = []
        let scriptItemUpdates = []

        let moveFocus = { id: scriptItem?.nextId, position: END } //default move focus to next item in list unles change in switch statement.

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
                scriptItemUpdates = newScriptItemsForDeleteComment(scriptItem, surroundingScriptItems());  //todo
                moveFocus = { id: scriptItem.previousId, position: END };
                break;
            case ADD_SCRIPT_ITEM:
                scriptItemUpdates = newScriptItemsForCreate(position, scriptItem, surroundingScriptItems(), DIALOGUE, tempTextValue);
                doRefreshSceneOrder = true;
                moveFocus = null;
                break;
            case DELETE_SCRIPT_ITEM:
                scriptItemUpdates = newScriptItemsForDelete(scriptItem, surroundingScriptItems());
                doRefreshSceneOrder = true;
                if (direction === UP) {
                    moveFocus = { id: scriptItem.previousId, position: END };
                } else {
                    moveFocus = { id: scriptItem.nextId, position: END };
                };
                break;
            case DELETE_NEXT_SCRIPT_ITEM:
                const nextScriptItem = currentScriptItems[scriptItem.nextId]
                scriptItemUpdates = newScriptItemsForDelete(nextScriptItem, surroundingScriptItems(nextScriptItem));
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
                scriptItemUpdates = newScriptItemsForSceneDelete(scriptItem, surroundingScriptItems());
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

        //ScriptItemUpdates
        const preparedScriptItemUpdates = prepareUpdates(scriptItemUpdates) || []
        if (preparedScriptItemUpdates.length > 0) {
            dispatch(addUpdates(preparedScriptItemUpdates, SCRIPT_ITEM)) //localServer))
        }

        //PartUpdates
        const preparedPartUpdates = prepareUpdates(partUpdates) || []
        if (preparedPartUpdates.Length > 0) {
            dispatch(addUpdates(preparedPartUpdates, PART)) //localServer
            preparedPartUpdates.forEach(partUpdate => {

                const person = getLatest(storedPersons.find(person => person.id === partUpdate.personId))
                const partPerson = addPersonInfo(partUpdate, person)
                dispatch(updateCurrentPartPersons([partPerson])) //scriptEditor
            })
        }


        //SceneOrderUpdates
        let newSceneOrder = sceneOrder;
        let sceneOrderUpdates = [];
        let previousCurtainUpdates = [];

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

        if (sceneOrderUpdates.length > 0) {
            dispatch(updateSceneOrders(sceneOrderUpdates)) //ensures curtain is applied at same time to both scenes 
        }
        if (previousCurtainUpdates.length > 0) {
            dispatch(updatePreviousCurtain(previousCurtainUpdates))
        }


        //Moves Focus
        if (moveFocus) {
            moveFocusToId(moveFocus.id, moveFocus.position)
        }


    }, [scriptEditorTrigger])










    //Refresh trigger used to update scriptEditorScenes with additional partPerson info.
    useEffect(() => {
        log(debug, 'Component:ScriptEditorProcessing localServerTrigger', { type: localServerTrigger.type, updates: localServerTrigger.updates?.length })


        if (localServerTrigger.updates && localServerTrigger.type === SCRIPT_ITEM) {

            const scriptItemUpdates = localServerTrigger.updates

            //the updates that are newer than the current scriptItems so will affect script Editor
            const currentScriptItemUpdates = scriptItemUpdates.filter(update => new Date(update.created) > new Date(currentScriptItems[update.id]?.created || 0))

            //find the latest currentScriptItemUpdates for each id
            const latestCurrentScriptItemUpdates = Object.values(currentScriptItemUpdates.reduce((acc, item) => {
                if (!acc[item.id] || new Date(acc[item.id].created) < new Date(item.created || 0)) {
                    acc[item.id] = item;
                }
                return acc;
            }, {}))

            const sceneIds = [...latestCurrentScriptItemUpdates.map(item => item.parentId)]
              //  , ...latestCurrentScriptItemUpdates.filter(item => [SHOW, ACT, SCENE].includes(item.type)).map(item => item.id)]

            const uniqueSceneIds = [...new Set(sceneIds)]

            let sceneOrderUpdates = []
            let previousCurtainUpdates = []

            uniqueSceneIds.forEach(sceneId => {

                const nextSceneIdFromScriptItemUpdates = latestCurrentScriptItemUpdates.find(item => item.id === sceneId)?.nextId || null

                const nextSceneId = nextSceneIdFromScriptItemUpdates || currentScriptItems[sceneId]?.nextId || null

                const newSceneScriptItems = currentScriptItemUpdates.filter(item => item.parentId === sceneId || item.id === sceneId)
                const newSceneOrder = refreshSceneOrder(sceneOrders[sceneId], newSceneScriptItems)

                if (newSceneOrder.length > 0) { //this can occur if the scene is inActive
                    sceneOrderUpdates.push(newSceneOrder)

                    if (nextSceneId) {
                        const previousCurtainOpen = newSceneOrder[newSceneOrder.length - 1]?.curtainOpen;
                        previousCurtainUpdates.push({ sceneId: nextSceneId, previousCurtainOpen })
                    }
                }
            })

            //const sceneUpdates = latestCurrentScriptItemUpdates.filter(item => [SHOW, ACT, SCENE].includes(item.type))

            ////if (sceneUpdates.length > 0) {
            ////    const newShowOrder = refreshSceneOrder(sceneOrders[show.id], sceneUpdates)
            ////    sceneOrderUpdates.push(newShowOrder)
            ////}


            if (latestCurrentScriptItemUpdates.length > 0) {
                dispatch(updateCurrentScriptItems(latestCurrentScriptItemUpdates))
            }
            if (sceneOrderUpdates.length > 0) {
                dispatch(updateSceneOrders(sceneOrderUpdates))
            }
            if (previousCurtainUpdates.length > 0) {
                dispatch(updatePreviousCurtain(previousCurtainUpdates))
            }

        }

        if (localServerTrigger.updates && localServerTrigger.type === PART) {
          
            const partUpdates = localServerTrigger.updates
            const currentPartUpdates = partUpdates.filter(update => new Date(update.created) > new Date(currentPartPersons[update.id]?.created || 0))
            const latestCurrentPartUpdates = getLatest(currentPartUpdates)
            const persons = getLatest(storedPersons)

            const newPartPersons = latestCurrentPartUpdates.map(partUpdate => {
                const person = persons.find(person => person.id === partUpdate.personId) || null
                const partPerson = addPersonInfo(partUpdate, person)
                return partPerson;
            });

            dispatch(updateCurrentPartPersons(newPartPersons))
        }

        if (localServerTrigger.updates && localServerTrigger.type === PERSON) {

            const personUpdates = localServerTrigger.updates
            const latestPersonUpdates = getLatest(personUpdates, true)
            const newPartPersons = []
            for (const key in currentPartPersons) {
                if (currentPartPersons.hasOwnProperty(key)) {
                    const part = currentPartPersons[key]
                    const newPerson = latestPersonUpdates.find(item => item.id === part.personId)
                    if (newPerson) {
                        newPartPersons.push(addPersonInfo(part, newPerson))
                    }

                }
            }

            dispatch(updateCurrentPartPersons(newPartPersons))
        }

    }, [localServerTrigger])



    ///Undo processing
    const undo = (currentSceneOrder) => {

        const sceneId = currentSceneOrder[0].id

        if (sceneId !== undoSceneId) {
            confirmUndo() //confirm undo for current undo Scene before moving to new one.
        }

        const latestCreatedDate = currentSceneOrder.reduce((a, b) => (new Date(a.created) > new Date(b.created)) ? a : b).created

        const currentScriptItemUpdates = []; //the changed scriptItems that will now be posted to currentScriptItems
        const redoScriptItemUpdates = []; //the original scriptItems that will be put back if redo is confirmed
        const sceneOrderUpdates = []

        const newSceneOrder = currentSceneOrder.map(item => {

            if (new Date(item.created) === new Date(latestCreatedDate)) {

                //add the item to the list of items adding to redo list
                redoScriptItemUpdates.push(currentScriptItems[item.id])

                //update line in sceneOrder
                const scriptItemHistory = storedScriptItems.filter(scriptItem => scriptItem.id === item.id && new Date(scriptItem.created) < latestCreatedDate)
                let undoScriptItem;

                if (scriptItemHistory.length > 0) {
                    undoScriptItem = scriptItemHistory.reduce((a, b) => (new Date(a.created) > new Date(b.created) ? a : b))
                } else {
                    undoScriptItem = { ...currentScriptItems[item.id], isActive: false }
                }

                //add the undoneSCriptItemt to the list of items to updaten currentScriptItems
                currentScriptItemUpdates.push(undoScriptItem)

                return { ...item, created: undoScriptItem.created }

            } else {
                return item;
            }
        })

        sceneOrderUpdates.push(newSceneOrder)


        dispatch(updateCurrentScriptItems(currentScriptItemUpdates));
        dispatch(updateSceneOrders(sceneOrderUpdates));
        dispatch(addItemsToRedoList(sceneId, redoScriptItemUpdates));



    }


    const redo = (currentSceneOrder) => {

        const scene = currentSceneOrder[0]

        const redoCreated = redoList[redoList.length - 1].created
        const redoScriptItemUpdates = redoList.filter(item => new Date(item.created) === new Date(redoCreated))
        const scenePartPersonIds = scene.partIds.map(partId => ({ sceneId: scene.id, partId, personId: currentPartPersons[partId].personId }))
        const redoSceneOrder = refreshSceneOrder(currentSceneOrder, redoScriptItemUpdates, viewAsPartPerson, scenePartPersonIds)

        dispatch(updateCurrentScriptItems([redoScriptItemUpdates]))
        dispatch(updateSceneOrders([redoSceneOrder]))
        dispatch(removeItemsFromRedoList(redoCreated))

    }

    const confirmUndo = () => {

        const undoneIds = [...new Set(redoList.map(item => item.id))]

        const currentScriptItemUpdates = undoneIds.map(item => currentScriptItems[item.id])

        //send updates to local server
        dispatch(addUpdates(currentScriptItemUpdates))
        dispatch(resetUndo())

    }



    return (null)
}

export default ScriptEditorProcessing;