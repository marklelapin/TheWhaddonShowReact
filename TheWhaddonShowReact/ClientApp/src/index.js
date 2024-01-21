//React/Redux
import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'




//Azure Authentication
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from '../src/authConfig.js'

//Utilities

import * as serviceWorker from '../src/serviceWorker.js';
import axios from 'axios';

import { saveStateToBrowserStorage, loadStateFromBrowserStorage } from '../src/dataAccess/browserStorage.js';
import { NO_INDEXED_DB } from '../src/dataAccess/indexedDB.js'

import App from '../src/components/App.jsx';
import config from '../src/config.js';
import createRootReducer from '../src/reducers';

import { createHashHistory } from 'history';


import { log, INDEX as logType } from '../src/logging.js';


// Styles
import '../src/styles/theme.scss';
//import './styles.css' 
//assert { type: 'css' };
//document.adoptedStyleSheets = [sheet];
//shadowRoot.adoptedStyleSheets = [sheet];

//const history = createHashHistory();
const _ = require('lodash');

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
        } else {
            log(logType, 'preloadedState exists:', { copyId: preloadedState?.localServer.localCopyId })
        }

    } catch (err) {
        log(logType, 'preloadedState error:', err)
        preloadedState === undefined;
    }


    if (preloadedState === undefined) {
        store = createStore(
            createRootReducer(),
            compose(
                window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            )
        );
    }
    else {
        store = createStore(
            createRootReducer(),
            preloadedState,
            compose(
               window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            )
        )
    }

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
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
   serviceWorker.unregister();


}

initApp();

export const storeRef = store;



