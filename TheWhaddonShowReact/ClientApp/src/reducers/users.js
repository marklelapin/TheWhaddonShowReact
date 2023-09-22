import {
    USER_MODAL_OFF,
USER_MODAL_ON,
} from '../actions/users';


const defaultState = {
    userModalOpen: false,
};

export default function usersReducer(state = defaultState, action) {

    switch (action.type) {
        case USER_MODAL_ON:
            return {
                ...state,
                userModalOpen: true,
            };
        case USER_MODAL_OFF:
            return {
                ...state,
                userModalOpen: false,
            };
        default:
            return state
            

    }
}

