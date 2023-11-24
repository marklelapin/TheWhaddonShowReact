//React and Redux
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    updatePartPersons,
    updateScenePartPersons,
    addUpdateToScriptItemHistory,
    addUpdatesToSceneScriptItemHistory,
    addUpdatesToSceneHistory,
    trigger,
    updateUndoDateTime
} from '../actions/scriptEditor';

//components
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { log } from '../helper';
import { getLatest, prepareUpdates } from '../dataAccess/localServerUtils';
import { addPersonsInfo } from '../pages/scriptEditor/scripts/part';
import { PartUpdate } from '../dataAccess/localServerModels';
import { addUpdates } from '../actions/localServer';
import { getNextUndoDate, getNextRedoDate } from '../pages/scriptEditor/scripts/undo';
import {
    updatePreviousCurtainValue,
    newScriptItemsForCreate,
    newScriptItemsForDelete,
    newScriptItemsForSceneDelete,
    newScriptItemsForDeleteComment,
    newScriptItemsForSwapPart
} from '../pages/scriptEditor/scripts/scriptItem'


//constants
import { SHOW, ACT, SCENE, CURTAIN_TYPES, DIALOGUE } from '../dataAccess/scriptItemTypes'
import { SCRIPT_ITEM, PART } from '../dataAccess/localServerModels'
import {
    UNDO, REDO, CONFIRM_UNDO, DELETE_COMMENT,
    ADD_SCRIPT_ITEM, DELETE_SCRIPT_ITEM,
    DELETE_NEXT_SCRIPT_ITEM, DELETE_SCENE,
    SWAP_PART, UPDATE_SCENE_PART_IDS
} from '../actions/scriptEditor'


export function ScriptEditorProcessing() {

    //This component is used to process updates from the localServer and update the scriptEditor state.
    //It also handles all updates to scriptItems involving more than 1 scriptItem when scriptEditor.trigger is changed.
    //This significantly reduces re-renders of scriptEditor components by re-rendering this component instead which always returns null.

    const _ = require('lodash');
    const dispatch = useDispatch();

    const debug = true;

    //Redux - localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const storedParts = useSelector(state => state.localServer.parts.history)
    const storedScriptItems = useSelector(state => state.localServer.scriptItems.history)
    //Redux - scriptEditor (handles data for display)
    const partPersons = useSelector(state => state.scriptEditor.partPersons)
    const sceneHistory = useSelector(state => state.scriptEditor.sceneHistory)
    const sceneScriptItemHistory = useSelector(state => state.scriptEditor.sceneScriptItemHistory)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons)
    const scriptEditorTrigger = useSelector(state => state.scriptEditor.trigger)
    const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)
    const undoSceneId = useSelector(state => state.scriptEditor.undoSceneId)

    //refreshTrigger contains the updates successfully processed when the ADD_UPDATES action is dispatched.
    const localServerTrigger = useSelector((state) => state.localServer.refresh)



    //Refresh trigger used to update scriptEditorScenes with additional partPerson info.
    useEffect(() => {
        log(debug, 'Component:ScriptEditorProcessing useEffect refreshTrigger', localServerTrigger)

        if (localServerTrigger.updates && localServerTrigger.type === SCRIPT_ITEM) {
            const scriptItemUpdates = localServerTrigger.updates
            const sceneUpdates = scriptItemUpdates.filter(update => update.type === SHOW ||
                update.type === ACT ||
                update.type === SCENE)

            const curtainUpdates = scriptItemUpdates.filter(update => CURTAIN_TYPES.includes(update.type))


            //Update object map for scriptItem
            if (scriptItemUpdates) {
                scriptItemUpdates.forEach(update => {
                    dispatch(addUpdateToScriptItemHistory(update))
                })

            }


            //Update object map for scene
            if (scriptItemUpdates) {

                const scriptItemIds = [...scriptItemUpdates].map(update => update.parentId || update.id)
                const sceneIds = sceneUpdates.map(update => update.id)

                const uniqueSceneIds = [...new Set([...scriptItemIds, ...sceneIds])]

                uniqueSceneIds.forEach(sceneId => {
                    const updates = scriptItemUpdates.filter(update => update.parentId === sceneId || update.id === sceneId)

                    log(debug, 'EventsCheck ScriptEditorProcessing dispatchUpdateToSceneSCriptItemHistory', { sceneId: sceneId, updates: updates })
                    dispatch(addUpdatesToSceneScriptItemHistory(sceneId, updates))
                })
            }

            //Update array of top-level scene
            if (sceneUpdates && sceneUpdates.length > 0) {
                log(debug, 'EventsCheck ScriptEditorProcessing dispatchUpdateToSceneHistory', sceneUpdates)
                dispatch(addUpdatesToSceneHistory(sceneUpdates))

            }

            if (curtainUpdates) {
                log(debug, 'ScriptEditorProcessing CurtainUpdates', curtainUpdates)
                curtainUpdates.forEach(update => {
                    const sceneId = update.parentId

                    const scene = getLatest(storedScriptItems.filter(item => item.id === sceneId))[0]

                    if (scene) {
                        const scriptItems = storedScriptItems.filter(item => item.parentId === sceneId || item.id === sceneId)

                        log(debug, 'ScriptEditorProcessing CurtainUpdate', { scene, scriptItems })
                        updatePreviousCurtainValue(scene, scriptItems, dispatch)
                    }

                })
            }

        }

    }, [localServerTrigger])


    //Update PartPersons 
    useEffect(() => {
        log(debug, 'Component:ScriptEditorProcessing: PartPersons: storedParts', storedParts)
        const latestPersons = getLatest(storedPersons || [])
        const latestParts = getLatest(storedParts || [])
        const partPersons = addPersonsInfo(latestParts, latestPersons)

        dispatch(updatePartPersons(partPersons))

    }, [storedPersons, storedParts])

    //Update ScenePartPersons
    useEffect(() => {

        log(debug, 'Component:ScriptEditorProcessing: scenePartPersons')

        const latestScenes = getLatest(sceneHistory || [])
        const latestParts = getLatest(storedParts || [])

        const storedPartIds = [...new Set([...storedParts].map(partPerson => partPerson.id))];
        let newPartIds = [];

        latestScenes.forEach(scene => {
            const newIds = scene.partIds.filter(partId => !storedPartIds.includes(partId))
            newPartIds = [...newPartIds, ...newIds]
        });

        const newPartUpdates = prepareUpdates(newPartIds.map(partId => { return { ...new PartUpdate(), id: partId } }))

        dispatch(addUpdates(newPartUpdates, 'Part'))

        ////Makes any partPersons that are no longer allocated in any scene inActive

        //const scenePartIds = [...new Set(latestScenes.map(scene => scene.partIds).flat())]
        //const partsToDelete = latestParts.filter(part => !scenePartIds.includes(part.id))

        //const deletePartUpdates = prepareUpdates(partsToDelete.map(part => { return { ...part, isActive: false } }))

        //dispatch(addUpdates(deletePartUpdates, 'Part'))

        const newScenePartPersons = latestScenes.map(scene => {
            return {
                ...scene,
                partPersons: scene.partIds.map(partId =>
                    partPersons.find(part => part.id === partId)
                    || { ...new PartUpdate(), id: partId })
            }
        })

        const oldScenePartPersons = scenePartPersons || {}

        log(debug, 'PartPersons: oldScenePartPersons', oldScenePartPersons)

        log(debug, 'newSCnePArtPerson', newScenePartPersons)

        newScenePartPersons.forEach(item => {

            if (_.isEqual(item, oldScenePartPersons[item.id]) === false) {
                log(debug, 'PartPersons: dispatchUpdateToScenePartPersons', item)
                dispatch(updateScenePartPersons(item.id, item))
            }

        })

    }, [partPersons, sceneHistory])


    //ScriptEditorTrigger Processing
    //---------------------------------------------------------------------------------
    useEffect(() => {

        log(debug, 'Component:ScriptEditorProcessing: ScriptEditorTrigger', scriptEditorTrigger)

        if (!scriptEditorTrigger || Object.keys(scriptEditorTrigger).length === 0) return

        const { type,
            scriptItem,
            position,
            tempTextValue,
            oldPartId,
            newPartId,
            sceneId: draftSceneId,
            partIds,
        } = scriptEditorTrigger

        let sceneId

        if (draftSceneId) {
            sceneId = draftSceneId;
        } else if ([UNDO, REDO, CONFIRM_UNDO].includes(type)) {
            sceneId = undoSceneId
        } else {
            sceneId = (scriptItem?.type === SCENE) ? scriptItem.id : scriptItem.parentId
        }


        //send off undo jobs
        switch (type) {

            case UNDO: undo(sceneId); return
            case REDO: redo(sceneId); return
            case CONFIRM_UNDO: confirmUndo(sceneId); return;
            default: break;
        }

        //process scriptItem jobs


        const sceneScriptItems = getLatest(sceneScriptItemHistory[sceneId] || [])

        let updates = [];

        switch (type) {
            case DELETE_COMMENT: updates = newScriptItemsForDeleteComment(scriptItem, sceneScriptItems); break; //todo
            case ADD_SCRIPT_ITEM: updates = newScriptItemsForCreate(position, scriptItem, sceneScriptItems, DIALOGUE, tempTextValue); break;
            case DELETE_SCRIPT_ITEM: updates = newScriptItemsForDelete(scriptItem, sceneScriptItems); break;
            case DELETE_NEXT_SCRIPT_ITEM:
                const nextScriptItem = sceneScriptItems.find(item => item.id === scriptItem.nextId)
                updates = newScriptItemsForDelete(nextScriptItem, sceneScriptItems); break;
            case DELETE_SCENE: updates = newScriptItemsForSceneDelete(scriptItem, sceneScriptItems); break;
            case SWAP_PART: updates = newScriptItemsForSwapPart(sceneScriptItems, oldPartId, newPartId); break;
            case UPDATE_SCENE_PART_IDS:
                const scene = sceneScriptItems.find(item => item.id === sceneId)
                const newScene = { ...scene, partIds: partIds };
                updates = [newScene];
                break;
            default: break;
        }

        if (updates.length > 0) {
            const preparedUpdates = prepareUpdates(updates)
            dispatch(addUpdates(preparedUpdates, 'ScriptItem'))
        }


    }, [scriptEditorTrigger])




    ///Undo processing
    const undo = (sceneId) => {
        const nextUndoDate = getNextUndoDate(sceneScriptItemHistory[sceneId], undoDateTime)
        dispatch(updateUndoDateTime(nextUndoDate,sceneId))
    }

    const redo = (sceneId) => {
        const nextUndoDate = getNextRedoDate(sceneScriptItemHistory[sceneId], undoDateTime)
        dispatch(updateUndoDateTime(nextUndoDate,sceneId))
    }

    const confirmUndo = (sceneId) => {

        //process changed scriptItems
        if (undoDateTime === null) return;

        const idsToUpdate = new Set(sceneScriptItemHistory[sceneId].filter(item => new Date(item.created) >= undoDateTime).map(item => item.id))

        const currentUndoScriptItems = getLatest(sceneScriptItemHistory[sceneId], undoDateTime)
        //convert to array
        const arrayIds = [...idsToUpdate];

        //filter the scriptItems matching the ids
        const changeScriptItems = currentUndoScriptItems.filter((item) => arrayIds.includes(item.id));
        const changeScriptItemIds = changeScriptItems.map(item => item.id)

        const deleteScriptItemIds = arrayIds.filter(id => !changeScriptItemIds.includes(id))

        let deleteScriptItems = getLatest(sceneScriptItemHistory[sceneId].filter(item => deleteScriptItemIds.includes(item.id)))

        deleteScriptItems = deleteScriptItems.map(item => ({ ...item, isActive: false }))


        //update these scriptItems
        const updates = prepareUpdates([...changeScriptItems, ...deleteScriptItems]);

        dispatch(addUpdates(updates, 'ScriptItem'));

        dispatch(updateUndoDateTime(null,null))

    }





    return (null)
}

export default ScriptEditorProcessing;





