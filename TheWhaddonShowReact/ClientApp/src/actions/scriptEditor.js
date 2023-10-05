/* eslint-disable import/prefer-default-export */

export const UPDATE_SEARCH_PARAMETERS = 'UPDATE_SEARCH_PARAMETERS';
export const UPDATE_VIEW_COMMENTS = 'UPDATE_VIEW_COMMENTS';
export const UPDATE_DIALOGUE_RIGHT_ID = 'UPDATE_DIALOGUE_RIGHT_ID'
export const TOGGLE_SCENE_SELECTOR = 'TOGGLE_SCENE_SELECTOR';

export function updateSearchParameters(searchParameters) {
    return {
        type: UPDATE_SEARCH_PARAMETERS,
        searchParameters,

    };
}

export function updateViewComments(viewComments) {
return {
        type: UPDATE_VIEW_COMMENTS,
        viewComments,

    };
}

export function updateDialogueRightId(dialogueRightId) {
return {
        type: UPDATE_DIALOGUE_RIGHT_ID,
        dialogueRightId,

    };
}

export function toggleSceneSelector() {
    return {
        type: TOGGLE_SCENE_SELECTOR,
    };
}
