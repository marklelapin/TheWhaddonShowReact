import {
    RESET_LIST
    , PROCESS_LOCAL_TO_SERVER_POSTBACK
    , ADD_UPDATES
    , CLEAR_CONFLICTS
} from '../actions/persons';


const defaultState = {
    user: null
    , persons: [] //array of all updates to do with persons
};

export default function personsReducer(state = defaultState, action) {

    switch (action.type) {
        case RESET_LIST:
            return Object.assign({}, state, {
                persons: action.payload
            });
        case PROCESS_LOCAL_TO_SERVER_POSTBACK:

            const postBacks = action.payload.map(postBack => {

                const matchingUpdate = state.persons.find(x => x.id === postBack.id && x.createdDate === postBack.createdDate);

                if (matchingUpdate) {
                    return Object.assign({}, matchingUpdate, {
                        updatedOnServer: postBack.updatedOnServer
                    }
                    )
                }

                return state;
            }); break
        case ADD_UPDATES:
           

            return Object.assign({}, state, {
                persons: [...state.persons, ...action.payload]
            }
            );
        case CLEAR_CONFLICTS:
            const clearConflicts = action.payload.map(conflictId => {
                const matchingUpdate = state.persons.find(x => x.id === conflictId);
                if (matchingUpdate) {
                    return Object.assign({}, matchingUpdate, {
                        isConflicted: false
                    }
                    )
                }
                return state;
            }); break
        default:
            return state;
    }
}

