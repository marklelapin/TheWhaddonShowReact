﻿//React and Redux
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'react-redux';

import { updatePartPersons, updateScenePartPersons, addUpdatesToSceneScriptItemHistory, addUpdatesToSceneHistory} from 'actions/scriptEditor';

//utils
import { log } from 'helper';
import { getLatest } from 'dataAccess/localServerUtils';
import { addPersonsInfo } from 'dataAccess/partScripts';
import { PartUpdate } from 'dataAccess/localServerModels';

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
        log(debug, 'ScriptEditorProcessing useEffect refreshTrigger', refreshTrigger)

        if (refreshTrigger.updates && refreshTrigger.type ==='ScriptItem') {
            const scriptItemUpdates = refreshTrigger.updates
            const sceneUpdates = scriptItemUpdates.filter(update => update.type === 'Show' || update.type === 'Act' || update.type === 'Scene')


            //Update scriptEditor.sceneScriptItemsHistory
            if (scriptItemUpdates) {

                const sceneIds = [...new Set(scriptItemUpdates.map(update => update.parentId || update.id))]

                sceneIds.forEach(sceneId => {
                    const updates = scriptItemUpdates.filter(update => update.parentId === sceneId || update.id === sceneId)

                    log(debug, 'ScriptEditorProcessing dispatchUpdateToSceneSCriptItemHistory', { sceneId: sceneId, updates: updates })
                    dispatch(addUpdatesToSceneScriptItemHistory(sceneId,updates))
                })
            }

            
            if (sceneUpdates) {
                //const sceneIds = [...new Set(sceneUpdates.map(update => update.parentId))]
                //Update scriptEditor.scenesHistory
                //sceneIds.forEach(sceneId => {
                //    const updates = sceneUpdates.filter(update => update.parentId === sceneId)
                //    dispatch(addUpdatesToSceneHistory(updates))
                //})
         
                dispatch(addUpdatesToSceneHistory(sceneUpdates))

            }

        }




    }, [refreshTrigger])


    //Update PartPersons 
    useEffect(() => {

        const latestPersons = getLatest(storedPersons || [])
        const latestParts = getLatest(storedParts || [])

        const partPersons = addPersonsInfo(latestParts, latestPersons)

        dispatch(updatePartPersons(partPersons))

    }, [storedPersons, storedParts])

    //Update ScenePartPersons
    useEffect(() => {

        const latestScenes = getLatest(sceneHistory || [])
        log(debug, 'latestScenes', latestScenes)
        log(debug, 'scenes hisotry ', sceneHistory)
        const newScenePartPersons = latestScenes.map(scene => {
            return {
                ...scene,
                partPersons: scene.partIds.map(partId =>
                    partPersons.find(part => part.id === partId)
                    || { ...new PartUpdate(), id: partId })
            }
        })

        const oldScenePartPersons = scenePartPersons
       
        log(debug,'newSCnePArtPerson',newScenePartPersons)

        newScenePartPersons.forEach(item => {

            if (_.isEqual(item, oldScenePartPersons[item.id]) === false) {
                dispatch(updateScenePartPersons(item.id,item))
            }

        })

    }, [partPersons, sceneHistory])


    return (null)
}

export default ScriptEditorProcessing;


