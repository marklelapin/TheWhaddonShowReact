export const RESET_LIST = 'CREATE_LIST';
export const PROCESS_LOCAL_TO_SERVER_POSTBACK = 'PROCESS_LOCAL_TO_SERVER_POSTBACK';
export const ADD_UPDATES = 'ADD_UPDATES';
export const CLEAR_CONFLICTS = 'CLEAR_CONFLICTS';

export  function resetList(payload) {
  return {
    type: RESET_LIST,
    payload
  };
}

export function processServerToLocalPostbacks(payload) {
    return {
        type: PROCESS_LOCAL_TO_SERVER_POSTBACK,
        payload
    };
}

export function addUpdates(payload) {
    return {
        type: ADD_UPDATES,
        payload
    };
}

export function clearConflicts(payload) {
    return {
        type: CLEAR_CONFLICTS,
        payload
    }
}


