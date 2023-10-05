import { UPDATE_SEARCH_PARAMETERS } from 'actions/scriptEditor';
import { UPDATE_VIEW_COMMENTS } from 'actions/scriptEditor';
import { UPDATE_DIALOGUE_RIGHT_ID } from 'actions/scriptEditor';
import {TOGGLE_SCENE_SELECTOR } from 'actions/scriptEditor'; 

const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
    viewComments: true,
    dialogueRightId: null,
    showSceneSelector: true,

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
        default:
            return state;
    }
}
