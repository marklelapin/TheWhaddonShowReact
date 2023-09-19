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
    processServerToLocalPostbacks,
    addUpdates,
    clearConflicts,
    //updateConnectionStatus,
    endSync
} from 'actions/localServer';



export async function useSync() {

    //Set up state internal to this component
    const [data, setData] = useState(null)
    const [type, setType] = useState(null)

    //Access state from redux store 
    const localCopyId = useSelector((state) => state.localServer.localCopyId);
    //**LSMTypeInCode**                                                                                
    const persons = useSelector((state) => state.localServer.persons)
    const scriptItems = useSelector((state) => state.localServer.scriptItems)
    const parts = useSelector((state) => state.localServer.parts)


    const dispatch = useDispatch();

    //Use Effect Hooks to assing the data and url to be used in the sync operation. **LSMTypeInCode**
    //-------------------------------------------------------------------------------  
    useEffect(() => {
        if (persons.sync.isSyncing) { //if it is syncing alread then don't run another sync.
            setData(persons.history)
            setType(persons.type)
        }
        //else do nothing
    }, [persons.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (scriptItems.sync.isSyncing) {
            setData(scriptItems.history)
            setType(scriptItems.type)
        }
        //else do nothing
    }, [scriptItems.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (parts.sync.isSyncing) {
            setData(parts.history)
            setType(parts.type)
        }
        //else do nothing
    }, [parts.sync.isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps



    //The actual sync operation
    //-------------------------------------------------------------------------------
    useEffect(() => {

        createSyncData(data, localCopyId, type, dispatch)

            .then((syncData) => postSyncData(syncData, type, dispatch))

            .then((response) => {
                /*if (response === 'Connection Error') { finishSync(type, null, dispatch) } //not reported as error as could be working offline.*/
                if (response.status !== 200) { finishSync(`Error: ${response.message}`, type, dispatch) }
                processSyncResponse(response.data, type, dispatch)
            })

            .then(() => finishSync(null, type, dispatch))
            .catch((error) => {
                finishSync(error, type, dispatch)
            })

    }, [data, localCopyId, dispatch, type])


}

const createSyncData = async (data, copyId) => { //data = all the updates pertaining to a particular type of data (e.g. persons)
    try {
        const syncData = new LocalToServerSyncData(
            copyId  //identifies the local copy that the data is coming from
            , data.filter(x => x.updatedOnServer === false) //local data that hasn't yet been added to server
            , data.filter(x => x.hasPostedBack !== true) // confirmation back to server that updates in the post back have been added to Local.
        )
        return syncData;
    } catch (error) {
        throw new Error(`Error creating sync data: ${error.message}`)
    }

}

const postSyncData = async (syncData, type, dispatch) => {

    const url = `${type}s/sync`

    /*   try {*/
    console.log("Posting Sync Data: " + JSON.stringify(syncData));
    const response = await axios.post(url, syncData);

    console.log("Response from server:  " + JSON.stringify(response.data))

    //dispatch(updateConnectionStatus('Ok'))

    return response;
    //}
    //catch (error) {
    //    //dispatch(updateConnectionStatus(`No Connection: ${error.message}`)) //TODO Think this functionality can be changed to use Reaction offline functionality.(in repo issues)
    //    //return 'Connection Error'
    //    return error
    //}
}

const processSyncResponse = async (responseData, type, dispatch) => {

    console.log("Processing Sync Response: ")

    try {
        if (responseData.PostBacks.length === 0) {
            console.log('No Postback to process.')
            console.log(type)
        }
        else {
            console.log('Processing postbacks.')
            console.log(type)
            dispatch(processServerToLocalPostbacks(responseData.PostBacks, type))
        }

        if (responseData.Updates.length === 0) {
            console.log('No updates to process.')
            console.log(type)
        }
        else {
            console.log('Processing updates.')
            console.log(type)
            dispatch(addUpdates(responseData.Updates, type))
        }

        if (responseData.ConflictIdsToClear.length === 0) {
            console.log('No conflicts to clear.')
            console.log(type)

        }
        else {
            console.log('Clearing conflicts.')
            dispatch(clearConflicts(responseData.ConflictIdsToClear))
        }

        if (responseData.LastSyncDate == null) {
            console.log('No last sync date to update.')
        }

        else {
            console.log('Updating last sync date.')
            dispatch(updateLastSyncDate(responseData.LastSyncDate))
        }
    }
    catch (err) {
        throw new Error(`An error occured whilst processing sync response: ${err.message}`)
    }



}

const finishSync = (error, type, dispatch) => {

    dispatch(endSync(error, type))
}


export function getLatest(history) {

    if (history === undefined) {
        throw new Error("getLatest passed undefined history property")
    }

    if (!Array.isArray(history) || history.length === 0  ) { return [] }

    const latestUpdates = history.reduce((acc, update) => {
        if (!acc[update.Id] || update.Created > acc[update.Id].Created) {
            acc[update.Id] = update;
        }
        return acc;
    }, {})

    let latestUpdatesArray = Object.values(latestUpdates);

    if (latestUpdatesArray === null || latestUpdatesArray === undefined) { latestUpdatesArray = [] }

    return latestUpdatesArray;


}
