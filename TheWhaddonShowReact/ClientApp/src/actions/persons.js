export const CREATE_LIST = 'CREATE_LIST';
export const ADD_UPDATE = 'ADD_UPDATE';

export  function createLIST(payload) {
  return {
    type: CREATE_LIST,
    payload
  };
}

export function addUPDATE(payload) {
  return {
      type: ADD_UPDATE,
        payload
  };
}
