import {
    ADD_TEXT_AREA_CONTEXT,
    ADD_UPDATE_TO_SCRIPT_ITEM_HISTORY,
    CLEAR_SCRIPT_EDITOR_STATE,
    UPDATE_SEARCH_PARAMETERS,
    UPDATE_VIEW_COMMENTS,
    UPDATE_DIALOGUE_RIGHT_ID,
    TOGGLE_SCENE_SELECTOR,
    UPDATE_SHOW_COMMENTS,
    UPDATE_VIEW_AS_PART_PERSON,
    UPDATE_PART_PERSONS,
    ADD_UPDATES_SCENE_HISTORY,
    ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY,
    UPDATE_SCENE_PART_PERSONS,
    CHANGE_FOCUS,
    CLEAR_IMPORT_UPDATES,
    UPDATE_PREVIOUS_CURTAIN,
    SET_SHOW,
    UPDATE_UNDO_DATE_TIME,
    TRIGGER
} from '../actions/scriptEditor';


import { IMPORT_GUID } from '../pages/scriptEditor/ScriptImporter';


export const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
    showComments: true,
    dialogueRightId: null,
    showSceneSelector: true,
    show: null,
    viewAsPartPerson: null,
    partPersons: [],
    scenePartPersons: {},
    sceneHistory: [],
    sceneScriptItemHistory: {},
    scriptItemHistory: {},
    focus: {},
    previousCurtain: {},
    textAreaContext: {},
    isUndoInProgress: false,
    undoDateTime: null,
    undoSceneId: null,
    trigger: {},

}

export default function scriptEditorReducer(state = initialState, action) {
    switch (action.type) {
        case UPDATE_SEARCH_PARAMETERS:
            return {
                ...state,
                searchParameters: action.searchParameters,
            };
        case UPDATE_VIEW_COMMENTS:
            return {
                ...state,
                viewComments: action.viewComments,
            };
        case UPDATE_DIALOGUE_RIGHT_ID:
            return {
                ...state,
                dialogueRightId: action.dialogueRightId,
            };
        case TOGGLE_SCENE_SELECTOR:
            return {
                ...state,
                showSceneSelector: !state.showSceneSelector,
            };
        case UPDATE_SHOW_COMMENTS:
            return {
                ...state,
                showComments: action.showComments,
            };
        case UPDATE_VIEW_AS_PART_PERSON:
            return {
                ...state,
                viewAsPartPerson: action.partPerson,
            };

        case UPDATE_PART_PERSONS:
            return {
                ...state,
                partPersons: action.partPersons,
            };
        case ADD_UPDATES_SCENE_HISTORY:

            const workingSceneHistory = state.sceneHistory || []

            return {
                ...state,
                sceneHistory: [...workingSceneHistory, ...action.updates]  //[action.id]: [...state.sceneHistory[action.id], ...action.updates]
            };
        case ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY:

            const workingSceneScriptItemHistory = { ...state.sceneScriptItemHistory } || {}


            return {
                ...state,
                sceneScriptItemHistory: { ...state.sceneScriptItemHistory, [action.id]: [...workingSceneScriptItemHistory[action.id] || [], ...action.updates] }
            }
        case UPDATE_SCENE_PART_PERSONS:
            return {
                ...state,
                scenePartPersons: { ...state.scenePartPersons, [action.id]: action.partPersons }
            };
        case CHANGE_FOCUS:

            return {
                ...state,
                focus: { [action.focus.id]: action.focus }
            }
        case CLEAR_IMPORT_UPDATES:
            return {
                ...state,
                sceneHistory: [...state.sceneHistory.filter(item => item.id !== IMPORT_GUID)],
                sceneScriptItemHistory: { ...state.sceneScriptItemHistory, [IMPORT_GUID]: [] },
                scenePartPersons: { ...state.scenePartPersons, [IMPORT_GUID]: [] },
            }
        case CLEAR_SCRIPT_EDITOR_STATE:

            return {
                ...initialState
            }
        case UPDATE_PREVIOUS_CURTAIN:
            return {
                ...state,
                previousCurtain: { ...state.previousCurtain, [action.nextSceneId]: action.previousCurtainOpen }
            }

        case ADD_UPDATE_TO_SCRIPT_ITEM_HISTORY:
            return {
                ...state,
                scriptItemHistory: {
                    ...state.scriptItemHistory, [action.update.id]: [...state.scriptItemHistory[action.update.id] || [], action.update]
                }
            }
        case SET_SHOW:
            return {
                ...state,
                show: action.show,
            };
        case ADD_TEXT_AREA_CONTEXT:
            return {
                ...state,
                textAreaContext: { ...state.textAreaContext, [action.scriptItemType]: action.context }
            }

        case UPDATE_UNDO_DATE_TIME:
            return {
                ...state,
                undoSceneId: action.sceneId,
                undoDateTime: action.undoDateTime,
                isUndoInProgress: (action.undoDateTime !== null)
            }

        case TRIGGER: 
            return {
                ...state,
                trigger: { ...action.payload, type: action.triggerType },
            }
        default: return state;
    }
}
