import { clearLocalServerState } from '../actions/localServer'
import { clearScriptEditorState } from '../actions/scriptEditor'

import { initialState } from '../reducers/scriptEditor';

export const saveState = (state) => {
    try {
        //properties identified separately are exlcuded from ...stateToSaveToLocalStorage
        let { localServer,layout } = state ;

        //ensure isSyncing is set to false before saving to local storage (otherwise it will be set to true on load and never change)
        localServer = {
            ...localServer, sync: { ...localServer.sync, isSyncing: false }
            , persons: { ...localServer.persons, sync: { ...localServer.persons.sync, isSyncing: false } }
            , scriptItems: { ...localServer.scriptItems, sync: { ...localServer.scriptItems.sync, isSyncing: false } }
            , parts: { ...localServer.parts, sync: { ...localServer.parts.sync, isSyncing: false } }
            }

        const stateToPersist = {localServer,layout} 



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

        serializedState.scriptEditor = initialState


        return JSON.parse(serializedState);
    }
    catch (err) {
        console.log('Failed to get state from local Storage: ' +err);
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
        console.log('Failed to clear state from local Storage: ' +err);
    }
}