//React/Redux
import React from 'react';
import { createRoot } from "react-dom/client";
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'

//Azure Authentication
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { BrowserRouter } from 'react-router-dom';
import { msalConfig } from './authConfig.js'

//Utilities

import * as serviceWorker from './serviceWorker';
import axios from 'axios';
import throttle from 'lodash/throttle';
import { saveStateToBrowserStorage, loadStateFromBrowserStorage } from './dataAccess/browserStorage';
import { setupPersistentIndexedDB } from './dataAccess/indexedDB';

import App from './components/App';
import config from './config';
import createRootReducer from './reducers';

import { doInit } from './actions/auth';
import { createHashHistory } from 'history';

import { log, INDEX as logType } from './logging';

const history = createHashHistory();
const _ = require('lodash');


//Azure AdB2c
const msalInstance = new PublicClientApplication(msalConfig)
//sets up default account
//if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
//    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0])
//}

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


export function getHistory() {
    return history;
}

let store;

const initApp = async () => {

    axios.defaults.baseURL = config.baseURLApi;

    axios.defaults.headers.common['Content-Type'] = "application/json";
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    const preloadedState = await loadStateFromBrowserStorage();

    log(logType, 'preloadedState exisits:', { copyId: preloadedState?.localServer.localCopyId })

     store = createStore(
        createRootReducer(history),
        preloadedState,
        compose(
            applyMiddleware(
                routerMiddleware(history),
                ReduxThunk
            ),
        )
    );

    store.subscribe(
        _.debounce(() => saveStateToBrowserStorage(store.getState()), 5000)
    )

    store.dispatch(doInit());

    const container = document.getElementById("root");
    const root = createRoot(container);
    root.render(
        <Provider store={store}>
            <App instance={msalInstance} />
        </Provider>
    );
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister();


}

initApp();

export const storeRef = store;



