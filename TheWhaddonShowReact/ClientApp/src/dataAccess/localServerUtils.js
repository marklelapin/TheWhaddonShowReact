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



export async function useSync() {

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

    console.log('Use Sync: persons.sync.isSyncing: ' + persons.sync.isSyncing)
    const dispatch = useDispatch();

    //Use Effect Hooks to assing the data and url to be used in the sync operation. **LSMTypeInCode**
    //-------------------------------------------------------------------------------  
    useEffect(() => {
        console.log('setting data and type')
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

        console.log(data)
        async function sync() {

            try {

                const syncData = await createSyncData(data, localCopyId, type, dispatch)

                const response = await postSyncData(syncData, type, dispatch)

                if (response.status === 200) { 
                  const cbpSuccess =  await closePostBacks(syncData.postBacks, type, dispatch)

                  const psrSuccess =  await processSyncResponse(response.data, type, dispatch)

                    if (cbpSuccess && psrSuccess) {
                        finishSync(null, type, dispatch)
                    } else {
                        finishSync('Error finishing sync.', null, type, dispatch)
                    }

                    
                } else {
 finishSync(`Error: ${response.message}`, type, dispatch)
                    
                }

            } catch (error) {
                console.log(error)
                finishSync(error.message, type, dispatch)
            }
        }

        sync()

    }, [triggerSync]) // eslint-disable-line react-hooks/exhaustive-deps


}

const createSyncData = async (data, copyId) => { //data = all the updates pertaining to a particular type of data (e.g. persons)

    console.log(data)

    try {
        const syncData = new LocalToServerSyncData(
            copyId  //identifies the local copy that the data is coming from
            , data.filter(x => x.hasPostedBack !== true) // confirmation back to server that updates in the post back have been added to Local.
            , data.filter(x => x.updatedOnServer === false) //local data that hasn't yet been added to server

        )

        return syncData;
    } catch (error) {
        throw new Error(`Error creating sync data: ${error.message}`)
    }

}




const postSyncData = async (syncData, type, dispatch) => {

    const url = `${type}s/sync`

    try {
    console.log("Posting Sync Data: " + JSON.stringify(syncData));
    const response = await axios.post(url, syncData);
    console.log("ResponseStatus from server:  " + response.status)
    console.log("Response from server:  " + JSON.stringify(response.data))

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

const processSyncResponse = async (responseData, type, dispatch) => {

    let process = ''
    console.log("Processing Sync Response: ")

    try {
        process ='postBacks'
        if (responseData.postBacks.length === 0) {
            console.log('No PostBack to process.')
            console.log(type)
        }
        else {
            console.log('Processing postBacks.')
            console.log(type)
            dispatch(processServerToLocalPostBacks(responseData.postBacks, type))
        }

        process = 'updates'
        if (responseData.updates.length === 0) {
            console.log('No updates to process.')
            console.log(type)
        }
        else {
            console.log('Processing updates.')
            console.log(type)
            dispatch(addUpdates(responseData.updates, type))
        }

        process = 'conflicts'
        if (responseData.conflictIdsToClear.length === 0) {
            console.log('No conflicts to clear.')
            console.log(type)

        }
        else {
            console.log('Clearing conflicts.')
            dispatch(clearConflicts(responseData.conflictIdsToClear))
        }

        process = 'lastSyncDate'
        if (responseData.lastSyncDate == null) {
            console.log('No last sync date to update.')
        }

        else {
            console.log('Updating last sync date.')
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


export function getLatest(history) {

    if (history === undefined) {
        throw new Error("getLatest passed undefined history property")
    }

    if (!Array.isArray(history) || history.length === 0) { return [] }

    const latestUpdates = history.reduce((acc, update) => {
        if (!acc[update.id] || update.created > acc[update.id].created) {
            acc[update.id] = update;
        }
        return acc;
    }, {})

    let latestUpdatesArray = Object.values(latestUpdates);

    if (latestUpdatesArray === null || latestUpdatesArray === undefined) { latestUpdatesArray = [] }

    return latestUpdatesArray;


}
