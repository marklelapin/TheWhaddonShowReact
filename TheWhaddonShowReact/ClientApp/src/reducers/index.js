import { combineReducers } from 'redux';
import apiMonitor from './apiMonitor';
import navigation from './navigation';
import alerts from './alerts';
import layout from './layout';
import localServer from './localServer';
import scriptEditor from './scriptEditor';
import cache from './cache';
import user from './user';
import device from './device';
//import { connectRouter } from 'connected-react-router';

export default () =>
    combineReducers({
        //router: connectRouter(history),
        alerts,
        apiMonitor,
        navigation,
        layout,
        localServer,
        scriptEditor,
        cache,
        user,
        device,
    });
