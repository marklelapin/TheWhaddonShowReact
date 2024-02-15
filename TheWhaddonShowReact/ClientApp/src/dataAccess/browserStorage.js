
import { clearLocalServerState } from '../actions/localServer';
import { clearScriptEditorState } from '../actions/scriptEditor';

import { loadState, saveState, clearState, NO_INDEXED_DB } from '../dataAccess/indexedDB'; //localStorage

import { log, BROWSER_STORAGE as logType } from '../dataAccess/logging'

export const resetSyncId = '9967fe80-a9d0-4c18-a021-b45073d564a2'

export const saveStateToBrowserStorage = async (state) => {
    try {
        const stateToPersist = getStateToPersist(state)
        log(logType, 'browserStorage', { stateToPersistCopyId: stateToPersist.localServer.localCopyId })
        saveState(stateToPersist)
    }
    catch (err) {
        log(logType, 'Failed to save state to browser storage: ' + err)
    }
}

export const loadStateFromBrowserStorage = async () => {
    try {
        const state = await loadState()
        if (state === null) return undefined;
        if (state === NO_INDEXED_DB) return NO_INDEXED_DB;
        const result = checkBrowserState(state)
        return result;
    }
    catch (err) {
        log(logType, 'Failed to get state from browser Storage: ' + err);
        return undefined;
    }
}

export const clearStateFromBrowserStorage = (dispatch) => {
    try {
        log(logType, 'clearStateFromBrowserStorage')
        clearState()
        dispatch(clearLocalServerState())
        dispatch(clearScriptEditorState())
        window.location.reload();
    }
    catch (err) {
        log(logType, 'Failed to clear state from browser Storage: ' + err);
    }
}

const getStateToPersist = (state) => {
    try {
        //properties identified separately are exlcuded from ...stateToSaveToLocalStorage
        let { localServer, layout, scriptEditor } = state;

        //ensure isSyncing is set to false before saving to local storage (otherwise it will be set to true on load and never change)
        localServer = {
            ...localServer, sync: { ...localServer.sync, isSyncing: false }
            , persons: { ...localServer.persons, sync: { ...localServer.persons.sync, isSyncing: false } }
            , scriptItems: { ...localServer.scriptItems, sync: { ...localServer.scriptItems.sync, isSyncing: false } }
            , parts: { ...localServer.parts, sync: { ...localServer.parts.sync, isSyncing: false } }
        }

        layout = {
            ...layout, maxScriptItemTextWidth: null
        }

        const stateToPersist = { localServer, layout, scriptEditor }
        return stateToPersist
    } catch (err) {
        log(logType, 'Error in getStateToPersist', err)
        return undefined
    }

}

const checkBrowserState = (state) => {
    try {
        const latestLocalItems = latestLocalServerScriptItems(state)
        const latestScriptItems = latestScriptEditorScriptItems(state)
        const latestLocalParts = latestLocalServerParts(state)
        const latestScriptParts = latestScriptEditorParts(state)
        if (latestLocalItems !== latestScriptItems) {
            log(logType, 'latest Dates', { latestLocalItems, latestScriptItems })
            throw new Error('LocalServer and scriptEditor ScriptItems are out of sync. Resetting state.')
        }
        if (latestLocalParts !== latestScriptParts) {
            log(logType, 'latestDates', { latestLocalParts, latestScriptParts })
            throw new Error('LocalServer and scriptEditor Parts are out of sync. Resetting state.')
        }
        if (state.localServer.resetSyncId !== resetSyncId) { //mechanism with which to force new sync across all devices when deployed.
            log(logType, 'resetSyncId', { resetSyncId, state })
            throw new Error('RestSyncId does not match. Resetting state.')
        }
        return state
    } catch (err) {
        log(logType, 'checkBrowserState error', err)
        return undefined
    }
}



const latestLocalServerScriptItems = (state) => {

    const scriptItems = state.localServer.scriptItems.history || []

    const latestScriptItem = scriptItems.reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return item
        }
        return acc
    }, {})

    return latestScriptItem.created

}

const latestScriptEditorScriptItems = (state) => {


    const scriptItems = state.scriptEditor.currentScriptItems || {};

    const latestScriptItem = Object.values(scriptItems).reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return item
        }
        return acc
    }, {})

    return latestScriptItem.created
}

const latestLocalServerParts = (state) => {

    const parts = state.localServer.parts.history || []

    const latestPart = parts.reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return item
        }
        return acc
    }, {})

    return latestPart.created

}

const latestScriptEditorParts = (state) => {

    const parts = state.scriptEditor.currentPartPersons || {};

    const latestPart = Object.values(parts).reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return item
        }
        return acc
    }, {})

    return latestPart.created
}