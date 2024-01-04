import {
    LOGIN, LOGOUT, UPDATE_CURRENT_USER
} from '../actions/user';

const defaultState = {
    authenticatedUser: null,
    currentUser: null,
}

export default function userReducer(state = defaultState, action) {

    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                authenticatedUser: action.person,
                currentUser: action.person
            };
        case LOGOUT:
            return {
                ...state,
                authenticatedUser: null,
                currentUser: null
            }
        case UPDATE_CURRENT_USER:
            return {
                ...state,
                currentUser: action.person
            }
        default:
            return state;
    }
}

