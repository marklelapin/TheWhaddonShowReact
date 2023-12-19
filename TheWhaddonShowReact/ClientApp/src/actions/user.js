//global actions
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT'; 


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
