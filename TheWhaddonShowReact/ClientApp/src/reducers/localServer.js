import {
    SET_LOCALCOPYID,
    UPDATE_LASTSYNCDATE,
    RESET_LIST,
    PROCESS_LOCAL_TO_SERVER_POSTBACK,
    ADD_UPDATES,
    CLEAR_CONFLICTS,
    UPDATE_CONNECTION_STATUS,
    SYNC,
END_SYNC
} from 'actions/localServer';

import {
    //**LSMTypeInCode** */
    Person
    , ScriptItem
    , Part
    ,LocalServerModel
} from 'dataAccess/localServerModels';
import { v4 as uuidv4 } from 'uuid';

const defaultState = {
    localCopyId: uuidv4(),
    lastSyncData: null,
    //**LSMTypeInCode**
    persons: new LocalServerModel(Person), //object holding all information with regard to persons
    scriptItems: new LocalServerModel(ScriptItem), //object holding all information with regard to scriptItems
    parts: new LocalServerModel(Part),//object holding all information with regard to parts
    connectionStatus: 'Ok'
};  




export default function localServerReducer(state = defaultState, action) {



    switch (action.type) {

        //Global
        case SET_LOCALCOPYID:
            return Object.assign({}, state, {
                localCopyId: action.payload
            });
        case UPDATE_LASTSYNCDATE:
            return Object.assign({}, state, {
                lastSyncDate: action.payload
            });
        case UPDATE_CONNECTION_STATUS:
            return Object.assign({}, state, {
                connectionStatus: action.payload
            });



        //Actions where a line needs to be added for each new LocalServerModel update type (e.g. persons, scriptItems, parts) **LSMTypeInCode**
        case RESET_LIST:
            switch (action.payloadType) {
                case Person: return { ...state, persons: { ...state.persons, history: action.payload } };
                case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, history: action.payload } };
                case Part: return { ...state, parts: { ...state.parts, history: action.payload } };
                default: return state;
            }
        case PROCESS_LOCAL_TO_SERVER_POSTBACK:
            {
                if (action.payload.length === 0) { return state }

                let searchArray = [];
                switch (action.payloadType) {
                    //**LSMTypeInCode**
                    case Person: searchArray = state.persons.history;break
                    case ScriptItem: searchArray = state.scriptItems.history;break
                    case Part:  searchArray = state.parts.history;break
                    default: searchArray = [];
                }

                if (searchArray.length === 0) { return state; }


                //creates array of updated items and unaffected items
                const updatedArray = searchArray.map((item) => {
                    const matchingUpdate = action.payload.find(
                        postBack => 
                            postBack.id === item.id && postBack.created === item.created);

                    if (matchingUpdate) { //if there is a match return the updated item
                        return {
                            ...item,
                            updatedOnServer: matchingUpdate.updatedOnServer,
                            postBackSent: false
                        };
                    }
                    //else return an unaffected item
                    return item;

                })//end of map.

                switch (action.payloadType) {
                    //**LSMTypeInCode** */
                    case Person: return { ...state, persons: { ...state.persons, history: updatedArray } };
                    case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, history: updatedArray } };
                    case Part: return { ...state, parts: { ...state.parts, history: updatedArray } };
                    default: return { state };
                }
            }

       case ADD_UPDATES:
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case Person: return { ...state, persons: { ...state.persons, history: [...state.persons.history, ...action.payload] } };
                case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, history: [...state.scriptItems.history, ...action.payload] } };
                case Part: return { ...state, parts: { ...state.parts, history: [...state.parts.history, ...action.payload] } };
                default: return state
            };


        case CLEAR_CONFLICTS: //TODO Complete Clear Conflicts
            if (action.payload.length === 0) { return state }

            let searchArray = [];
            switch (action.payloadType) {
//**LSMTypeInCode** */
                case Person: searchArray = state.persons.history; break
                case ScriptItem: searchArray = state.scriptItems.history; break
                case Part: searchArray = state.parts.history; break
                default: searchArray = [];
            }

            if (searchArray.length === 0) { return state }

            //creates array of updated items and unaffected items
            const updatedArray = searchArray.map((item) => {
                const matchingUpdate = action.payload.find(
                    x => x === item.id)

                if (matchingUpdate) {
                    return {
                        ...item,
                        isConflicted: false
                    }
                }
                return item;
            })

            switch (action.payloadType) {
                    //**LSMTypeInCode** */
                case Person: return { ...state, persons: { ...state.persons, history: updatedArray } };
                case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, history: updatedArray } };
                case Part: return { ...state, parts: { ...state.parts, history: updatedArray } };
                default: return state;
            };
        case SYNC:
            switch (action.payloadType) {
                    //**LSMTypeInCode** */
                case Person: return { ...state, persons: { ...state.persons, isSyncing: true } };
                case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, isSyncing: true } };
                case Part: return { ...state, parts: { ...state.parts, isSyncing: true } };
                default: return state;
            };
        case END_SYNC:
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case Person: return { ...state, persons: { ...state.persons, isSyncing: false } };
                case ScriptItem: return { ...state, scriptItems: { ...state.scriptItems, isSyncing: false } };
                case Part: return { ...state, parts: { ...state.parts, isSyncing: false } };
                default: return state;
            }
        default:
            return state;
    }
}