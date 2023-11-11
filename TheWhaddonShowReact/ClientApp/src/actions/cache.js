
export const ADD_TO_CACHE = 'ADD_TO_CACHE';

export function addToCache(section, ref, payload) {
    return {
        type: ADD_TO_CACHE,
        section: section,
        ref: ref,
        payload: payload
    }
}
