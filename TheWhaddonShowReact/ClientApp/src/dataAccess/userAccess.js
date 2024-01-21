

export const READ = 'READ'
export const WRITE = 'WRITE'
export const MARKID = 'af60b927-7f73-4dfd-8343-206c1b30a03b'
export const DEMOID = 'c44bd508-b26a-42a3-abdf-287d64cad080'

import { log, logType } from './logging.js' 

export const userAccessToComponent = (user = null, componentOrPage = null) => {

    if (user === null || componentOrPage === null) return null;
    if (user.isAdmin === true) return WRITE

    switch (componentOrPage) {
        case 'Home':
            return READ;
        case 'Users':
            return (user.id === DEMOID) ? READ : null;
        case 'Script':
            if (user.isWriter === true || user.id === DEMOID) return WRITE;
            return READ;
        case 'Casting':
            if (user.isWriter === true || user.id === DEMOID) return WRITE;
            return READ;
        case 'Gallery':
            return READ;
        case 'ApiTestResults':
            if (user.id === DEMOID) return READ;
            return null;
        case 'ApiMonitor':
            if (user.id === DEMOID) return READ;
            return null;
        case 'ApiDocumentation':
            if (user.id === DEMOID) return READ;
            return null;
        default:
            return null;
    }

}

export const getDefaultPauseSync = (person) => {
    if (person?.isWriter === true) return false;
    return true;
}


export const signOutAllUsers = async (instance) => {
    const accounts = await instance.getAllAccounts();

    if (accounts.length > 0) {
        // Iterate through all accounts and sign out each one
        accounts.forEach(async (account) => {
            doMsalLogout(instance, account)
        });
    };

};

const doMsalLogout = async (instance, account) => {
    try {
        instance.logoutPopup({
            account,
            //mainWindowRedirectUri: '/app/home', // redirects the top level app after logout
        })

    } catch (popupLogoutError) {
        instance.logoutRedirect();
    }
}
