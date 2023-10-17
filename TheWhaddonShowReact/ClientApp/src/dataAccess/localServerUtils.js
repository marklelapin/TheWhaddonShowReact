//This file contains sections marked as **LSMTypeInCode** where additions need to be made if new localServerModel update types are created.

//Data Access
import axios from 'axios';

//React Hooks
import { useState, useEffect, useRef } from 'react';


//LocalServerModels and types
import { LocalToServerSyncData } from './localServerModels';
import { Person, ScriptItem, Part } from './localServerModels';

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
    closePostBack
} from 'actions/localServer';
import { log } from 'helper.js';


export async function useSync() {

    const debug = false;


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

    debug && console.log('Use Sync: persons.sync.isSyncing: ' + persons.sync.isSyncing)
    const dispatch = useDispatch();

    //Use Effect Hooks to assing the data and url to be used in the sync operation. **LSMTypeInCode**
    //-------------------------------------------------------------------------------  
    useEffect(() => {
        debug && console.log('setting data and type')
        if (persons.sync.isSyncing) { //if it is syncing alread then don't run another sync.
            setData(persons.history)
            setType(persons.type)
            setTriggerSync(!triggerSync)
        }
        //else do nothing
    }, [persons.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (scriptItems.sync.isSyncing) {
            setData(scriptItems.history)
            setType(scriptItems.type)
            setTriggerSync(!triggerSync)
        }
        //else do nothing
    }, [scriptItems.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (parts.sync.isSyncing) {
            setData(parts.history)
            setType(parts.type)
            setTriggerSync(!triggerSync)
        }
        //else do nothing
    }, [parts.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps



    //The actual sync operation
    //-------------------------------------------------------------------------------
    useEffect(() => {

        debug && console.log(data)
        async function sync() {

            try {

                const syncData = await createSyncData(data, localCopyId, debug)

                const response = await postSyncData(syncData, type, dispatch, debug)

                if (response.status === 200) {
                    const cbpSuccess = await closePostBacks(syncData.postBacks, type, dispatch, debug)

                    const psrSuccess = await processSyncResponse(response.data, type, dispatch, debug)

                    if (cbpSuccess && psrSuccess) {
                        finishSync(null, type, dispatch)
                    } else {
                        finishSync('Error finishing sync.', null, type, dispatch, debug)
                    }


                } else {
                    finishSync(`Error: ${response.message}`, type, dispatch)

                }

            } catch (error) {
                debug && console.log(error)
                finishSync(error.message, type, dispatch)
            }
        }

        sync()

    }, [triggerSync]) // eslint-disable-line react-hooks/exhaustive-deps


}

const createSyncData = async (data, copyId, debug) => { //data = all the updates pertaining to a particular type of data (e.g. persons)

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

        debug && console.log("Posting Sync Data: " + JSON.stringify(syncData));

        const json = JSON.stringify(syncData);

        const response = await axios.post(url, syncData);

        debug && console.log("ResponseStatus from server:  " + response.status)
        debug && console.log("Response from server:  " + JSON.stringify(response.data))

        //dispatch(updateConnectionStatus('Ok'))

        return (response)
    }
    catch (error) {
        throw new Error("Error posting sync data: " + error.message)
    }
}

const closePostBacks = (postBacks, type, dispatch) => {


    try {
        const postBacksArray = Object.values(postBacks)

        postBacksArray.forEach(postBack => { dispatch(closePostBack(postBack, type)) })

        return true;
    }
    catch (error) {
        throw new Error("Error closing postBacks: " + error.message)
    }
}

const processSyncResponse = async (responseData, type, dispatch, debug) => {

    let process = ''
    debug && console.log("Processing Sync Response: ")

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

const finishSync = (error, type, dispatch) => {

    dispatch(endSync(error, type))
}



export function getLatest(history, undoDateTime = null, includeInActive = false, includeSamples = false) {

    if (history === undefined) {
        throw new Error("getLatest passed undefined history property")
    }

    if (!Array.isArray(history) || history.length === 0) { return [] }

    const unDoneHistory = history.filter((update) => update.created <= (undoDateTime || update.created))

    const sampleHistory = unDoneHistory.filter((update) => update.isSample === false || includeSamples === true)

    const latestUpdates = sampleHistory.reduce((acc, update) => {
        if (!acc[update.id] || update.created > acc[update.id].created) {
            acc[update.id] = update;
        }
        return acc;
    }, {})

    const latestUpdatesArray = Object.values(latestUpdates);

    let latestActive = latestUpdatesArray.filter((update) => update.isActive === true || includeInActive === true)

    if (latestActive === null || latestActive === undefined) { latestActive = [] }


    return latestActive;


}



export function prepareUpdate(updates,adjustment) {
    return prepareUpdates(updates,adjustment)
}

export function prepareUpdates(updates, adjustment) {

    const moment = require("moment");

    let output = updates

    if (!Array.isArray(updates)) {
        output = [updates]
    }

    const createdDate = moment()
    
    const adjustedDate = createdDate.add(adjustment,'ms')
     
    const formattedDate = adjustedDate.format("YYYY-MM-DDTHH:mm:ss.SSS")


    output.forEach((update, index) => {

        output[index] = { ...update, created: formattedDate, updatedOnServer: null }
    })

    output.forEach((update) => {

        delete update.new
        delete update.changed

    })

    return output;


}




