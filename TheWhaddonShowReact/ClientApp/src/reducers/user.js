import {
    LOGIN, LOGOUT, UPDATE_CURRENT_USER, ACKNOWLEDGE_USER_MESSAGE
} from '../actions/user';


export const defaultState = {
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
        case ACKNOWLEDGE_USER_MESSAGE:
            return {
                ...state,
                userMessages: [...state.userMessages, { message: action.message, authenticatedUser: action.authenticatedUser }]
            };

        default:
            return state;
    }
}

