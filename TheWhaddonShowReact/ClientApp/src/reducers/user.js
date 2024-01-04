import {
    LOGIN, LOGOUT, IMPERSONATE_USER, STOP_IMPERSONATING
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
        case IMPERSONATE_USER:
            return {
                ...state,
                currentUser: action.person
            }
        case STOP_IMPERSONATING:
            return {
                ...state,
                currentUser: state.authenticatedUser
            }
        default:
            return state;
    }
}

