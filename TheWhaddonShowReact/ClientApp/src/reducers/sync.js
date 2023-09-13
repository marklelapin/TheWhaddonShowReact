import { SET_LOCALCOPYID, UPDATE_LASTSYNCDATE } from '../actions/sync';


const defaultState = {
    localCopyId: null,
    lastSyncData: null,
};

export default function syncReducer(state = defaultState, action) {
switch (action.type) {
            case SET_LOCALCOPYID:
                return Object.assign({}, state, {
                    localCopyId: action.payload
                });
            case UPDATE_LASTSYNCDATE:
                return Object.assign({}, state, {
                    lastSyncDate: action.payload
                });
    
            default:
                return state;
        }
    }