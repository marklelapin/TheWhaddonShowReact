import {
    UPDATE_FROM_TO
} from '../actions/apiMonitor';


const defaultState = {
    dateFrom: new Date(new Date().getDate() - 7),
    dateTo: new Date()
};

export default function apiMonitorReducer(state = defaultState, action) {

    switch (action.type) {
        case UPDATE_FROM_TO:
                return Object.assign({}, state, {
                    dateFrom: action.payload.dateFrom,
                    dateTo: action.payload.dateTo,
                });
        default:
            return state;
    }
}
