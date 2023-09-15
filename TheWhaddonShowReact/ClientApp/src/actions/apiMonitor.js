export const UPDATE_FROM_TO = 'UPDATE_FROM_TO';
export const TOGGLE_SHOW_SUCCESS = 'TOGGLE_SHOW_SUCCESS';
export const TOGGLE_SHOW_FAILURE = 'TOGGLE_SHOW_FAILURE';
export const UPDATE_SEARCH = 'UPDATE_SEARCH';
export const UPDATE_IS_LOADING = 'UPDATE_IS_LOADING';

export function updateFromTo(payload) {
    return {
        type: UPDATE_FROM_TO,
        payload
    };
}

export function toggleShowSuccess() {
    return {
        type: TOGGLE_SHOW_SUCCESS
    };
}

export function toggleShowFailure() {
    return {
        type: TOGGLE_SHOW_FAILURE,
    };
}

export function updateSearch(payload) {
    return {
        type: UPDATE_SEARCH,
        payload
    };
}

export function updateIsLoading() {
    return {
        type: UPDATE_IS_LOADING,
    };
}