import { UPDATE_SEARCH_PARAMETERS } from 'actions/scriptEditor';
import { UPDATE_VIEW_COMMENTS } from 'actions/scriptEditor';
import { UPDATE_DIALOGUE_RIGHT_ID } from 'actions/scriptEditor';
import { TOGGLE_SCENE_SELECTOR } from 'actions/scriptEditor';
import { UPDATE_SHOW_COMMENTS } from 'actions/scriptEditor';
import { UPDATE_VIEW_AS_PART_PERSON } from 'actions/scriptEditor';
import { UPDATE_PART_PERSONS } from 'actions/scriptEditor';
import { ADD_UPDATES_SCENE_HISTORY } from 'actions/scriptEditor';
import { ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY } from 'actions/scriptEditor';
import { UPDATE_SCENE_PART_PERSONS } from 'actions/scriptEditor';

const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
    showComments: true,
    dialogueRightId: null,
    showSceneSelector: true,
    viewAsPartPerson: null,
    partPersons: [],
    scenePartPersons: {},
    sceneHistory: [],
    sceneScriptItemHistory: {},

}

export default function runtime(state = initialState, action) {
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
            return {
                ...state,
                sceneHistory: [...state.sceneHistory, ...action.updates]  //[action.id]: [...state.sceneHistory[action.id], ...action.updates]
            };
        case ADD_UPDATES_SCENE_SCRIPT_ITEM_HISTORY:

            return {
                ...state,
                sceneScriptItemHistory: { ...state.sceneScriptItemHistory, [action.id]: [...state.sceneScriptItemHistory[action.id] || [], ...action.updates] }
            }
        case UPDATE_SCENE_PART_PERSONS:
            return {
                ...state,
                scenePartPersons: { ...state.scenePartPersons, [action.id]: action.partPersons }
            };
        default:
            return state;
    }
}
