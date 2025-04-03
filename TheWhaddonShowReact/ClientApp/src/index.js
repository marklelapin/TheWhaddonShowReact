//React/Redux
import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { createStore, compose } from 'redux';
import { Provider } from 'react-redux'





//Azure Authentication
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from '../src/authConfig.js'

//Utilities

import registerServiceWorker from '../src/serviceWorkerRegistration.js';
import axios from 'axios';
import _ from 'lodash';
import { saveStateToBrowserStorage, loadStateFromBrowserStorage } from '../src/dataAccess/browserStorage.js';
import { NO_INDEXED_DB, clearState } from '../src/dataAccess/indexedDB.js'
import { defaultState as defaultUserState } from '../src/reducers/user.js'
import { defaultState as defaultSettingsState } from '../src/reducers/settings.js'
import { defaultState as defaultScriptEditorState } from '../src/reducers/scriptEditor.js'
import App from '../src/components/App.jsx';
import ErrorPage from '../src/pages/error/ErrorPage';
import config from '../src/config.js';
import createRootReducer from '../src/reducers';

import { getSettings } from '../src/dataAccess/settingsAccess'

import { log, INDEX as logType } from '../src/dataAccess/logging.js';


// Styles
import '../src/styles/theme.scss';


import LogRocket from 'logrocket';

LogRocket.init('lirpcx/the-whaddon-show-app');


window.addEventListener("load", function () {

    const lockOrientataion = async () => {
        try {

            if (screen.orientation?.lock) {
                await screen.orientation.lock("portrait");
            }
        } catch (err) {
            console.log('Screen orientation lock failed', err)

        }

    }

        lockOrientataion()
    });


console.log('msalConfig', msalConfig)

//Azure AdB2c
const msalInstance = new PublicClientApplication(msalConfig)
msalInstance.addEventCallback((event) => {
    if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
            event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
            event.eventType === EventType.SSO_SILENT_SUCCESS) &&
        event.payload.account
    ) {
        msalInstance.setActiveAccount(event.payload.account);
    }
});

console.log('Environment', process.env.NODE_ENV)
//console.log('isLocalHost', process.env.IS_LOCAL_HOST)
let store;

const initApp = async () => {

    console.log('baseURL', config.baseURLApi)
    axios.defaults.baseURL = config.baseURLApi;

    axios.defaults.headers.common['Content-Type'] = "application/json";
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    await msalInstance.initialize(); //MSAL


    let preloadedState = undefined;
    try {
        preloadedState = await loadStateFromBrowserStorage();
        if (preloadedState === NO_INDEXED_DB) {
            log(logType, NO_INDEXED_DB)
            preloadedState = undefined;
            //preloadingError = true; //TODO: handle this in layout.
        } else {
            log(logType, 'preloadedState exists:', { copyId: preloadedState?.localServer.localCopyId })
        }

    } catch (err) {
        log(logType, 'preloadedState error:', err)
        preloadedState = undefined;
    }

    if (preloadedState !== undefined) {

        //ensure no authenticated user
        preloadedState.user = defaultUserState
        preloadedState.localServer.sync.pauseSync = false
        //ensure correct device details
        // addDeviceInfo(preloadedState)
    } else {
        preloadedState = {}
    }




    console.log('Checking for change in show')
  
    const currentSettings = await getSettings();

    const storedShow = preloadedState?.scriptEditor?.show || null
    const currentShow = currentSettings?.shows?.find(obj => obj.isCurrent === true) || null

    console.log('storedShow', storedShow)
    console.log('currentShow',currentShow)
    if ((storedShow?.id ?? null) !== (currentShow?.id ?? null)) {
        console.log('clear preloaded state and state saved in browser storage')
        clearState()
        preloadedState = {}
        preloadedState.scriptEditor = defaultScriptEditorState
        preloadedState.scriptEditor.show = currentShow
    }

    preloadedState.settings = currentSettings ?? defaultSettingsState
    
    

    store = createStore(
            createRootReducer(),
            preloadedState,
            compose(
                window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            )
        )
    

    log(logType, 'store created. localCopyID: ', store.getState().localServer.localCopyId)

    store.subscribe(
        _.debounce(() => saveStateToBrowserStorage(store.getState()), 5000)
    )

    const container = document.getElementById("root");
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <Provider store={store}>
                <App instance={msalInstance} preloadingError />
            </Provider>
        </BrowserRouter>
    );

    if (process.env.NODE_ENV === 'production') {
        registerServiceWorker();
    }

}

const initAppCatchingErrors = async () => {

    try {
        await initApp();
    } catch (error) {
        const container = document.getElementById("root");
        const root = createRoot(container);
        console.error(error, { error })
        root.render(
            <ErrorPage code={error.code || 500} message='Sorry, an error has occured initiating the app.' details={error.message || error}>
            </ErrorPage>
        );

    }
}


initAppCatchingErrors();



export const storeRef = store;



