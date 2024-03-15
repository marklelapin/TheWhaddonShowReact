import {
    LOGIN, LOGOUT, UPDATE_CURRENT_USER, ACKNOWLEDGE_USER_MESSAGE
} from '../actions/user';


export const defaultState = {
    authenticatedUser: null,
    currentUser: null,
    acknowledgedMessages: [],
}
;
export default function userReducer(state = defaultState, action) {

    const acknowledgedMessages = state.acknowledgedMessages  //handles data change for existing users.

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

            console.log('acknowledgedMessages', { acknowledgedMessages, user: action.user, messageId: action.messageId })

            return {
                ...state,
                acknowledgedMessages: (acknowledgedMessages) ? [...acknowledgedMessages, { messageId: action.messageId, user: action.user }]
                : [{ messageId: action.messageId, user: action.user }]
            };

        default:
            return state;
    }
}

