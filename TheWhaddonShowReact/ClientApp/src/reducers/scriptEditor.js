import {
    CLEAR_SCRIPT_EDITOR_STATE,
    UPDATE_SEARCH_PARAMETERS,
    TOGGLE_SCENE_SELECTOR,
    SET_SHOW_COMMENTS,
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
    UPDATE_PERSON_SELECTOR_CONFIG,
    UPDATE_VIEW_STYLE,
    SET_READ_ONLY,
    UPDATE_SCENE_LOADED,
    UPDATE_INITIAL_SYNC_PROGRESS,
    UPDATE_SCRIPT_ITEM_TEXT_WIDTH,
    UPDATE_MAX_SCRIPT_ITEM_TEXT_WIDTH,
    SET_SHOW_SCENE_SELECTOR,
    UPDATE_SHOW_BOOLS,
    UPDATE_MOVEMENT_IN_PROGRESS
} from '../actions/scriptEditor';

import { SCENE } from '../dataAccess/scriptItemTypes';

import { log, SCRIPT_EDITOR_REDUCER as logType } from '../logging';
import { SCRIPT_ITEM, PERSON, PART } from '../dataAccess/localServerModels';
import { IMPORT_GUID } from '../pages/scriptEditor/ScriptImporter';
import { getMaxScriptItemTextWidth, getTextAreaWidth } from '../pages/scriptEditor/scripts/layout';

export const initialState = {
    searchParameters: {
        tags: [],
        characters: [],
        myScenes: false,
    },
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
    currentUndo: {},
    redoList: [],
    trigger: {},
    personSelectorConfig: null,
    maxWidthExists: false,
    maxScriptItemTextWidth: null,
    viewStyle: 'chat',
    readOnly: false,
    initialSyncProgress: { part: 0, person: 0, scriptItem: 0 },
    scriptItemTextWidths: {},

    showSceneSelector: false,
    showScriptViewer: true,
    showComments: true,
    showCommentControls: true,
    showSceneSelectorControls: false,
    modalSceneSelector: false,

    movementInProgress: false,
}

export default function scriptEditorReducer(state = initialState, action) {
    // log(logType, 'action:', action)

    switch (action.type) {
        case UPDATE_SEARCH_PARAMETERS:
            return {
                ...state,
                searchParameters: action.searchParameters,
            };
        case TOGGLE_SCENE_SELECTOR:
            return {
                ...state,
                showSceneSelector: !state.showSceneSelector,
            };
        case SET_SHOW_COMMENTS:
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
            //   log(logType, 'UPDATE_CURRENT_PART_PERSONS action.partPersons: ', action.partPersons.length)
            const updatedPartPersons = action.partPersons.reduce((acc, partPerson) => {
                acc[partPerson.id] = { ...partPerson };
                return acc;
            }, { ...state.currentPartPersons });

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

        case RESET_UNDO:
            return {
                ...state,
                currentUndo: {},
                redoList: [],
            }
        case ADD_ITEMS_TO_REDO_LIST:

            //    log(logType, 'ADD_ITEMS_TO_REDO_LIST action.items', { items: action.items, sceneId: action.sceneId })
            //    log(logType, 'redo list', state.redoList)
            return {
                ...state,
                currentUndo: { ...state.undoSceneId, [action.sceneId]: true },
                redoList: [...state.redoList, ...action.items],
            }
        case REMOVE_ITEMS_FROM_REDO_LIST:
            return {
                ...state,
                redoList: [...state.redoList.filter(item => new Date(item.created).getTime() !== new Date(action.createdDate).getTime())],
            }

        case TRIGGER:

            const newTrigger = { ...action.payload, triggerType: action.triggerType }

            log(logType, 'TRIGGER', { newTrigger })

            return {
                ...state,
                trigger: newTrigger,
            }
        case UPDATE_CURRENT_SCRIPT_ITEMS:
            // log(logType, 'UPDATE_CURRENT_SCRIPT_ITEMS action.scriptItems: ', action.scriptItems.length)
            //update created dates for sceneOrders (mutating the state on purpose) - this created date shouldn't cause a re-render
            //it is used for quick look up of the latest created date when undoing.
            //ensures that sceneOrder created matches the currentSCriptItems created date
            if (action.scriptItems) {
                action.scriptItems.forEach(scriptItem => {
                    const sceneOrder = (scriptItem.type === SCENE) ? state.sceneOrders[scriptItem.id] : state.sceneOrders[scriptItem.parentId] || [];

                    const sceneOrderItem = sceneOrder?.find(item => item.id === scriptItem.id);
                    if (sceneOrderItem) {
                        sceneOrderItem.created = scriptItem?.created;
                    }
                })
            }

            //update for currenSCriptItems
            const updatedScriptItems = action.scriptItems.reduce((acc, scriptItem) => {
                acc[scriptItem.id] = { ...scriptItem }
                return acc;
            }, { ...state.currentScriptItems });

            return {
                ...state,
                currentScriptItems: updatedScriptItems,
            }
        case UPDATE_SCENE_ORDERS:
            //  log(logType, 'UPDATE_SCENE_ORDERS action.sceneOrders:', { noSceneOrders: action.sceneOrders.length, sceneOrder0: action.sceneOrders[0] })
            const updatedSceneOrders = action.sceneOrders.reduce((acc, sceneOrder) => {
                acc[sceneOrder[0]?.id] = [...sceneOrder];

                return acc;
            }, { ...state.sceneOrders });

            return {
                ...state,
                sceneOrders: updatedSceneOrders
            }
        case UPDATE_PERSON_SELECTOR_CONFIG:
            //  log(debug, 'Reducer:UPDATE_PERSON_SELECTOR_CONFIG action.config', action.config)
            return {
                ...state,
                personSelectorConfig: action.config
            }


        case UPDATE_VIEW_STYLE:
            return {
                ...state,
                viewStyle: action.viewStyle
            }
        case SET_READ_ONLY:
            return {
                ...state,
                readOnly: action.readOnly
            }
        case UPDATE_SCENE_LOADED:
            return {
                ...state,
                sceneLoaded: action.id
            }
        case UPDATE_INITIAL_SYNC_PROGRESS:

            switch (action.localServerType) {
                case SCRIPT_ITEM:
                    return {
                        ...state,
                        initialSyncProgress: { ...state.initialSyncProgress, scriptItem: 1 }
                    }
                case PERSON:
                    return {
                        ...state,
                        initialSyncProgress: { ...state.initialSyncProgress, person: 1 }
                    }
                case PART:
                    return {
                        ...state,
                        initialSyncProgress: { ...state.initialSyncProgress, part: 1 }
                    }
                default: return state;
            }; break;

        case UPDATE_MAX_SCRIPT_ITEM_TEXT_WIDTH:

            const newMaxWidth = getMaxScriptItemTextWidth(state.showSceneSelector, state.showComments)

            if (newMaxWidth === null) {
                return {
                    ...state,
                    maxWidthExists: false,
                }
            }
            if (state.currentScriptItems.length === 0) {
                return {
                    ...state,
                    maxWidthExists: false,
                }
            }

            let updatedScriptItemTextWidths = { ...state.scriptItemTextWidths }

            Object.keys(state.currentScriptItems).forEach(id => {
                const scriptItem = state.currentScriptItems[id];
                const textWidth = getTextAreaWidth(scriptItem.text, scriptItem.type, null, newMaxWidth);

                if (!state.scriptItemTextWidths[id]) {
                    updatedScriptItemTextWidths = { ...updatedScriptItemTextWidths, [id]: textWidth }
                } else
                    if (state.scriptItemTextWidths[id] !== textWidth) {
                        updatedScriptItemTextWidths[id] = textWidth;
                    }

            })

            console.log('updateMaxWidth complete')

            return {
                ...state,
                maxWidthExists: true
                , scriptItemTextWidths: updatedScriptItemTextWidths
                , maxScriptItemTextWidth: newMaxWidth
            }
        case UPDATE_SCRIPT_ITEM_TEXT_WIDTH:

            if (state.movementInProgress === true) {
                return state;
            }

            const maxWidth = getMaxScriptItemTextWidth(state.showSceneSelector, state.showComments)

            const text = action.text || state.currentScriptItems[action.id]?.text || null;
            const type = action.scriptItemType || state.currentScriptItems[action.id]?.type || null;
            const endMargin = action.endMargin || null;

            const newTextWidth = getTextAreaWidth(text, type, endMargin, maxWidth);

            return {
                ...state,
                scriptItemTextWidths: { ...state.scriptItemTextWidths, [action.id]: newTextWidth }
            }
        case SET_SHOW_SCENE_SELECTOR:
            return {
                ...state,
                showSceneSelector: action.showSceneSelector
            }
        case UPDATE_SHOW_BOOLS:
            return {
                ...state,
                showSceneSelector: action.showBools.showSceneSelector,
                showScriptViewer: action.showBools.showScriptViewer,
                showComments: action.showBools.showComments,
                showCommentControls: action.showBools.showCommentControls,
                showSceneSelectorControls: action.showBools.showSceneSelectorControls,
                modalSceneSelector: action.showBools.modalSceneSelector,
            };

        case UPDATE_MOVEMENT_IN_PROGRESS:
            return {
                ...state,
                movementInProgress: action.movementInProgress
            }
        default: return state;
    }
}
