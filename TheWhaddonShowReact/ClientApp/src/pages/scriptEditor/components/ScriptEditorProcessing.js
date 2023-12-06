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
    updateSceneOrders,
    updatePreviousCurtain,
    updateCurrentScriptItems,
    clearScriptEditorState,
    UNDO, REDO, CONFIRM_UNDO, CLEAR_SCRIPT

} from '../../../actions/scriptEditor';

//utils
import { log } from '../../../helper';
import { getTriggerUpdates } from '../scripts/trigger';
import { getUndoUpdates } from '../scripts/undo';
import { getScriptItemUpdatesLaterThanCurrent } from '../scripts/scriptItem';
import { getSceneOrderUpdates, isAffectedByViewAsPartPerson } from '../scripts/sceneOrder';
import { newPartPersonsFromPartUpdates, newPartPersonsFromPersonUpdates } from '../scripts/part';

import { addUpdates } from '../../../actions/localServer';

import {
    alignRight,
} from '../scripts/sceneOrder'

import { moveFocusToId, END } from '../scripts/utility';

//constants
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
    const show = useSelector(state => state.scriptEditor.show)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const scriptItemInFocus = useSelector(state => state.scriptEditor.scriptItemInFocus)
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const previousCurtainOpen = useSelector(state => state.scriptEditor.previousCurtainOpen)

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

    }, [scriptItemInFocus]) //eslint-disable-line react-hooks/exhaustive-deps



    useEffect(() => {
        const scenes = sceneOrders[show.id]
        if (scenes) {
            scenes.forEach(scene => {
                const isAffected = isAffectedByViewAsPartPerson(scene, viewAsPartPerson, currentPartPersons)
                if (isAffected) {
                    const newSceneOrder = alignRight(sceneOrders[scene.id], viewAsPartPerson, currentPartPersons)
                    if (newSceneOrder.length > 0) {
                        dispatch(updateSceneOrders([newSceneOrder]))
                    }
                }

            })
        }
    }, [viewAsPartPerson]) //eslint-disable-line react-hooks/exhaustive-deps

    //ScriptEditorTrigger Processing
    //---------------------------------------------------------------------------------
    //the scriptEditorTrigger is used to trigger updates to the scriptEditor state.
    //without this intermediary step there were significant calculation repeats through re-renders.
    //This ensures calculation is done once per update and reduces re-renders.

    useEffect(() => {

        log(debug, 'Component:ScriptEditorProcessing: ScriptEditorTrigger', scriptEditorTrigger)

        if (!scriptEditorTrigger || Object.keys(scriptEditorTrigger).length === 0) return

        const { triggerType } = scriptEditorTrigger;
        if (triggerType === CLEAR_SCRIPT) {
            dispatch(clearScriptEditorState);
            return;
        }

        //Undo processing
        //---------------------------------------------------------------------------------
        if ([UNDO, REDO, CONFIRM_UNDO].includes(triggerType)) {
            const sceneId = scriptEditorTrigger.sceneId || undoSceneId
            const sceneOrder = sceneOrders[sceneId]

            const { currentScriptItemUpdates = [],
                redoListUpdates = [],
                redoCreated = null,
                scriptItemUpdates = [],
                sceneOrderUpdates = [],
                doResetUndo = false
            } = getUndoUpdates({ triggerType, sceneOrder, currentScriptItems, storedScriptItems, redoList, undoSceneId, currentPartPersons, storedParts, viewAsPartPerson })
            if (currentScriptItemUpdates) {
                dispatch(updateCurrentScriptItems(currentScriptItemUpdates));
            }
            if (sceneOrderUpdates) {
                dispatch(updateSceneOrders(sceneOrderUpdates));
            }
            if (redoListUpdates) {
                dispatch(addItemsToRedoList(sceneId, redoListUpdates));
            }
            if (redoCreated) {
                dispatch(removeItemsFromRedoList(redoCreated))
            }
            if (scriptItemUpdates) {
                dispatch(addUpdates(scriptItemUpdates, SCRIPT_ITEM))
            }
            if (doResetUndo) {
                dispatch(resetUndo())
            }

            return;
        }

        //Remaining Processing = scriptItem and part updates
        //---------------------------------------------------------------------------------
        const { partUpdates = [],
            partPersonUpdates = [],
            scriptItemUpdates = [],
            sceneOrderUpdates = [],
            previousCurtainUpdates = [],
            moveFocus = null
        } = getTriggerUpdates({ trigger: scriptEditorTrigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show, viewAsPartPerson })

        //Dispatch updates   
        if (scriptItemUpdates.length > 0) {
            dispatch(addUpdates(scriptItemUpdates, SCRIPT_ITEM)) //localServer
        }
        if (partUpdates.Length > 0) {
            dispatch(addUpdates(partUpdates, PART)) //localServer
            dispatch(updateCurrentPartPersons(partPersonUpdates))
        }
        if (sceneOrderUpdates.length > 0) {
            dispatch(updateSceneOrders(sceneOrderUpdates))
        }
        if (previousCurtainUpdates.length > 0) {
            previousCurtainUpdates.forEach(previousCurtainUpdate => {
                dispatch(updatePreviousCurtain(previousCurtainUpdate))
            })
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
            const currentScriptItemUpdates = getScriptItemUpdatesLaterThanCurrent(scriptItemUpdates, currentScriptItems)
            const { sceneOrderUpdates, previousCurtainUpdates } = getSceneOrderUpdates(currentScriptItemUpdates, currentScriptItems, sceneOrders)

            if (currentScriptItemUpdates.length > 0) {
                dispatch(updateCurrentScriptItems(currentScriptItemUpdates))
            }
            if (sceneOrderUpdates.length > 0) {
                dispatch(updateSceneOrders(sceneOrderUpdates))
            }
            if (previousCurtainUpdates.length > 0) {
                previousCurtainUpdates.forEach(previousCurtainUpdate => {
                    dispatch(updatePreviousCurtain(previousCurtainUpdate))
                })
            }
        }

        if (localServerTrigger.updates && localServerTrigger.type === PART) {

            const partUpdates = localServerTrigger.updates

            const newPartPersons = newPartPersonsFromPartUpdates(partUpdates, currentPartPersons, storedPersons)

            dispatch(updateCurrentPartPersons(newPartPersons))
        }

        if (localServerTrigger.updates && localServerTrigger.type === PERSON) {

            const personUpdates = localServerTrigger.updates

            const newPartPersons = newPartPersonsFromPersonUpdates(personUpdates, currentPartPersons)

            dispatch(updateCurrentPartPersons(newPartPersons))
        }

    }, [localServerTrigger]) //eslint disable-line react-hooks/exhaustive-deps


    return (null)
}

export default ScriptEditorProcessing;