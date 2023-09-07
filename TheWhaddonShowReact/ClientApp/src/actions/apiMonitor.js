export const UPDATE_FROM_TO = 'UPDATE_FROM_TO';
export const UPDATE_FILTERS = 'UPDATE_FILTERS';

export  function updateFromTo(payload) {
  return {
    type: UPDATE_FROM_TO,
    payload
  };
}

export function updateFilters(payload) {
  return {
    type: UPDATE_FILTERS,
    payload
  };
}