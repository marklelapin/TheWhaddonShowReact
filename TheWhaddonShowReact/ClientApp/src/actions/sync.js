export const UPDATE_LASTSYNCDATE = 'UPDATE_LASTSYNCDATE';
export const SET_LOCALCOPYID = 'SET_LOCALCOPYID';

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
