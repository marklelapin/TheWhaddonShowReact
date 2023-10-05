import { UPDATE_SEARCH_PARAMETERS } from 'actions/scriptEditor';
import { UPDATE_VIEW_COMMENTS } from 'actions/scriptEditor';
import { UPDATE_DIALOGUE_RIGHT_ID } from 'actions/scriptEditor';
import { TOGGLE_SCENE_SELECTOR } from 'actions/scriptEditor';
import { UPDATE_SHOW_COMMENTS } from 'actions/scriptEditor';
import { UPDATE_VIEW_AS_PERSON } from 'actions/scriptEditor';
import { UPDATE_VIEW_AS_PART_ID } from 'actions/scriptEditor';

const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
    showComments: true,
    dialogueRightId: null,
    showSceneSelector: true,
    viewAsPerson: null,
    viewAsPartId: null,

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
        case UPDATE_VIEW_AS_PERSON:
            return {
                ...state,
                viewAsPerson: action.viewAsPerson,
            };
        case UPDATE_VIEW_AS_PART_ID:
            return {
                ...state,
                viewAsPartId: action.viewAsPartId,
            };
        default:
            return state;
    }
}
