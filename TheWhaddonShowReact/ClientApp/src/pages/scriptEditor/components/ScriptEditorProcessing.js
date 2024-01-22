//React and Redux
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    updateCurrentPartPersons,
    addItemsToRedoList,
    removeItemsFromRedoList,
    resetUndo,
    updateSceneInFocus,
    updateSceneOrders,
    updatePreviousCurtain,
    updateCurrentScriptItems,
    clearScriptEditorState,
    updateViewAsPartPerson,
    setReadOnly,
    updateInitialSyncProgress,
    UNDO, REDO, CONFIRM_UNDO, CLEAR_SCRIPT, UPDATE_VIEW_AS_PART_PERSON

} from '../../../actions/scriptEditor';

//utils
import { log, SCRIPT_EDITOR_PROCESSING as logType } from '../../../dataAccess/logging';
import { getTriggerUpdates } from '../scripts/trigger';
import { getUndoUpdates } from '../scripts/undo';
import { getScriptItemUpdatesLaterThanCurrent } from '../scripts/scriptItem';
import { getSceneOrderUpdates, isSceneAffectedByViewAsPartPerson } from '../scripts/sceneOrder';
import { newPartPersonsFromPartUpdates, newPartPersonsFromPersonUpdates } from '../scripts/part';

import { addUpdates } from '../../../actions/localServer';

import {
    alignRight,
} from '../scripts/sceneOrder'

import { moveFocusToId, END } from '../scripts/utility';

//constants
import { SCRIPT_ITEM, PART, PERSON } from '../../../dataAccess/localServerModels'
import { isScreenSmallerThan } from '../../../core/screenHelper';

export function ScriptEditorProcessing() {

    //This component is used to process updates from the localServer and update the scriptEditor state and vice versa.

    const _ = require('lodash');
    const dispatch = useDispatch();

    ///REDUX
    //localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const storedParts = useSelector(state => state.localServer.parts.history)
    const storedScriptItems = useSelector(state => state.localServer.scriptItems.history)


    //scriptEditor (handles data for display)
    const show = useSelector(state => state.scriptEditor.show)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const previousViewAsPartPerson = useSelector(state => state.scriptEditor.previousViewAsPartPerson)
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
    const currentUndo = useSelector(state => state.scriptEditor.currentUndo) || {}
    const undoSceneId = Object.keys(currentUndo)[0] || null
    const redoList = useSelector(state => state.scriptEditor.redoList)

    const screenSize = useSelector(state => state.layout.screenSize)
    const initialSyncProgress = useSelector(state => state.scriptEditor.initialSyncProgress)


    useEffect(() => {
        let currentFocus = null;
        for (var key in scriptItemInFocus) {
            if (scriptItemInFocus.hasOwnProperty(key)) {
                currentFocus = scriptItemInFocus[key];
            }
        }

        if (currentFocus && currentFocus.sceneId !== sceneInFocus?.id) {

            const newSceneInFocus = currentScriptItems[currentFocus.sceneId]

            dispatch(updateSceneInFocus(newSceneInFocus))
        }

    }, [scriptItemInFocus]) //eslint-disable-line react-hooks/exhaustive-deps



    useEffect(() => {
        const scenes = sceneOrders[show.id]
        if (scenes) {
            scenes.forEach(scene => {
                const isAffected = isSceneAffectedByViewAsPartPerson(scene, viewAsPartPerson, previousViewAsPartPerson, currentPartPersons)
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

        log(logType, 'UseEffect :', { scriptEditorTrigger, undoSceneId })
        if (!scriptEditorTrigger || Object.keys(scriptEditorTrigger).length === 0) return

        const { triggerType } = scriptEditorTrigger;

        if (triggerType === CONFIRM_UNDO && undoSceneId === null) {
            return;
        } else {
            log(logType, 'ScriptEditorTrigger', scriptEditorTrigger)
        }

        if (triggerType === CLEAR_SCRIPT) {
            dispatch(clearScriptEditorState());
            return;
        }
        if (triggerType === UPDATE_VIEW_AS_PART_PERSON) {
            dispatch(updateViewAsPartPerson(scriptEditorTrigger.partPerson))
        }



        //Undo processing
        //---------------------------------------------------------------------------------
        if ([UNDO, REDO, CONFIRM_UNDO].includes(triggerType) || undoSceneId) {  //|| undoSceneId combinedd with finalTriggerType allows for confirm undo if another action is triggered and undo not yet confirmed.
            const sceneId = scriptEditorTrigger.sceneId || undoSceneId
            const sceneOrder = sceneOrders[sceneId]

            const finalTriggerType = [UNDO, REDO, CONFIRM_UNDO].includes(triggerType) ? triggerType : CONFIRM_UNDO

            const undoUpdates = getUndoUpdates(finalTriggerType, sceneOrder, currentScriptItems, storedScriptItems, redoList, sceneId, currentPartPersons, storedParts, viewAsPartPerson) || {}

            const { currentScriptItemUpdates = [],
                currentPartPersonUpdates = [],
                redoListUpdates = [],
                redoCreated = null,
                scriptItemUpdates = [],
                sceneOrderUpdates = [],
                partUpdates = [],
                doResetUndo = false
            } = undoUpdates

            log(logType, 'getUndoUpdates', { undoUpdates, sceneOrderUpdates: undoUpdates.sceneOrderUpdates })

            if (currentScriptItemUpdates.length > 0) {
                log(logType, 'dispatch updateCurrentScriptItems', currentScriptItemUpdates)
                dispatch(updateCurrentScriptItems(currentScriptItemUpdates));
            }
            if (currentPartPersonUpdates.length > 0) {
                dispatch(updateCurrentPartPersons(currentPartPersonUpdates))
            }
            if (sceneOrderUpdates.length > 0) {
                log(logType, 'dispatch updateSceneOrders', sceneOrderUpdates)
                dispatch(updateSceneOrders(sceneOrderUpdates));
            }
            if (redoListUpdates.length > 0) {
                log(logType, 'dispatch addItemsToRedoList', redoListUpdates)
                dispatch(addItemsToRedoList(sceneId, redoListUpdates));
            }
            if (redoCreated) {
                dispatch(removeItemsFromRedoList(redoCreated))
            }
            if (scriptItemUpdates.length > 0) {
                dispatch(addUpdates(scriptItemUpdates, SCRIPT_ITEM))
            }
            if (partUpdates.length > 0) {
                dispatch(addUpdates(partUpdates, PART))
            }
            if (doResetUndo) {
                dispatch(resetUndo())
            }

            if ([REDO, UNDO, CONFIRM_UNDO].includes(triggerType)) return; //if undo or redo then return as no further processing required.)
            //else continue to remaining processing having confirmed undo.
        }

        //Remaining Processing = scriptItem and part updates
        //---------------------------------------------------------------------------------
        const { partUpdates = [],
            partPersonUpdates = [],
            scriptItemUpdates = [],
            sceneOrderUpdates = [],
            previousCurtainUpdates = [],
            moveFocus = null
        } = getTriggerUpdates(scriptEditorTrigger, currentScriptItems, sceneOrders, currentPartPersons, storedPersons, previousCurtainOpen, show, viewAsPartPerson)

        log(logType, 'ScriptEditorTrigger prior to dispatch', { partUpdates, partPersonUpdates, scriptItemUpdates, sceneOrderUpdates, previousCurtainUpdates })

        //Dispatch updates
        if (scriptItemUpdates.length > 0) {
            dispatch(updateCurrentScriptItems(scriptItemUpdates))
            dispatch(addUpdates(scriptItemUpdates, SCRIPT_ITEM)) //localServer
        }
        if (partUpdates.length > 0) {
            log(logType, 'partUpdates dispatch')
            dispatch(addUpdates(partUpdates, PART)) //localServer
            dispatch(updateCurrentPartPersons(partPersonUpdates))
        }
        if (sceneOrderUpdates.length > 0) {
            dispatch(updateSceneOrders(sceneOrderUpdates))
        }
        if (previousCurtainUpdates.length > 0) {
            previousCurtainUpdates.forEach(previousCurtainUpdate => {
                dispatch(updatePreviousCurtain(previousCurtainUpdate.sceneId, previousCurtainUpdate.previousCurtainOpen))
            })
        }


        //Moves Focus
        if (moveFocus) {
            moveFocusToId(moveFocus.id, moveFocus.position)
        }

    }, [scriptEditorTrigger]) // eslint-disable-line react-hooks/exhaustive-deps



    //Refresh trigger used to update scriptEditorScenes with additional partPerson info.
    useEffect(() => {

        log(logType, 'localServerTrigger', { type: localServerTrigger.type, updates: localServerTrigger.updates?.length })


        if (localServerTrigger.updates && localServerTrigger.type === SCRIPT_ITEM) {

            const scriptItemUpdates = localServerTrigger.updates
            const currentScriptItemUpdates = getScriptItemUpdatesLaterThanCurrent(scriptItemUpdates, currentScriptItems)
            const { sceneOrderUpdates, previousCurtainUpdates } = getSceneOrderUpdates(currentScriptItemUpdates, currentScriptItems, sceneOrders, viewAsPartPerson, currentPartPersons)

            if (currentScriptItemUpdates.length > 0) {
                dispatch(updateCurrentScriptItems(currentScriptItemUpdates))
                if (Object.keys(currentScriptItems).length === 0) {
                    log(logType,'updateInitialSyncProcess SCRIPTITEM', { initialSyncProgress })
                    dispatch(updateInitialSyncProgress(initialSyncProgress + 0.7))
                }
            }
            if (sceneOrderUpdates.length > 0) {
                dispatch(updateSceneOrders(sceneOrderUpdates))
            }
            if (previousCurtainUpdates.length > 0) {
                previousCurtainUpdates.forEach(previousCurtainUpdate => {
                    dispatch(updatePreviousCurtain(previousCurtainUpdate.sceneId, previousCurtainUpdate.previousCurtainOpen))
                })
            }

            if (initialSyncProgress.scriptItem === 0) dispatch(updateInitialSyncProgress(SCRIPT_ITEM))
        }

        if (localServerTrigger.updates && localServerTrigger.type === PART) {

            const partUpdates = localServerTrigger.updates

            const newPartPersons = newPartPersonsFromPartUpdates(partUpdates, currentPartPersons, storedPersons)

            dispatch(updateCurrentPartPersons(newPartPersons))
            if (initialSyncProgress.part === 0) dispatch(updateInitialSyncProgress(PART))

        }

        if (localServerTrigger.updates && localServerTrigger.type === PERSON) {

            const personUpdates = localServerTrigger.updates

            const newPartPersons = newPartPersonsFromPersonUpdates(personUpdates, currentPartPersons)

            dispatch(updateCurrentPartPersons(newPartPersons))
            if (initialSyncProgress.person === 0) dispatch(updateInitialSyncProgress(PERSON))
        }

    }, [localServerTrigger]) // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        if (isScreenSmallerThan('md')) {
            dispatch(setReadOnly(true))
        }
    }, [screenSize]) // eslint-disable-line react-hooks/exhaustive-deps




    return (null)
}

export default ScriptEditorProcessing;



const copy = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}   