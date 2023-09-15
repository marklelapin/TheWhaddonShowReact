//This file contains sections marked as **LSMTypeInCode** where additions need to be made if new localServerModel update types are created.

//Data Access
import axios from 'axios';

//React Hooks
import { useState, useEffect, useRef } from 'react';


//LocalServerModels and types
import { LocalToServerSyncData } from './localServerModels';

//Redux Hooks
import { useDispatch, useSelector } from 'react-redux';

//Redux Actions
import {
    updateLastSyncDate,
    processServerToLocalPostbacks,
    addUpdates,
    clearConflicts,
    updateConnectionStatus
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
        if (persons.isSyncing) { //if it is syncing alread then don't run another sync.
            setData(persons.history)
            setType(persons.type)
        }
        //else do nothing
    }, [persons.isSyncing])

    useEffect(() => {
        if (scriptItems.isSyncing) { //if it is syncing alread then don't run another sync.
            setData(scriptItems.history)
            setType(scriptItems.type)
        }
        //else do nothing
    }, [scriptItems.isSyncing])

    useEffect(() => {
        if (parts.isSyncing) { //if it is syncing alread then don't run another sync.
            setData(parts.history)
            setType(parts.type)
        }
        //else do nothing
    }, [parts.isSyncing])




    //The actual sync operation
    //-------------------------------------------------------------------------------
    useEffect(() => {

        createSyncData(data, localCopyId)

            .then((syncData) => postSyncData(syncData, dispatch))

            .then((responseData) => {
                if (responseData === 'Connection Error') { return { error: null } } //not reported as error as could be working offline.
                processSyncResponse(responseData, dispatch)
            })

            .then(endSync(type,dispatch))
            .catch((error) => {
                endSync(type,dispatch)
                return { error: error.message }
            })

        return { error: null }


    }, [data, localCopyId, dispatch,type])


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

const postSyncData = async (type, syncData, dispatch) => {

    const url = `${type}s/sync`

    try {
        console.log("Posting Sync Data: " + JSON.stringify(syncData));
        const response = await axios.post(url, syncData);

        console.log("Response from server:  " + JSON.stringify(response.data))

        dispatch(updateConnectionStatus('Ok'))

        return response.data;
    }
    catch (error) {
        dispatch(updateConnectionStatus(`No Connection: ${error.message}`)) //TODO Think this functionality can be changed to use Reaction offline functionality.(in repo issues)
        return 'Connection Error'
    }
}

const processSyncResponse = async (responseData, dispatch, type) => {

    console.log("Processing Sync Response: ")

    try {
        if (responseData.PostBacks.length === 0) {
            console.log('No Postback to process.')
        }
        else {
            console.log('Processing postbacks.')
            dispatch(processServerToLocalPostbacks(responseData.PostBacks, type))
        }

        if (responseData.Updates.length === 0) {
            console.log('No updates to process.')
        }
        else {
            console.log('Processing updates.')
            dispatch(addUpdates(responseData.Updates, type))
        }

        if (responseData.ConflictIdsToClear.length === 0) {
            console.log('No conflicts to clear.')
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

const endSync = (type,dispatch) => {

    dispatch(endSync(type))
}


export function getLatest(history) {
    const latestUpdates = history.reduce((acc, update) => {
        if (!acc[update.Id] || update.Created > acc[update.Id].Created) {
            acc[update.Id] = update;
        }
        return acc;
    }, {})

    return Object.values(latestUpdates);
}


