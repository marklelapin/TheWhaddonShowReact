import { combineReducers } from 'redux';
import apiMonitor from './apiMonitor';
import auth from './auth';
import navigation from './navigation';
import alerts from './alerts';
import layout from './layout';
import products from './products';
import analytics from './analytics';
import chat from './chat';
import users from './usersReducers';
import localServer from './localServer';
import scriptEditor from './scriptEditor';
import cache from './cache';
import { connectRouter } from 'connected-react-router';

export default (history) =>
    combineReducers({
        router: connectRouter(history),
        alerts,
        apiMonitor,
        auth,
        navigation,
        layout,
        products,
        analytics,
        users,
        chat,
        localServer,
        scriptEditor,
        cache,
    });
