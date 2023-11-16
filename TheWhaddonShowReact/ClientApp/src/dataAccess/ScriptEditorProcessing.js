//React and Redux
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updatePartPersons, updateScenePartPersons, addUpdatesToSceneScriptItemHistory, addUpdatesToSceneHistory } from '../actions/scriptEditor';

//utils
import { log } from '../helper';
import { getLatest, prepareUpdates } from '../dataAccess/localServerUtils';
import { addPersonsInfo } from '../pages/scriptEditor/scripts/part';
import { PartUpdate } from '../dataAccess/localServerModels';
import { addUpdates } from '../actions/localServer';

import { SHOW, ACT, SCENE, CURTAIN_TYPES } from '../dataAccess/scriptItemTypes'

import { SCRIPT_ITEM } from '../dataAccess/localServerModels'

export function ScriptEditorProcessing() {

    const _ = require('lodash');
    const dispatch = useDispatch();


    const debug = true;

    //Redux - localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const storedParts = useSelector(state => state.localServer.parts.history)
    //Redux - scriptEditor (handles data for display)
    const partPersons = useSelector(state => state.scriptEditor.partPersons)
    const sceneHistory = useSelector(state => state.scriptEditor.sceneHistory)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons)


    //refreshTrigger contains the updates successfully processed when the ADD_UPDATES action is dispatched.
    const refreshTrigger = useSelector((state) => state.localServer.refresh)


    //Refresh trigger used to update scriptEdiotorScenes with additional partPerson info.
    useEffect(() => {
        log(debug, 'EventsCheck ScriptEditorProcessing useEffect refreshTrigger', refreshTrigger)

        if (refreshTrigger.updates && refreshTrigger.type === SCRIPT_ITEM) {
            const scriptItemUpdates = refreshTrigger.updates
            const sceneUpdates = scriptItemUpdates.filter(update => update.type === SHOW ||
                                                                    update.type === ACT ||
                                                                    update.type === SCENE)

            const sceneCurtainUpdates = scriptItemUpdates.some(update=>CURTAIN_TYPES.includes(update.type))
            
            //Update scriptEditor.sceneScriptItemsHistory
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


            if (sceneUpdates && sceneUpdates.length > 0) {
                //const sceneIds = [...new Set(sceneUpdates.map(update => update.parentId))]
                //Update scriptEditor.scenesHistory
                //sceneIds.forEach(sceneId => {
                //    const updates = sceneUpdates.filter(update => update.parentId === sceneId)
                //    dispatch(addUpdatesToSceneHistory(updates))
                //})
                log(debug, 'EventsCheck ScriptEditorProcessing dispatchUpdateToSceneHistory', sceneUpdates)
                dispatch(addUpdatesToSceneHistory(sceneUpdates))

            }

        }

    }, [refreshTrigger])


    //Update PartPersons 
    useEffect(() => {
        log(debug, 'PartPersons: storedParts', storedParts)
        const latestPersons = getLatest(storedPersons || [])
        const latestParts = getLatest(storedParts || [])



        const partPersons = addPersonsInfo(latestParts, latestPersons)



        dispatch(updatePartPersons(partPersons))

    }, [storedPersons, storedParts])

    //Update ScenePartPersons
    useEffect(() => {


        const latestScenes = getLatest(sceneHistory || [])
        const latestParts = getLatest(storedParts || [])
        log(debug, 'PartPersons: latestScenes', latestScenes)
        log(debug, 'PartPersons: scenes hisotry ', sceneHistory)
        log(debug, 'PartPersons: partPersons', partPersons)


        //Adds new partPersons if not already in redux store
        const storedPartIds = [...new Set([...storedParts].map(partPerson => partPerson.id))];
        let newPartIds = [];

        latestScenes.forEach(scene => {
            const newIds = scene.partIds.filter(partId => !storedPartIds.includes(partId))
            newPartIds = [...newPartIds, ...newIds]
        });

        const newPartUpdates = prepareUpdates(newPartIds.map(partId => { return { ...new PartUpdate(), id: partId } }))

        dispatch(addUpdates(newPartUpdates, 'Part'))

        //Makes any partPersons that are no longer allocated in any scene inActive

        const scenePartIds = [...new Set(latestScenes.map(scene => scene.partIds).flat())]
        const partsToDelete = latestParts.filter(part => !scenePartIds.includes(part.id))

        const deletePartUpdates = prepareUpdates(partsToDelete.map(part => { return { ...part, isActive: false } }))

        dispatch(addUpdates(deletePartUpdates, 'Part'))



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


    return (null)
}

export default ScriptEditorProcessing;


