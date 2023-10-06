/* eslint-disable import/prefer-default-export */

export const UPDATE_SEARCH_PARAMETERS = 'UPDATE_SEARCH_PARAMETERS';
export const UPDATE_VIEW_COMMENTS = 'UPDATE_VIEW_COMMENTS';
export const UPDATE_DIALOGUE_RIGHT_ID = 'UPDATE_DIALOGUE_RIGHT_ID'
export const TOGGLE_SCENE_SELECTOR = 'TOGGLE_SCENE_SELECTOR';
export const UPDATE_SHOW_COMMENTS = 'SET_SHOW_COMMENTS';
export const UPDATE_VIEW_AS_PERSON = 'UPDATE_VIEW_AS_PERSON';
export const UPDATE_VIEW_AS_PART_ID = 'UPDATE_VIEW_AS_PART_ID';
export const UPDATE_PART_PERSONS = 'UPDATE_PART_PERSONS';
export const ADD_UPDATES_SCENE_HISTORY = 'ADD_UPDATES_SCENE_HISTORY';
export const ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY = 'ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY';
export const UPDATE_SCENE_PART_PERSONS = 'UPDATE_SCENE_PART_PERSONS';

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

export function updateShowComments(showComments) {
    return {
        type: UPDATE_SHOW_COMMENTS,
        showComments,
    }
}

export function updateViewAsPerson(viewAsPerson) {
    return {
        type: UPDATE_VIEW_AS_PERSON,
        viewAsPerson,
    }
}

export function updateViewAsPartId(viewAsPartId) {
    return {
        type: UPDATE_VIEW_AS_PART_ID,
        viewAsPartId,
    }
}

export function updatePartPersons(partPersons) {
return {
        type: UPDATE_PART_PERSONS,
        partPersons,
    }
}

export function addUpdatesToSceneHistory( updates) {
return {
        type: ADD_UPDATES_SCENE_HISTORY,
        updates,
    }
}

export function addUpdatesToSceneScriptItemHistory(sceneId, updates) {
    return {
type: ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY,
        id: sceneId,
        updates,
    }
}

export function updateScenePartPersons(sceneId, partPersons) {
    return {
type: UPDATE_SCENE_PART_PERSONS,
        id: sceneId,
        partPersons,
    }
}
