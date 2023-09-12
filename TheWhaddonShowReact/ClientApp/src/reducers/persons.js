import {
    CREATE_LIST
    , ADD_UPDATE
} from '../actions/persons';

let date = new Date();

date.setDate(date.getDate()-2)



const defaultState = {
    user: null
    ,persons: [] //array of all updates to do with persons
};

export default function personsReducer(state = defaultState, action) {

    switch (action.type) {
        case CREATE_LIST:
                return Object.assign({}, state, {
                    persons: action.payload
                });
        case ADD_UPDATE:
            return Object.assign({}, state, {
                    persons: [...state.persons,...action.payload]
                }
            );
        default:
            return state;
    }
}
