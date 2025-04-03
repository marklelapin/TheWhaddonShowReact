//This file contains sections marked as **LSMTypeInCode** where additions need to be made if new localServerModel update types are created.

//Data Access
import axios from 'axios';

//React Hooks
import {  useEffect } from 'react';


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
    endSync,
    closePostBack,
    clearHasPostedBack,
} from '../actions/localServer';
import { DEMOID } from '../dataAccess/userAccess';
import moment from 'moment';
import { log, LOCAL_SERVER_UTILS as logType } from '../dataAccess/logging.js';


//The is the key hook that does the syncing process.
export async function useSync() {


    //Access state from redux store 
    const localCopyId = useSelector((state) => state.localServer.localCopyId);
    const authenticatedUser = useSelector((state) => state.user.authenticatedUser);
    //**LSMTypeInCode**                                                                                
    const persons = useSelector((state) => state.localServer.persons)
    const scriptItems = useSelector((state) => state.localServer.scriptItems)
    const parts = useSelector((state) => state.localServer.parts)

    const pauseSync = useSelector((state) => state.localServer.sync.pauseSync);


    log(logType, 'Use Sync: isSyncing: ', { persons: persons.sync.isSyncing, scriptItems: scriptItems.sync.isSyncing, parts: parts.sync.isSyncing })
    const dispatch = useDispatch();

    //Use Effect Hooks to assing the data and url to be used in the sync operation. **LSMTypeInCode**
    //-------------------------------------------------------------------------------  

    useEffect(() => {

        log(logType, `UseEffect ${PERSON} isSyncing: ${persons.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true && !persons.sync.isRefreshing) finishSync(persons.sync.error, PERSON)

            if (persons.sync.isSyncing || persons.sync.isRefreshing) {

                const { error } = await sync(persons.history, PERSON)

                finishSync(error, PERSON)

            }

        }

        runSync()

    }, [persons.sync.isSyncing, persons.sync.isRefreshing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        log(logType, `UseEffect ${SCRIPT_ITEM} isSyncing: ${scriptItems.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true && !scriptItems.sync.isRefreshing) finishSync(scriptItems.sync.error, SCRIPT_ITEM)

            if (scriptItems.sync.isSyncing || scriptItems.sync.isRefreshing) {

                const { error } = await sync(scriptItems.history, SCRIPT_ITEM)

                finishSync(error, SCRIPT_ITEM)

            }

        }

        runSync()

    }, [scriptItems.sync.isSyncing, scriptItems.sync.isRefreshing]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        log(logType, `UseEffect ${PART} isSyncing: ${parts.sync.isSyncing}`)

        const runSync = async () => {

            if (pauseSync === true && !parts.sync.isRefreshing) finishSync(parts.sync.error, PART)

            if (parts.sync.isSyncing || parts.sync.isRefreshing) {

                const { error } = await sync(parts.history, PART)

                finishSync(error, PART)

            }

        }

        runSync()

    }, [parts.sync.isSyncing,parts.sync.isRefreshing]) // eslint-disable-line react-hooks/exhaustive-deps



    //The actual sync operation
    //-------------------------------------------------------------------------------
    const sync = async (data, type) => {

        let error;
        const postBacksFromLocal = data.filter(x => x.hasPostedBack !== true).map(x => ({ id: x.id, created: x.created, isConflicted: x.isConflicted }))
        try {

            const syncData = await createSyncData(data, localCopyId, postBacksFromLocal)

            const syncResponse = await postSyncData(syncData, type)

            if (syncResponse.status === 200) {
                const cbpSuccess = await closePostBacks(postBacksFromLocal, type)

                const psrSuccess = await processSyncResponse(syncResponse.data, type)

                if (cbpSuccess && psrSuccess) {
                    error = null
                } else {
                    error = 'Error finishing sync.'
                }


            } else {
                error = `Error: ${syncResponse.message}`

            }

        } catch (e) {
            error = ('sync Error: ' + e.message)
        }

        return { error }

    }



    const createSyncData = async (data, copyId, postBacksFromLocal) => { //data = all the updates pertaining to a particular type of data (e.g. persons)

        //log(logType,'Redux store data: ', data)

        try {
            const syncData = new LocalToServerSyncData(
                copyId  //identifies the local copy that the data is coming from
                , postBacksFromLocal // confirmation back to server that updates in the post back have been added to Local.
                , data.filter(x => x.updatedOnServer === null && authenticatedUser.isWriter && authenticatedUser.id !== DEMOID) //local data that hasn't yet been added to server
            )
        
            return syncData;
        } catch (error) {
            throw new Error(`Error creating sync data: ${error.message}`)
        }

    }




    const postSyncData = async (syncData, type, dispatch, logType) => {

        const url = `${type}s/sync`

        try {

            log(logType, "postSyncData: post", { type, url, syncData });

            const response = await axios.post(url, syncData);

            log(logType, 'postSyncData response: ', { status: response.status, data: response.data })

            //dispatch(updateConnectionStatus('Ok'))

            return (response)
        }
        catch (error) {
            throw new Error("Error posting sync data: " + error.message)
        }
    }

    const closePostBacks = (postBacks, type) => {

        log(logType, 'closePostBacks: ', { postBacks, type })

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
        log(logType, 'processSyncResponse:', { responseData, type })

        try {
            process = 'postBacks'
            if (responseData.postBacks.length === 0) {

                log(logType, 'No PostBack to process.', { type })

            }
            else {
                log(logType, 'Processing postBacks.', { type })

                const postBacksArray = Object.values(responseData.postBacks)

                postBacksArray.forEach(postBack => { dispatch(processServerToLocalPostBacks(postBack, type)) })
            }

            process = 'updates'
            if (responseData.updates.length === 0) {
                log(logType, 'No updates to process.', { type });
            }
            else {
                log(logType, 'Processing updates. ', { type });
                dispatch(addUpdates(responseData.updates, type))
                dispatch(clearHasPostedBack(responseData.updates, type)) //TODO - deletes hasPostedBack if there is a value (if it has already postBack but localSErverEngine is still sending the updatea then postBack needs to be resent.)
            }

            process = 'conflicts'
            if (responseData.conflictIdsToClear.length === 0) {
                log(logType, 'No conflicts to clear.', { type });

            }
            else {
                log(logType, 'Clearing conflicts.')
                dispatch(clearConflicts(responseData.conflictIdsToClear))
            }

            process = 'lastSyncDate'
            if (responseData.lastSyncDate == null) {
                log(logType, 'No last sync date to update.')
            }

            else {
                log(logType, 'Updating last sync date.')
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
            log(logType, `Error syncing ${type}: ${error}`)
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



export function prepareUpdate(updates, overrideCreatedDate) {
    return prepareUpdates(updates, overrideCreatedDate)
}

export function prepareUpdates(updates, overrideCreatedDate) {

    const outputArray = (!Array.isArray(updates)) ? [updates] : updates

    const cleanedOutputArray = outputArray.filter((update) => update.id !== null && update.id !== undefined);

    const createdDate = localServerDateNow(overrideCreatedDate)

    const preparedUpdates = cleanedOutputArray.map((update) => {
        delete update.new
        delete update.changed
        return { ...update, created: createdDate, updatedOnServer: null }
    })

    return preparedUpdates;
}


export function localServerDateNow(overrideCreatedDate = null) {

    const createdDate = overrideCreatedDate ? moment(overrideCreatedDate) : moment()

    const formattedDate = createdDate.format("YYYY-MM-DDTHH:mm:ss.SSS")

    return formattedDate
}

