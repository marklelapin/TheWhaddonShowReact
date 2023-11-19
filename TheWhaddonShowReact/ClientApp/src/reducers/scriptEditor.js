import { ADD_UPDATE_TO_SCRIPT_ITEM_HISTORY, CLEAR_SCRIPT_EDITOR_STATE, UPDATE_SEARCH_PARAMETERS } from '../actions/scriptEditor';
import { UPDATE_VIEW_COMMENTS } from '../actions/scriptEditor';
import { UPDATE_DIALOGUE_RIGHT_ID } from '../actions/scriptEditor';
import { TOGGLE_SCENE_SELECTOR } from '../actions/scriptEditor';
import { UPDATE_SHOW_COMMENTS } from '../actions/scriptEditor';
import { UPDATE_VIEW_AS_PART_PERSON } from '../actions/scriptEditor';
import { UPDATE_PART_PERSONS } from '../actions/scriptEditor';
import { ADD_UPDATES_SCENE_HISTORY } from '../actions/scriptEditor';
import { ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY } from '../actions/scriptEditor';
import { UPDATE_SCENE_PART_PERSONS } from '../actions/scriptEditor';
import { CLEAR_IMPORT_UPDATES } from '../actions/scriptEditor';
import { UPDATE_PREVIOUS_CURTAIN } from '../actions/scriptEditor';
import { SET_SHOW } from '../actions/scriptEditor';

import { CHANGE_FOCUS } from '../actions/scriptEditor';

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
                    ...state.scriptItemHistory, [action.update.id]: [...state.scriptItemHistory[action.update.id] || [], action.update] }
            }
        case SET_SHOW:
            return {
                ...state,
                show: action.show,
            };
        default: return state;
    }
}
