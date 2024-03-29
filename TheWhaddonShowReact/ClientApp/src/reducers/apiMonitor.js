import {
    UPDATE_FROM_TO
    , TOGGLE_SHOW_SUCCESS
    , TOGGLE_SHOW_FAILURE
    , UPDATE_SEARCH,
    UPDATE_IS_LOADING
} from '../actions/apiMonitor';

let date = new Date();

date.setDate(date.getDate()-2)



const defaultState = {
    dateFrom: date,
    dateTo: new Date(),
    search: '',
    showSuccess: true,
    showFailure: true,
    isLoading: false,
};

export default function apiMonitorReducer(state = defaultState, action) {

    switch (action.type) {
        case UPDATE_FROM_TO:
                return Object.assign({}, state, {
                    dateFrom: action.payload.dateFrom,
                    dateTo: action.payload.dateTo,
                });
        case TOGGLE_SHOW_SUCCESS:
            return Object.assign({}, state, {
                showSuccess: !state.showSuccess
            }); 
        case TOGGLE_SHOW_FAILURE:
            return Object.assign({}, state, {
                showFailure: !state.showFailure
            });
        case UPDATE_SEARCH:
            return Object.assign({}, state, {
                search: action.payload.search
            });
        case UPDATE_IS_LOADING:

            return Object.assign({}, state, {
                isLoading: action.payload
            });

        default:
            return state;
    }
}
