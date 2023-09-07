import {
    UPDATE_FROM_TO
    ,UPDATE_FILTERS
} from '../actions/apiMonitor';

let date = new Date();

date.setDate(date.getDate()-7)



const defaultState = {
    dateFrom: date,
    dateTo: new Date(),
    search: null,
    showSuccess: true,
    showFailure: true,
};

export default function apiMonitorReducer(state = defaultState, action) {

    switch (action.type) {
        case UPDATE_FROM_TO:
                return Object.assign({}, state, {
                    dateFrom: action.payload.dateFrom,
                    dateTo: action.payload.dateTo,
                });
        case UPDATE_FILTERS:
            return Object.assign({}, state, {
                search: action.payload.search,
                showSuccess: action.payload.showSuccess,
                showFailure: action.payload.showFailure,
            }); 
        default:
            return state;
    }
}
