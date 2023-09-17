﻿//global actions
export const UPDATE_LASTSYNCDATE = 'UPDATE_LASTSYNCDATE';
export const SET_LOCALCOPYID = 'SET_LOCALCOPYID';
export const UPDATE_CONNECTION_STATUS = 'UPDATE_CONNECTION_STATUS';


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

//actions that effect a particular type of localServerModelUpdate (e.g. persons) according to type passed in.
export const RESET_LIST = 'CREATE_LIST';
export const PROCESS_LOCAL_TO_SERVER_POSTBACK = 'PROCESS_LOCAL_TO_SERVER_POSTBACK';
export const ADD_UPDATES = 'ADD_UPDATES';
export const CLEAR_CONFLICTS = 'CLEAR_CONFLICTS';
export const SYNC = 'SYNC';
export const END_SYNC = 'END_SYNC';

export function resetList(payload,payloadType) {
    return {
        type: RESET_LIST,
        payload,
        payloadType
    };
}

export function processServerToLocalPostbacks(payload,payloadType) {
    return {
        type: PROCESS_LOCAL_TO_SERVER_POSTBACK,
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