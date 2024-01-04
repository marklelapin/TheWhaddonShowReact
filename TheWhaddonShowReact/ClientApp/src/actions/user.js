//global actions
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT'; 
export const IMPERSONATE_USER = 'UPDATE_IMPERSONATE_USER';
export const STOP_IMPERSONATING = 'STOP_IMPERSONATING';

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

export function impersonateUser(person) {
    return {
        type: IMPERSONATE_USER,
        person
    }
}

export function stopImpersonating() {
    return {
        type: STOP_IMPERSONATING,
    }
}
