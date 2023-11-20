//global actions
export const UPDATE_LASTSYNCDATE = 'UPDATE_LASTSYNCDATE';
export const SET_LOCALCOPYID = 'SET_LOCALCOPYID';
export const UPDATE_CONNECTION_STATUS = 'UPDATE_CONNECTION_STATUS';
export const SET_PAUSE_SYNC = 'SET_PAUSE_SYNC';
export const CLEAR_LOCAL_SERVER_STATE = 'CLEAR_LOCAL_SERVER_STATE';
export function updateLastSyncDate(payload) {
    return {
        type: UPDATE_LASTSYNCDATE,
        payload
    }
}

export function setLocalCopyId(payload) {
    return {       
        type: SET_LOCALCOPYID,
        payload
    }
} 

export function updateConnectionStatus(payload) {
    return {
        type: UPDATE_CONNECTION_STATUS,
        payload
    }
}

export function setPauseSync(payload) {
return {
        type: SET_PAUSE_SYNC,
        payload
    }
}

export function clearLocalServerState() {
    return {
        type: CLEAR_LOCAL_SERVER_STATE
    }
}

//actions that effect a particular type of localServerModelUpdate (e.g. persons) according to type passed in.
export const RESET_LIST = 'CREATE_LIST';
export const PROCESS_LOCAL_TO_SERVER_POSTBACK = 'PROCESS_LOCAL_TO_SERVER_POSTBACK';
export const ADD_UPDATES = 'ADD_UPDATES';
export const CLEAR_CONFLICTS = 'CLEAR_CONFLICTS';
export const SYNC = 'SYNC';
export const END_SYNC = 'END_SYNC';
export const CLOSE_POSTBACK = 'CLOSE_POSTBACK';

export function resetList(payload,payloadType) {
    return {
        type: RESET_LIST,
        payload,
        payloadType
    };
}

export function processServerToLocalPostBacks(payload,payloadType) {
    return {
        type: PROCESS_LOCAL_TO_SERVER_POSTBACK,
        payload,
        payloadType
    };
}

export function closePostBack(payload, payloadType) {
    return {
        type: CLOSE_POSTBACK,
        payload,
        payloadType
    };
}

export function addUpdates(payload,payloadType) {
    return {
        type: ADD_UPDATES,
        payload,
        payloadType
    };
}

export function clearConflicts(payload,payloadType) {
    return {
        type: CLEAR_CONFLICTS,
        payload,
        payloadType
    }
}


export function sync(payloadType) {
    return {
        type: SYNC,
        payloadType
    }
}

export function endSync(payload,payloadType) {
    return {
        type: END_SYNC,
        payload,
        payloadType

    }
}
