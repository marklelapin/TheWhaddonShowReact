import reducer from '../scriptEditor'
import {
    CLEAR_SCRIPT_EDITOR_STATE,
    UPDATE_SEARCH_PARAMETERS,

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

} from '../../actions/scriptEditor';


const initialState = {
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

describe('scriptEditor reducer', () => {
    xit('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState)
    })

   xit('should handle CLEAR_SCRIPT_EDITOR_STATE', () => {
        expect(
            reducer(initialState, {
                type: CLEAR_SCRIPT_EDITOR_STATE,
            })
        ).toEqual({
            ...initialState,
        })
    })

    xit('should handle UPDATE_SEARCH_PARAMETERS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_SEARCH_PARAMETERS,
                payload: {
                    searchParameters: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            searchParameters: 'test'
        })
    })
   
    xit('should handle TOGGLE_SCENE_SELECTOR', () => {
        expect(
            reducer(initialState, {
                type: TOGGLE_SCENE_SELECTOR,
                payload: {
                    showSceneSelector: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            showSceneSelector: 'test'
        })
    })

    xit('should handle UPDATE_SHOW_COMMENTS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_SHOW_COMMENTS,
                payload: {
                    showComments: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            showComments: 'test'
        })
    })


    xit('should handle UPDATE_VIEW_AS_PART_PERSON', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_VIEW_AS_PART_PERSON,
                payload: {
                    partPerson: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            viewAsPartPerson: 'test'
        })
    })

    xit('should handle UPDATE_CURRENT_PART_PERSONS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_CURRENT_PART_PERSONS,
                payload: {
                    partPersons: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            currentPartPersons: 'test'
        })
    })

    xit('should handle UPDATE_CURRENT_SCRIPT_ITEMS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_CURRENT_SCRIPT_ITEMS,
                payload: {
                    scriptItems: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            currentScriptItems: 'test'
        })
    })

    xit('should handle UPDATE_SCENE_ORDERS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_SCENE_ORDERS,
                payload: {
                    sceneOrders: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            sceneOrders: 'test'
        })
    })

    xit('should handle UPDATE_SCENE_IN_FOCUS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_SCENE_IN_FOCUS,
                payload: {
                    sceneInFocus: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            sceneInFocus: 'test'
        })
    })

    xit('should handle UPDATE_SCRIPT_ITEM_IN_FOCUS', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_SCRIPT_ITEM_IN_FOCUS,
                payload: {
                    scriptItemInFocus: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            scriptItemInFocus: 'test'
        })
    })

    xit('should handle CLEAR_IMPORT_UPDATES', () => {
        expect(
            reducer(initialState, {
                type: CLEAR_IMPORT_UPDATES,
                payload: {
                    scriptItemInFocus: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            scriptItemInFocus: 'test'
        })
    })

    xit('should handle UPDATE_PREVIOUS_CURTAIN', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_PREVIOUS_CURTAIN,
                payload: {
                    previousCurtainOpen: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            previousCurtainOpen: 'test'
        })
    })

    xit('should handle SET_SHOW', () => {
        expect(
            reducer(initialState, {
                type: SET_SHOW,
                payload: {
                    show: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            show: 'test'
        })
    })

    xit('should handle TRIGGER', () => {
        expect(
            reducer(initialState, {
                type: TRIGGER,
                payload: {
                    trigger: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            trigger: 'test'
        })
    })

    xit('should handle ADD_ITEMS_TO_REDO_LIST', () => {
        expect(
            reducer(initialState, {
                type: ADD_ITEMS_TO_REDO_LIST,
                payload: {
                    redoList: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            redoList: 'test'
        })
    })

    xit('should handle REMOVE_ITEMS_FROM_REDO_LIST', () => {
        expect(
            reducer(initialState, {
                type: REMOVE_ITEMS_FROM_REDO_LIST,
                payload: {
                    redoList: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            redoList: 'test'
        })
    })

    xit('should handle RESET_UNDO', () => {
        expect(
            reducer(initialState, {
                type: RESET_UNDO,
                payload: {
                    redoList: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            redoList: 'test'
        })
    })

    xit('should handle UPDATE_PERSON_SELECTOR_CONFIG', () => {
        expect(
            reducer(initialState, {
                type: UPDATE_PERSON_SELECTOR_CONFIG,
                payload: {
                    personSelectorConfig: 'test'
                }
            })
        ).toEqual({
            ...initialState,
            personSelectorConfig: 'test'
        })
    })

});