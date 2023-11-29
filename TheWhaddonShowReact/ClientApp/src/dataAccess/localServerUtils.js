//This file contains sections marked as **LSMTypeInCode** where additions need to be made if new localServerModel update types are created.

//Data Access
import axios from 'axios';

//React Hooks
import { useState, useEffect } from 'react';


//LocalServerModels and types
import { LocalToServerSyncData, SCRIPT_ITEM, PERSON, PART } from './localServerModels';

//Redux Hooks
import { useDispatch, useSelector } from 'react-redux';

//Redux Actions
import {
    updateLastSyncDate,
    processServerToLocalPostBacks,
    addUpdates,
    clearConflicts,
    //updateConnectionStatus,
    endSync,
    closePostBack,
    setPauseSync
} from '../actions/localServer';

import { log } from '../helper.js';

import { IMPORT_GUID } from '../pages/scriptEditor/ScriptImporter';

export async function useSync() {

    const debug = true;


    //Set up state internal to this component
    const [data, setData] = useState(null)
    const [type, setType] = useState(null)
    const [triggerSync, setTriggerSync] = useState(false)

    //Access state from redux store 
    const localCopyId = useSelector((state) => state.localServer.localCopyId);
    //**LSMTypeInCode**                                                                                
    const persons = useSelector((state) => state.localServer.persons)
    const scriptItems = useSelector((state) => state.localServer.scriptItems)
    const parts = useSelector((state) => state.localServer.parts)

    const pauseSync = useSelector((state) => state.localServer.sync.pauseSync);


    log(debug, 'Use Sync: isSyncing: ', { persons: persons.sync.isSyncing, scriptItems: scriptItems.sync.isSyncing, parts: parts.sync.isSyncing })
    const dispatch = useDispatch();

    //Use Effect Hooks to assing the data and url to be used in the sync operation. **LSMTypeInCode**
    //-------------------------------------------------------------------------------  

    useEffect(() => {

        log(debug, `${PERSON} isSyncing: ${persons.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true) finishSync('Syncing paused.', PERSON)

            if (persons.sync.isSyncing) {

                const { error } = await sync(persons.history, PERSON)

                finishSync(error, PERSON)

            }

        }

        runSync()

    }, [persons.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-dep

    useEffect(() => {

        log(debug, `${SCRIPT_ITEM} isSyncing: ${scriptItems.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true) finishSync('Syncing paused.', SCRIPT_ITEM)

            if (scriptItems.sync.isSyncing) {

                const { error } = await sync(scriptItems.history, SCRIPT_ITEM)

                finishSync(error, SCRIPT_ITEM)

            }

        }

        runSync()

    }, [scriptItems.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        log(debug, `${PART} isSyncing: ${parts.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true) finishSync('Syncing paused.', PART)

            if (parts.sync.isSyncing) {

                const { error } = await sync(parts.history, PART)

                finishSync(error, PART)

            }

        }

        runSync()

    }, [parts.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps



    //The actual sync operation
    //-------------------------------------------------------------------------------
    const sync = async(data, type) => {

        let error;

        try {

            const syncData = await createSyncData(data, localCopyId)

            const syncResponse = await postSyncData(syncData, type)

            if (syncResponse.status === 200) {
                const cbpSuccess = await closePostBacks(syncResponse.data.postBacks, type)

                const psrSuccess = await processSyncResponse(syncResponse.data, type)

                if (cbpSuccess && psrSuccess) {
                    error = null
                } else {
                    error = 'Error finishing sync.'
                }


            } else {
                error = `Error: ${syncResponse.message}`

            }

        } catch (error) {
            error = ('sync Error: ' + error.message)
        }

        return { error }

    }


    const createSyncData = async (data, copyId) => { //data = all the updates pertaining to a particular type of data (e.g. persons)

        debug && console.log('Redux store data: ')

        debug && console.log(data)

        try {
            const syncData = new LocalToServerSyncData(
                copyId  //identifies the local copy that the data is coming from
                , data.filter(x => x.hasPostedBack !== true).map(x => ({ id: x.id, created: x.created, isConflicted: x.isConflicted })) // confirmation back to server that updates in the post back have been added to Local.
                , data.filter(x => x.updatedOnServer === null) //local data that hasn't yet been added to server
            )

            return syncData;
        } catch (error) {
            throw new Error(`Error creating sync data: ${error.message}`)
        }

    }




    const postSyncData = async (syncData, type, dispatch, debug) => {

        const url = `${type}s/sync`

        try {

            log(debug, "postSyncData: ", { type, syncData });


            log(debug, 'postSyncData: url', url)
            const response = await axios.post(url, syncData);

            log(debug, 'postSyncData response: ', { status: response.status, data: response.data })

            //dispatch(updateConnectionStatus('Ok'))

            return (response)
        }
        catch (error) {
            throw new Error("Error posting sync data: " + error.message)
        }
    }

    const closePostBacks = (postBacks, type) => {

        log(debug, 'sync closePostBacks: ', { postBacks: postBacks, type: type })

        try {
            const postBacksArray = Object.values(postBacks)

            postBacksArray.forEach(postBack => { dispatch(closePostBack(postBack, type)) })

            return true;
        }
        catch (error) {
            throw new Error("Error closing postBacks: " + error.message)
        }
    }

    const processSyncResponse = async (responseData, type) => {

        let process = ''
        log(debug, 'processSyncResponse:', { responseData, type })

        try {
            process = 'postBacks'
            if (responseData.postBacks.length === 0) {

                debug && console.log('No PostBack to process.');
                debug && console.log(type)

            }
            else {
                debug && console.log('Processing postBacks.')
                debug && console.log(type)

                const postBacksArray = Object.values(responseData.postBacks)

                postBacksArray.forEach(postBack => { dispatch(processServerToLocalPostBacks(postBack, type)) })
            }

            process = 'updates'
            if (responseData.updates.length === 0) {
                debug && console.log('No updates to process.');
                debug && console.log(type)
            }
            else {
                debug && console.log('Processing updates.');
                debug && console.log(type)
                dispatch(addUpdates(responseData.updates, type))
            }

            process = 'conflicts'
            if (responseData.conflictIdsToClear.length === 0) {
                debug && console.log('No conflicts to clear.');
                debug && console.log(type)

            }
            else {
                debug && console.log('Clearing conflicts.')
                dispatch(clearConflicts(responseData.conflictIdsToClear))
            }

            process = 'lastSyncDate'
            if (responseData.lastSyncDate == null) {
                debug && console.log('No last sync date to update.')
            }

            else {
                debug && console.log('Updating last sync date.')
                dispatch(updateLastSyncDate(responseData.lastSyncDate))
            }

            return true;
        }
        catch (err) {
            throw new Error(`Error processing ${process} from server: ${err.message}`)
        }



    }

    const finishSync = (error, type) => {
        if (error) {
            log(debug, `Error syncing ${type}: ${error}`)
        }
        dispatch(endSync(error, type))
    }

}


export function getLatest(history, includeInActive = false, includeSamples = false) {

    if (history === undefined) {
        throw new Error("getLatest passed undefined history property")
    }

    if (!Array.isArray(history) || history.length === 0) { return [] }

    const sampleHistory = history.filter((update) => !update.isSample || includeSamples === true)

    const latestUpdates = sampleHistory.reduce((acc, update) => {
        if (!acc[update.id] || new Date(update.created) > new Date(acc[update.id].created)) {
            acc[update.id] = update;
        }

        return acc;
    }, {})

    const latestUpdatesArray = Object.values(latestUpdates);

    let latestActive = latestUpdatesArray.filter((update) => update.isActive === true || includeInActive === true)

    if (latestActive === null || latestActive === undefined) { latestActive = [] }


    return latestActive;


}



export function prepareUpdate(updates, adjustment) {
    return prepareUpdates(updates, adjustment)
}

export function prepareUpdates(updates, adjustment = 1) {

    let output = updates

    if (!Array.isArray(updates)) {
        output = [updates]
    }

    const createdDate = localServerDateNow(adjustment)


    output.forEach((update, index) => {

        output[index] = { ...update, created: createdDate, updatedOnServer: null }
    })

    output.forEach((update) => {

        delete update.new
        delete update.changed

    })

    return output;


}


export function localServerDateNow(adjustment = null) {

    const moment = require("moment");

    const createdDate = moment()

    const adjustedDate = createdDate.add(adjustment, 'ms')

    const formattedDate = adjustedDate.format("YYYY-MM-DDTHH:mm:ss.SSS")

    return formattedDate
}

