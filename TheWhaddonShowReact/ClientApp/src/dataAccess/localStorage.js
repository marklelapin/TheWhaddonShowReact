import { clearLocalServerState } from '../actions/localServer'
import { clearScriptEditorState } from '../actions/scriptEditor'

export const saveState = (state) => {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
}

export const loadState = () => {
    const serializedState = localStorage.getItem('state');
    const state = JSON.parse(serializedState)
    return state;
}

export const clearState = (dispatch) => {
        localStorage.removeItem('state')
        dispatch(clearLocalServerState())
        dispatch(clearScriptEditorState())
}

