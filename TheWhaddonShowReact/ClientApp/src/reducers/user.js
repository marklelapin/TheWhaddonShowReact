import {
    LOGIN, LOGOUT
} from '../actions/user';

const defaultState = {
    currentUser: { firstName: 'mark', lastName: 'carter', email: 'sdfsdfsdf', isWriter: true, isAdmin: true }
}

export default function userReducer(state = defaultState, action) {

    switch (action) {
        case LOGIN:
            return {
                ...state,
                currentUser: action.person
            };
        case LOGOUT:
            return {
                ...state,
                currentUser: null
            }

        default:
            return state;
    }
}

