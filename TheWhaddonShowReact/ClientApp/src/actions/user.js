//global actions
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT'; 
export const UPDATE_CURRENT_USER = 'UPDATE_CURRENT_USER';

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
