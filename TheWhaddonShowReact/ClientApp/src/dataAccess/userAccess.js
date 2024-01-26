import { isMobileDevice, isScreenLargerThan } from '../core/screenHelper';

export const READ = 'READ'
export const WRITE = 'WRITE'
export const DEMOID = '96eedb3d-132e-432f-a0f4-b1cd73728774'
export const REHEARSALID = '7d0e525b-cc4b-4ef8-bf22-f9e58a4a5c92'

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
    }

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



export const isScriptReadOnly = (currentUser, printScript = false) => {
    if (printScript === true) return true;
    if (isMobileDevice() === true) return true;

    return !currentUser?.isWriter;
}
