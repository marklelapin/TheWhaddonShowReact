import {
    OPEN_STATIC_SIDEBAR,
    CLOSE_STATIC_SIDEBAR,
    OPEN_SIDEBAR,
    CLOSE_SIDEBAR,

} from '../actions/navigation';

const initialState = {
    sidebarOpened: true,
    sidebarStatic: true,
    activeItem: null,
};

export default function runtime(state = initialState, action) {
    switch (action.type) {
        case OPEN_STATIC_SIDEBAR:
            return {
                ...state,
                sidebarStatic: true,
                sidebarOpened: true,
            };
        case CLOSE_STATIC_SIDEBAR:
            return {
                ...state,
                sidebarStatic: false,
                sidebarOpened: false,
            };
        case OPEN_SIDEBAR:
            return Object.assign({}, state, {
                sidebarOpened: true,
            });
        case CLOSE_SIDEBAR:
            return Object.assign({}, state, {
                sidebarOpened: false,
            });
        default:
            return state;
    }
}
