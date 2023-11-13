import { combineReducers } from 'redux';
import apiMonitor from './apiMonitor';
import auth from './auth';
import navigation from './navigation';
import alerts from './alerts';
import layout from './layout';
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
        localServer,
        scriptEditor,
        cache,
    });
