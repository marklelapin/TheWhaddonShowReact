import { initial } from 'lodash';
import { clearLocalServerState } from '../actions/localServer'
import { clearScriptEditorState } from '../actions/scriptEditor'

import { initialState as scriptEditorInitialState } from '../reducers/scriptEditor';
import {log} from '../helper'
  const debug = true;
export const saveState = (state) => {

    try {
        //properties identified separately are exlcuded from ...stateToSaveToLocalStorage
        let { localServer, layout } = state;

        //ensure isSyncing is set to false before saving to local storage (otherwise it will be set to true on load and never change)
        localServer = {
            ...localServer, sync: { ...localServer.sync, isSyncing: false }
            , persons: { ...localServer.persons, sync: { ...localServer.persons.sync, isSyncing: false } }
            , scriptItems: { ...localServer.scriptItems, sync: { ...localServer.scriptItems.sync, isSyncing: false } }
            , parts: { ...localServer.parts, sync: { ...localServer.parts.sync, isSyncing: false } }
        }

        const stateToPersist = { localServer, layout }



        const serializedState = JSON.stringify(stateToPersist);

        localStorage.setItem('state', serializedState);
    }
    catch (err) {
        console.log(err);
    }
}

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');

        if (serializedState === null) return undefined;

        const deserializedState = JSON.parse(serializedState);

        if (new Date(latestLocalServerScriptItems(deserializedState)) !== new Date(latestScriptEditorScriptItems(deserializedState))) {
            throw new Error('LocalServer and scriptEditor ScriptItems are out of sync. Resetting state.')
        }
        if (new Date(latestLocalServerParts(deserializedState)) !== new Date(latestScriptEditorParts(deserializedState))) {
            throw new Error('LocalServer and scriptEditor Parts are out of sync. Resetting state.')
        }

        return deserializedState;
    }
    catch (err) {
        log(debug,'Failed to get state from local Storage: ' + err);
        return undefined;
    }
}

export const clearState = (dispatch) => {
    try {
        localStorage.removeItem('state')
        dispatch(clearLocalServerState())
        dispatch(clearScriptEditorState())
    }
    catch (err) {
        console.log('Failed to clear state from local Storage: ' + err);
    }
}


const latestLocalServerScriptItems = (state) => {

    const scriptItems = state.localServer.scriptItems.history || []

    const latestScriptItem = scriptItems.reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return { item }
        }
        return acc
    }, {})

    return latestScriptItem.created

}

const latestScriptEditorScriptItems = (state) => {

    const scriptItems = state.scriptEditor.currentScriptItems || {};

    const latestScriptItem = Object.values(scriptItems).reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return { item }
        }
        return acc
    }, {})

    return latestScriptItem.created
}

const latestLocalServerParts = (state) => {

    const parts = state.localServer.parts.history || []

    const latestPart = parts.reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return { item }
        }
        return acc
    }, {})

    return latestPart.created

}

const latestScriptEditorParts = (state) => {

    const parts = state.scriptEditor.currentParts || {};

    const latestPart = Object.values(parts).reduce((acc, item) => {
        if (new Date(item.created) > new Date(acc.created || 0)) {
            return { item }
        }
        return acc
    }, {})

    return latestPart.created
}