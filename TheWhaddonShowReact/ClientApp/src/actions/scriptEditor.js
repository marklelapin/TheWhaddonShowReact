import { log } from '../logging'

/* eslint-disable import/prefer-default-export */

export const UPDATE_SEARCH_PARAMETERS = 'UPDATE_SEARCH_PARAMETERS';
export const TOGGLE_SCENE_SELECTOR = 'TOGGLE_SCENE_SELECTOR';
export const UPDATE_SHOW_COMMENTS = 'SET_SHOW_COMMENTS';
export const UPDATE_VIEW_AS_PART_PERSON = 'UPDATE_VIEW_AS_PERSON';

export const UPDATE_CURRENT_PART_PERSONS = 'UPDATE_PART_PERSONS';
export const UPDATE_CURRENT_SCRIPT_ITEMS = 'UPDATE_CURRENT_SCRIPT_ITEMS';
export const UPDATE_SCENE_ORDERS = 'UPDATE_SCENE_ORDERS';
export const UPDATE_PREVIOUS_CURTAIN = 'UPDATE_PREVIOUS_CURTAIN';
export const UPDATE_PERSON_SELECTOR_CONFIG = 'UPDATE_PERSON_SELECTOR_CONFIG';


export const UPDATE_SCRIPT_ITEM_IN_FOCUS = 'CHANGE_SCRIPT_ITEM_IN_FOCUS';
export const UPDATE_SCENE_IN_FOCUS = 'CHANGE_SCENE_IN_FOCUS';

export const CLEAR_IMPORT_UPDATES = 'CLEAR_IMPORT_UPDATES';
export const CLEAR_SCRIPT_EDITOR_STATE = 'CLEAR_SCRIPT_EDITOR_STATE';

export const SET_SHOW = 'SET_SHOW';
export const ADD_ITEMS_TO_REDO_LIST = 'ADD_ITEMS_TO_REDO_LIST';
export const REMOVE_ITEMS_FROM_REDO_LIST = 'REMOVE_ITEMS_FROM_REDO_LIST';
export const RESET_UNDO = 'RESET_UNDO';


export const UPDATE_VIEW_STYLE = 'UPDATE_VIEW_STYLE';
export const SET_READ_ONLY = 'SET_READ_ONLY';
export const UPDATE_SCENE_LOADED = 'UPDATE_SCENE_LOADED';

export const TRIGGER = 'TRIGGER';

//Trigger types 
export const UPDATE_TEXT = 'UPDATE_TEXT';
export const UPDATE_PART_IDS = 'UPDATE_PART_IDS';
export const UPDATE_TAGS = 'UPDATE_TAGS';
export const UPDATE_ATTACHMENTS = 'UPDATE_ATTACHMENTS';
export const UPDATE_TYPE = 'UPDATE_TYPE';
export const TOGGLE_CURTAIN = 'TOGGLE_CURTAIN';
export const ADD_COMMENT = 'ADD_COMMENT';
export const ADD_TAG = 'ADD_TAG';
export const REMOVE_TAG = 'REMOVE_TAG';
export const REDO = 'REDO';
export const UNDO = 'UNDO';
export const CONFIRM_UNDO = 'CONFIRM_UNDO';
export const DELETE_COMMENT = 'DELETE_COMMENT';
export const ADD_SCRIPT_ITEM = 'ADD_SCRIPT_ITEM';
export const DELETE_SCRIPT_ITEM = 'DELETE_SCRIPT_ITEM';
export const DELETE_NEXT_SCRIPT_ITEM = 'DELETE_NEXT_SCRIPT_ITEM';
export const ADD_SCENE = 'ADD_SCENE';
export const DELETE_SCENE = 'DELETE_SCENE';
export const MOVE_SCENE = 'MOVE_SCENE';
export const ADD_PART = 'ADD_PART';
export const UPDATE_PART_NAME = 'UPDATE_PART_NAME';
export const ADD_PART_TAG = 'ADD_PART_TAG';
export const REMOVE_PART_TAG = 'REMOVE_PART_TAG';
export const ALLOCATE_PERSON_TO_PART = 'ALLOCATE_PERSON_TO_PART';
export const DELETE_PART = 'DELETE_PART';
export const DELETE_NEXT_PART = 'DELETE_NEXT_PART';
export const SWAP_PART = 'SWAP_PART';
export const CLEAR_SCRIPT = 'CLEAR_SCRIPT';


const debug = true;

export function updateSearchParameters(searchParameters) {
    return {
        type: UPDATE_SEARCH_PARAMETERS,
        searchParameters,

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


export function updateCurrentPartPersons(partPersons) {
    return {
        type: UPDATE_CURRENT_PART_PERSONS,
        partPersons,
    }
}

export function updateScriptItemInFocus(scriptItemId, sceneId) {
    return {
        type: UPDATE_SCRIPT_ITEM_IN_FOCUS,
        scriptItemId,
        sceneId
    }
}

export function updateSceneInFocus(scene) {
    return {
        type: UPDATE_SCENE_IN_FOCUS,
        scene,
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

export function updatePreviousCurtain(sceneId, previousCurtainOpen) {
    return {
        type: UPDATE_PREVIOUS_CURTAIN,
        sceneId,
        previousCurtainOpen
    }
}

export function setShow(show) {
    return {
        type: SET_SHOW,
        show,
    }
}


export function resetUndo() {
    return {
        type: RESET_UNDO
    }
}

export function addItemsToRedoList(sceneId, items) {
    return {
        type: ADD_ITEMS_TO_REDO_LIST,
        sceneId,
        items,
    }
}

export function removeItemsFromRedoList(createdDate) {
    return {
        type: REMOVE_ITEMS_FROM_REDO_LIST,
        createdDate,
    }
}

export function trigger(triggerType, payload) {
    return {
        type: TRIGGER,
        triggerType,
        payload,
    }
}

export function updateCurrentScriptItems(scriptItems) {
    return {
        type: UPDATE_CURRENT_SCRIPT_ITEMS,
        scriptItems,
    }
}

export function updateSceneOrders(sceneOrders) {
    return {
        type: UPDATE_SCENE_ORDERS,
        sceneOrders,
    }
}
export function updatePersonSelectorConfig(config) {
    return {
        type: UPDATE_PERSON_SELECTOR_CONFIG,
        config,
    }
}



export function updateViewStyle(viewStyle) {
    return {
        type: UPDATE_VIEW_STYLE,
        viewStyle,
    }
}

    export function setReadOnly(readOnly) {
        return {
            type: SET_READ_ONLY,
            readOnly,
        }
}

    export function updateSceneLoaded(id) {
        return {
            type: UPDATE_SCENE_LOADED,
            id,
        }
    }