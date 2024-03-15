//global actions
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const UPDATE_CURRENT_USER = 'UPDATE_CURRENT_USER';
export const ACKNOWLEDGE_USER_MESSAGE = 'ACKNOWLEDGE_USER_MESSAGE';

export function login(person) {
    return {
        type: LOGIN,
        person
    }
}

export function logout() {
    return {
        type: LOGOUT
    }
}

export function updateCurrentUser(person) {
    return {
        type: UPDATE_CURRENT_USER,
        person
    }
}

export function acknowledgeUserMessage(user, messageId) {
    return {
        type: ACKNOWLEDGE_USER_MESSAGE,
        user: user,
        messageId: messageId
    }
}