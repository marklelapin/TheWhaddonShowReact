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
    updateUndoDateTime,
    updateShowComments,
    updatePreviousCurtain,
} from '../actions/scriptEditor';

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
    newScriptItemsForSwapPart,
    newScriptItemsForToggleCurtain,
    clearCurtainTags,
    newScriptItemsForAddComment,
    sortLatestScriptItems,
} from '../pages/scriptEditor/scripts/scriptItem'
import { moveFocusToId } from '../pages/scriptEditor/scripts/utility';

//constants
import { SHOW, ACT, SCENE, CURTAIN_TYPES, DIALOGUE, CURTAIN } from '../dataAccess/scriptItemTypes'
import { SCRIPT_ITEM, PART } from '../dataAccess/localServerModels'
import {
    UPDATE_TEXT, UPDATE_PART_IDS, UPDATE_TAGS, ADD_TAG, REMOVE_TAG,
    UPDATE_ATTACHMENTS, UPDATE_TYPE,
    OPEN_CURTAIN, CLOSE_CURTAIN, TOGGLE_CURTAIN, ADD_COMMENT,
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



    const sceneOrders = useSelector(state => state.scriptEditor.sceneOrders)



    //ScriptEditorTrigger Processing
    //---------------------------------------------------------------------------------
    //the scriptEditorTrigger is used to trigger updates to the scriptEditor state.
    //without this intermediary step there are signficant re-renders of a large number of items.
    //This component spefically targets state that need updating when a scriptItem is changed.


    useEffect(() => {

        log(debug, 'Component:ScriptEditorProcessing: ScriptEditorTrigger', scriptEditorTrigger)

        if (!scriptEditorTrigger || Object.keys(scriptEditorTrigger).length === 0) return

        const { type,
            value,
            tag,
            scriptItem,
            position,
            direction,
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
            default: break; //TODO confirm Undo if not already done here and if unfinished on different sceneId. REmvoe confirm undos from components.
        }



        //process scriptItem jobs

        const scene = currentScriptItems[sceneId]

        const sceneOrder = sceneOrder[sceneId]

        const sceneScriptItems = getLatest(sceneScriptItemHistory[sceneId] || [])


        let internalUpdates = []; //updates only affecting a single scriptItem
        let sceneUpdates = []; //updates affecting multiple scriptItems and the order of scriptItems in a scene
        let curtainUpdates = []; // updates affecting the curtain of a scene
        let showUpdates = []; //updates affecting the order of scenes in a show
        let newSceneOrder = [];
        let moveFocus = { id: scriptItem.id, position: END } //default move focus to next item in list unles change in switch statement.

        switch (type) {

            case UPDATE_TEXT: internalUpdates.push({ ...scriptItem, text: value });
                moveFocus = { id: scriptItem.nextId, position: END }
                break;;
            case UPDATE_PART_IDS: internalUpdates.push({ ...scriptItem, partIds: value }); break;
            case UPDATE_TAGS: internalUpdates.push({ ...scriptItem, tags: value }); break;
            case ADD_TAG: internalUpdates.push({ ...scriptItem, tags: [...scriptItem.tags.filter(item => item !== tag).push(tag)] }); break;
            case REMOVE_TAG: internalUpdates.push({ ...scriptItem, tags: scriptItem.tags.filter(item => item !== tag) }); break;
            case UPDATE_ATTACHMENTS: internalUpdates.push({ ...scriptItem, attachments: value }); break;
            case UPDATE_TYPE: let newTypeUpdate = { ...scriptItem, type: value };
                if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type
                    newTypeUpdate = newScriptItemsForToggleCurtain(newTypeUpdate, true) //set it to open curtain.
                    curtainUpdates.push(newTypeUpdate)
                } else if (CURTAIN_TYPES.includes(scriptItem.type)) { //i.e. its coming from a curtain type
                    newTypeUpdate.text = '';
                    newTypeUpdate = clearCurtainTags(newTypeUpdate)
                    curtainUpdates.push(newTypeUpdate)
                } else {
                    internalUpdates.push(newTypeUpdate);
                }
                break;
            case OPEN_CURTAIN: curtainUpdates = [...curtainUpdates, ...newScriptItemsForToggleCurtain(scriptItem, true)]; break;
            case CLOSE_CURTAIN: curtainUpdates = [...curtainUpdates, ...newScriptItemsForToggleCurtain(scriptItem, false)]; break;
            case TOGGLE_CURTAIN: curtainUpdates = [...curtainUpdates, ...newScriptItemsForToggleCurtain(scriptItem)]; break;
            case ADD_COMMENT:
                sceneUpdates = [...sceneUpdates, ...newScriptItemsForAddComment(scriptItem, value)]
                
                moveFocus =null //newly creatd add script item will by default become focus.
                dispatch(updateShowComments(true));
                break;
            case DELETE_COMMENT:
                sceneUpdates = newScriptItemsForDeleteComment(scriptItem, sceneScriptItems); break; //todo
                moveFocus = { id: scriptItem.previousId, position: END };
            case ADD_SCRIPT_ITEM:
                sceneUpdates = newScriptItemsForCreate(position, scriptItem, sceneScriptItems, DIALOGUE, tempTextValue); break;
                moveFocus = null //newly created add script item will by default become focus.
            case DELETE_SCRIPT_ITEM:
                sceneUpdates = newScriptItemsForDelete(scriptItem, sceneScriptItems); break;
                if (direction == UP) {
                    moveFocus = { id: scriptItem.previousId, position: END };
                } else {
                    moveFocus = { id: scriptItem.nextId, position: END };
                }
            case DELETE_NEXT_SCRIPT_ITEM:
                const nextScriptItem = sceneScriptItems.find(item => item.id === scriptItem.nextId)
                sceneUpdates = newScriptItemsForDelete(nextScriptItem, sceneScriptItems);
                moveFocus = { id: scriptItem.Id, position: END };
                break;
            case DELETE_SCENE:
                showUpdates = newScriptItemsForSceneDelete(scriptItem, sceneScriptItems);
                moveFocus = { id: scriptItem.nextId, position: END };
                break;
            case SWAP_PART: sceneUpdates = newScriptItemsForSwapPart(sceneScriptItems, oldPartId, newPartId);
                moveFocus = { id: newPartId,position: END}; 
                break;
            case UPDATE_SCENE_PART_IDS:
                const scene = sceneScriptItems.find(item => item.id === sceneId)
                const newScene = { ...scene, partIds: partIds };
                sceneUpdates = [newScene];
                moveFocus = null
                break;
            default: break;
        }

        let preparedUpdates = [];

        const nonCurtainUpdates = [...internalUpdates, ...sceneUpdates, ...showUpdates]
        if (nonCurtainUpdates > 0) {
            preparedUpdates = prepareUpdates(nonCurtainUpdates)

            dispatch(updateCurrentScriptItems(preparedUpdates))
            dispatch(addUpdatesToLocalServer(preparedUpdates, SCRIPT_ITEM))
        }

        const multiUpdates = [...sceneUpdates, ...showUpdates]
        if (multiUpdates.length > 0) {
            const scene = currentScriptItems[sceneId]
            newSceneOrder = refreshSceneOrder(scene, preparedUpdates) //adds preparedUpdates into sceneOrder and reorders.
        }

        if (curtainUpdates.length > 0) {

            refreshSceneAndNextSceneOrder(scene) //works out changes to curtainOpen values across

        }

        if (moveFocus) {
            moveFocusToId(moveFocus.id,moveFocus.position)
        }


    }, [scriptEditorTrigger])


    const refreshSceneOrder = (scene, updates=[]) => {

        const previousCurtain = previousCurtain[scene.id]

        const newSceneOrder = sortLatestScriptItems(scene, [...sceneOrders[scene.id], ...updates], previousCurtain, null)

        //add z-index calculation using current sceneORder fro current z-indexes. 

        const newPreviousCurtain = newSceneOrder[newSceneOrder.length - 1].curtainOpen;
        dispatch(updatePreviousCurtain(scene.nextId,newPreviousCurtain))
        return { newSceneOrder, previousCurtain : newPreviousCurtain };
    }

    const refreshSceneAndNextSceneOrder = (sceneId,updates=[]) => {

        const { newSceneOrder, previousCurtain } = refreshSceneOrder(sceneId, updates)

        const { nextSceneOrder, previousCurtain } = refreshSceneOrder(currentScriptItems[sceneId].nextId)

        //COULDn't ge tot he end of thiss!!!

        //work out curtain and dispatch changes to sceneOrders both at same time.

        //add z-index calculation

    }

 also need to add in parts calculation below.
































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







    ///Undo processing
    const undo = (sceneId) => {
        const nextUndoDate = getNextUndoDate(sceneScriptItemHistory[sceneId], undoDateTime)
        dispatch(updateUndoDateTime(nextUndoDate, sceneId))
    }

    const redo = (sceneId) => {
        const nextUndoDate = getNextRedoDate(sceneScriptItemHistory[sceneId], undoDateTime)
        dispatch(updateUndoDateTime(nextUndoDate, sceneId))
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

        dispatch(updateUndoDateTime(null, null))

    }





    return (null)
}

export default ScriptEditorProcessing;




const get zIndex = () -



const getHeader = () => {
    switch (type) {
        case DIALOGUE:
            if (scenePartPersons) {
                const partPersons = scriptItem.partIds.map(partId => scenePartPersons.partPersons.find(partPerson => partPerson.id === partId))

                const partNames = partPersons.map(partPersons => partPersons?.name).join(',')

                return partNames || '-'
            }; break;
        case SCENE:
            return `Scene ${sceneNumber}.` || null
        case STAGING:
            return 'Staging' || null
        case INITIAL_STAGING:
            return 'Initial Staging' || null

        default: return null;
    }

}

This is the code from = scene for generate cscene order.
    //useEffect Hooks
    useEffect(() => {
        error
        let newScriptItems = sortLatestScriptItems(currentScene, [...sceneScriptItemHistory], undoDateTime)

        setScriptItems(newScriptItems)

    }, [undoDateTime, sceneScriptItemHistory, id]) //es-lint disable-line react-hooks/exhaustive-deps


 //work out alignment
        const partIdsOrder = [...new Set(bodyScriptItems.map(item => item.partIds[0]))]

const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

const righthandPartId = scenePartPersons?.partPersons?.find(partPerson => partPerson.id === viewAsPartPerson?.id || partPerson.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

const alignedScriptItems = bodyScriptItems.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

return alignedScriptItems



    / soverid next and prviosu id

currentScene.partIds[0]

either side fo parteditor

currentScene.partIds[partIds.length - 1]


bottom script ITem:

nextFocusId = {(scriptItem.nextId === null) ? currentScene.nextId : null}