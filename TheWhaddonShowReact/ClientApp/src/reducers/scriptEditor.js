import {
    ADD_TEXT_AREA_CONTEXT,
    CLEAR_SCRIPT_EDITOR_STATE,
    UPDATE_SEARCH_PARAMETERS,
    UPDATE_VIEW_COMMENTS,
    UPDATE_DIALOGUE_RIGHT_ID,
    TOGGLE_SCENE_SELECTOR,
    UPDATE_SHOW_COMMENTS,
    UPDATE_VIEW_AS_PART_PERSON,
    UPDATE_CURRENT_PART_PERSONS,
    UPDATE_CURRENT_SCRIPT_ITEMS,
    UPDATE_SCENE_ORDERS,
    UPDATE_SCENE_IN_FOCUS,
    UPDATE_SCRIPT_ITEM_IN_FOCUS,
    CLEAR_IMPORT_UPDATES,
    UPDATE_PREVIOUS_CURTAIN,
    SET_SHOW,
    TRIGGER,
    ADD_ITEMS_TO_REDO_LIST,
    REMOVE_ITEMS_FROM_REDO_LIST,
    RESET_UNDO,
    UPDATE_PERSON_SELECTOR_CONFIG

} from '../actions/scriptEditor';

import {log } from '../helper';

import { IMPORT_GUID } from '../pages/scriptEditor/ScriptImporter';
const debug = true;

export const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
    showComments: true,
    dialogueRightId: null,
    showSceneSelector: true,
    show: {
        id: '3c2277bd-b117-4d7d-ba4e-2b686b38883a',
        parentId: '3c2277bd-b117-4d7d-ba4e-2b686b38883a',
        nextId: '54163921-3598-4cbe-96af-84da38cf2642',
        previousId: null,
        type: 'SHOW',
        isActive: true
    }
,
    viewAsPartPerson: null,
    currentPartPersons: {},
    currentScriptItems: {},
    sceneOrders: {},
    scriptItemInFocus: {},
    sceneInFocus: {},
    previousCurtainOpen: {},
    textAreaContext: {},
    isUndoInProgress: {},
    redoList: [],
    trigger: {},
    personSelectorConfig: null,

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

        case UPDATE_CURRENT_PART_PERSONS:

            const updatedPartPersons = action.partPersons.reduce((acc, partPerson) => {
                acc[partPerson.id] = { ...partPerson };
                return acc;
            }, { ...state.currentPartPersons });

            log(debug, 'Reducer:UPDATE_CURRENT_PART_PERSONS updatedPartPersons', updatedPartPersons)

            return {
                ...state,
                currentPartPersons: updatedPartPersons
            }

        case UPDATE_SCRIPT_ITEM_IN_FOCUS:

            return {
                ...state,
                scriptItemInFocus: {
                    [action.scriptItemId]: { sceneId: action.sceneId }
                }
            }
        case UPDATE_SCENE_IN_FOCUS:
            return {
                ...state,
                sceneInFocus: action.scene
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
                previousCurtainOpen: { ...state.previousCurtainOpen, [action.sceneId]: action.previousCurtainOpen }
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

        case RESET_UNDO:
            return {
                ...state,
                isUndoInProgress: {},
                redoList: [],
            }
        case ADD_ITEMS_TO_REDO_LIST:
            return {
                ...state,
                isUndoInProgress: { ...state.isUndoInProgress, [action.sceneId]: true },
                redoList: [...state.redoList, ...action.items],
            }
        case REMOVE_ITEMS_FROM_REDO_LIST:
            return {
                ...state,
                redoList: [...state.redoList.filter(item => new Date(item.created) !== new Date (action.createdDate))],
            }

        case TRIGGER:

            const newTrigger = { ...action.payload, triggerType: action.triggerType }

            log(debug, 'Reducer:scriptEditor TRIGGER', { newTrigger })

            return {
                ...state,
                trigger: newTrigger,
            }
        case UPDATE_CURRENT_SCRIPT_ITEMS:

            const updatedScriptItems = action.scriptItems.reduce((acc, scriptItem) => {
                acc[scriptItem.id] = { ...scriptItem }
                return acc;
            }, { ...state.currentScriptItems });

            return {
                ...state,
                currentScriptItems: updatedScriptItems
            }
        case UPDATE_SCENE_ORDERS:

            const updatedSceneOrders = action.sceneOrders.reduce((acc, sceneOrder) => {
                acc[sceneOrder[0].id] = [...sceneOrder];
                
                return acc;
            }, { ...state.sceneOrders });

            return {
                ...state,
                sceneOrders: updatedSceneOrders
            }
        case UPDATE_PERSON_SELECTOR_CONFIG:
            log(debug, 'Reducer:UPDATE_PERSON_SELECTOR_CONFIG action.config', action.config)
            return {
                ...state,
                personSelectorConfig: action.config
            }

        default: return state;
    }
}
