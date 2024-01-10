import {
    TOGGLE_STATIC_SIDEBAR,
    OPEN_SIDEBAR,
    CLOSE_SIDEBAR,
    CHANGE_ACTIVE_SIDEBAR_ITEM,
    CLOSE_SIDEBAR_AND_TOGGLE_STATIC,
} from '../actions/navigation';

const initialState = {
    sidebarOpened: JSON.parse(localStorage.getItem('staticSidebar')) ?? true,
    sidebarStatic: JSON.parse(localStorage.getItem('staticSidebar')) ?? false,
    activeItem: null,
};

export default function runtime(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_STATIC_SIDEBAR:
            return {
                ...state,
                sidebarStatic: !state.sidebarStatic,
            };
        case OPEN_SIDEBAR:
            return Object.assign({}, state, {
                sidebarOpened: true,
            });
        case CLOSE_SIDEBAR:
            return Object.assign({}, state, {
                sidebarOpened: false,
            });
        case CLOSE_SIDEBAR_AND_TOGGLE_STATIC:
            return Object.assign({}, state, {
                sidebarOpened: false,
                sidebarStatic: !state.sidebarStatic
            });
        case CHANGE_ACTIVE_SIDEBAR_ITEM:
            return {
                ...state,
                activeItem: action.activeItem,
            };
        default:
            return state;
    }
}
