import { isMobileDevice } from '../core/screenHelper';

export const READ = 'READ'
export const WRITE = 'WRITE'
export const DEMOID = '96eedb3d-132e-432f-a0f4-b1cd73728774'
export const DEMOPassword = 'TheWhadd0nSh0w' //this is going to be copied for user to make login as easy as possible. Ok to have in code as access restricted to demo user.
export const REHEARSALID = '7d0e525b-cc4b-4ef8-bf22-f9e58a4a5c92'

export const DEMO_VIEW_AS_PERSONID = '7836850e-bc32-424b-9cbf-8f3e2e032cc0' //Guy


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



export const isScriptReadOnly = (currentUser, _isMobileDevice, printScript = false) => {

    const isMobile = (_isMobileDevice === null || _isMobileDevice === undefined) ? isMobileDevice() : _isMobileDevice;

    if (printScript === true) return true;
    if (isMobile === true) return true;

    return !currentUser?.isWriter;
}
