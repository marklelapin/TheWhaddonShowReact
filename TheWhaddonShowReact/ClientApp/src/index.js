//React/Redux
import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
//import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux'
import ReduxThunk from 'redux-thunk'

//Azure Authentication
import { PublicClientApplication, EventType } from "@azure/msal-browser";
//import { BrowserRouter } from 'react-router-dom';
import { msalConfig } from './authConfig.js'

//Utilities

import * as serviceWorker from './serviceWorker';
import axios from 'axios';

import { saveStateToBrowserStorage, loadStateFromBrowserStorage } from './dataAccess/browserStorage';


import App from './components/App';
import config from './config';
import createRootReducer from './reducers';

import { createHashHistory } from 'history';


import { log, INDEX as logType } from './logging';
// Styles
import './styles/theme.scss';
//import './styles.css' 
//assert { type: 'css' };
//document.adoptedStyleSheets = [sheet];
//shadowRoot.adoptedStyleSheets = [sheet];

const history = createHashHistory();
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


//export function getHistory() {
//    return history;
//}

let store;

const initApp = async () => {
    console.log('baseURL', config.baseURLApi)
    axios.defaults.baseURL = config.baseURLApi;

    axios.defaults.headers.common['Content-Type'] = "application/json";
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    await msalInstance.initialize();

    try {
        const preloadedState = await loadStateFromBrowserStorage();

        log(logType, 'preloadedState exisits:', { copyId: preloadedState?.localServer.localCopyId })

        store = createStore(
            createRootReducer(),
            preloadedState,
            compose(
                //  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
            )
        );
    } catch (err) {
        store = createStore(
            createRootReducer(),
        );

    }

    store.subscribe(
        _.debounce(() => saveStateToBrowserStorage(store.getState()), 5000)
    )


    const container = document.getElementById("root");
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <Provider store={store}>
                <App instance={msalInstance} />
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



