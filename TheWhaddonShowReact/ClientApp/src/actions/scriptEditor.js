/* eslint-disable import/prefer-default-export */

export const UPDATE_SEARCH_PARAMETERS = 'UPDATE_SEARCH_PARAMETERS';
export const UPDATE_VIEW_COMMENTS = 'UPDATE_VIEW_COMMENTS';
export const UPDATE_DIALOGUE_RIGHT_ID = 'UPDATE_DIALOGUE_RIGHT_ID'
export const TOGGLE_SCENE_SELECTOR = 'TOGGLE_SCENE_SELECTOR';
export const UPDATE_SHOW_COMMENTS = 'SET_SHOW_COMMENTS';
export const UPDATE_VIEW_AS_PART_PERSON = 'UPDATE_VIEW_AS_PERSON';
export const UPDATE_PART_PERSONS = 'UPDATE_PART_PERSONS';
export const ADD_UPDATES_SCENE_HISTORY = 'ADD_UPDATES_SCENE_HISTORY';
export const ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY = 'ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY';
export const UPDATE_SCENE_PART_PERSONS = 'UPDATE_SCENE_PART_PERSONS';
export const CHANGE_FOCUS = 'CHANGE_FOCUS';
export const CLEAR_IMPORT_UPDATES = 'CLEAR_IMPORT_UPDATES';
export const CLEAR_SCRIPT_EDITOR_STATE = 'CLEAR_SCRIPT_EDITOR_STATE';
export const UPDATE_PREVIOUS_CURTAIN = 'UPDATE_PREVIOUS_CURTAIN';
export const ADD_UPDATE_TO_SCRIPT_ITEM_HISTORY = 'ADD_UPDATES_TO_SCRIPT_ITEM_HISTORY';
export const SET_SHOW = 'SET_SHOW';
export const ADD_TEXT_AREA_CONTEXT = 'ADD_TEXT_AREA_CONTEXT';
export const UPDATE_UNDO_DATE_TIME = 'UPDATE_UNDO_DATE_TIME';

export const TRIGGER = 'TRIGGER';

//Trigger types
export const REDO = 'REDO';
export const UNDO = 'UNDO';
export const CONFIRM_UNDO = 'CONFIRM_UNDO';
export const DELETE_COMMENT = 'DELETE_COMMENT';
export const ADD_SCRIPT_ITEM = 'ADD_SCRIPT_ITEM';
export const DELETE_SCRIPT_ITEM = 'DELETE_SCRIPT_ITEM';
export const DELETE_NEXT_SCRIPT_ITEM = 'DELETE_NEXT_SCRIPT_ITEM';
export const DELETE_SCENE = 'DELETE_SCENE';
export const SWAP_PART = 'SWAP_PART';
export const UPDATE_SCENE_PART_IDS = 'UPDATE_SCENE_PART_IDS';

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

export function updateViewAsPartPerson(partPerson) {
    return {
        type: UPDATE_VIEW_AS_PART_PERSON,
        partPerson,
    }
}


export function updatePartPersons(partPersons) {
    return {
        type: UPDATE_PART_PERSONS,
        partPersons,
    }
}

export function addUpdatesToSceneHistory(updates) {
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

export function changeFocus(focus) {
    return {
        type: CHANGE_FOCUS,
        focus,
    }
}

export function clearImportUpdates() {
    return {
        type: CLEAR_IMPORT_UPDATES,
    }
}

export function clearScriptEditorState() {
    return {
        type: CLEAR_SCRIPT_EDITOR_STATE,
    }
}

export function updatePreviousCurtain(nextSceneId, curtainOpen) {
    return {
        type: UPDATE_PREVIOUS_CURTAIN,
        nextSceneId: nextSceneId,
        previousCurtainOpen: curtainOpen,
    }
}

export function addUpdateToScriptItemHistory(update) {
    return {
        type: ADD_UPDATE_TO_SCRIPT_ITEM_HISTORY,
        update,
    }
}

export function setShow(show) {
    return {
        type: SET_SHOW,
        show,
    }
}

export function addTextAreaContext(scriptItemType, context) {
    return {
        type: ADD_TEXT_AREA_CONTEXT,
        scriptItemType,
        context,
    }
}

export function updateUndoDateTime(undoDateTime,sceneId) {
    return {
        type: UPDATE_UNDO_DATE_TIME,
        sceneId: sceneId,
        undoDateTime,
    }
}

export function trigger(triggerType, payload) {
    return {
        type: TRIGGER,
        triggerType,
        payload,
    }
}

