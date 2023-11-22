﻿import {
    SET_LOCALCOPYID,
    UPDATE_LASTSYNCDATE,
    RESET_LIST,
    PROCESS_LOCAL_TO_SERVER_POSTBACK,
    ADD_UPDATES,
    CLEAR_CONFLICTS,
    UPDATE_CONNECTION_STATUS,
    SYNC,
    END_SYNC,
    CLOSE_POSTBACK,
    SET_PAUSE_SYNC,
    CLEAR_LOCAL_SERVER_STATE
} from '../actions/localServer';

import { CLEAR_IMPORT_UPDATES } from '../actions/scriptEditor';
import { IMPORT_GUID } from '../pages/scriptEditor/ScriptImporter';

import {
    //**LSMTypeInCode** */
    PERSON
    , SCRIPT_ITEM
    , PART
    , LocalServerModel
} from '../dataAccess/localServerModels';
import { v4 as uuidv4 } from 'uuid';

import { log } from '../helper.js';

const defaultState = {
    localCopyId: uuidv4(),
    sync: {
        isSyncing: false,
        error: null,
        lastSyncDate: null,
        pauseSync: false

    },
    refresh: {},
    //**LSMTypeInCode**
    persons: new LocalServerModel(PERSON), //object holding all information with regard to persons
    scriptItems: new LocalServerModel(SCRIPT_ITEM), //object holding all information with regard to scriptItems
    parts: new LocalServerModel(PART),//object holding all information with regard to parts
    connectionStatus: 'Ok'
};




export default function localServerReducer(state = defaultState, action) {

    const debug = true;

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
        case SET_PAUSE_SYNC:
            return Object.assign({}, state, {
                sync: { ...state.sync, pauseSync: action.payload }
            });
        //Actions where a line needs to be added for each new LocalServerModel update type (e.g. persons, scriptItems, parts) **LSMTypeInCode**
        case RESET_LIST:
            switch (action.payloadType) {
                case PERSON: return { ...state, persons: { ...state.persons, history: action.payload } };
                case SCRIPT_ITEM: return { ...state, scriptItems: { ...state.scriptItems, history: action.payload } };
                case PART: return { ...state, parts: { ...state.parts, history: action.payload } };
                default: return state;
            }
        case PROCESS_LOCAL_TO_SERVER_POSTBACK:
            {
                const { id, created, updatedOnServer } = action.payload

                //select the correct data set to process
                let searchArray = null;
                switch (action.payloadType) {
                    //**LSMTypeInCode**
                    case PERSON: searchArray = [...state.persons.history]; break
                    case SCRIPT_ITEM: searchArray = [...state.scriptItems.history]; break
                    case PART: searchArray = [...state.parts.history]; break
                    default: return state;
                }

                //find the index of the item to update
                const searchIndex = searchArray.findIndex((item) => item.id === id && item.created === created);

                //if can't find the item then return the state unchanged
                if (searchIndex === -1) { return state; }

                //create a copy of the data array and ammend the item to be updated
                const updatedHistory = [...searchArray]
                updatedHistory[searchIndex] = { ...updatedHistory[searchIndex], updatedOnServer: updatedOnServer }

                //update the correct array of data
                switch (action.payloadType) {
                    //**LSMTypeInCode** */
                    case PERSON: return { ...state, persons: { ...state.persons, history: updatedHistory } };
                    case SCRIPT_ITEM: return { ...state, scriptItems: { ...state.scriptItems, history: updatedHistory } };
                    case PART: return { ...state, parts: { ...state.parts, history: updatedHistory } };
                    default: return state;
                };
            }
        case CLOSE_POSTBACK:
            const { id, created } = action.payload;

            //Get the correct array of data to update
            let data = null;
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case PERSON: data = [...state.persons.history]; break
                case SCRIPT_ITEM: data = [...state.scriptItems.history]; break
                case PART: data = [...state.parts.history]; break
                default: return state;
            }

            //find the index of the item to update
            const dataIndex = data.findIndex((item) => item.id === id && item.created === created);

            //if can't find the item then return the state unchanged
            if (dataIndex === -1) { return state; }

            //create a copy of the data array and ammend the item to be updated
            const updatedHistory = [...data]
            updatedHistory[dataIndex] = { ...updatedHistory[dataIndex], hasPostedBack: true }

            //update the correct array of data
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case PERSON: return { ...state, persons: { ...state.persons, history: updatedHistory } };
                case SCRIPT_ITEM: return { ...state, scriptItems: { ...state.scriptItems, history: updatedHistory } };
                case PART: return { ...state, parts: { ...state.parts, history: updatedHistory } };
                default: return state;
            };


        case ADD_UPDATES:

            log(debug, 'localServer reducer ADD_UPDATES', action.payload)

            if (action.payload.length === 0) { return state }

            let history = [];
            //pick correct data set to process
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case PERSON: history = [...state.persons.history]; break
                case SCRIPT_ITEM: history = [...state.scriptItems.history]; break
                case PART: history = [...state.parts.history]; break
                default: return state
            };

            //filter out any updates from payload that are already in the store. This can happen if postBacks have failed due to poor connection.

            const updatesToAdd = action.payload.filter((update) => !history.some(existingUpdate => (existingUpdate.id === update.id && existingUpdate.created === update.created)))

            //update correct data set to update

            if (updatesToAdd.length > 0) {
                switch (action.payloadType) {
                    //**LSMTypeInCode** *//
                    case PERSON: return {
                        ...state,
                        persons: { ...state.persons, history: [...state.persons.history, ...updatesToAdd] },
                        refresh: { updates: updatesToAdd, type: action.payloadType }
                    };
                    case SCRIPT_ITEM: return {
                        ...state,
                        scriptItems: { ...state.scriptItems, history: [...state.scriptItems.history, ...updatesToAdd] },
                        refresh: { updates: updatesToAdd, type: action.payloadType }
                    };
                    case PART: return {
                        ...state,
                        parts: { ...state.parts, history: [...state.parts.history, ...updatesToAdd] },
                        refresh: { updates: updatesToAdd, type: action.payloadType }
                    };
                    default: return state
                };


            }
            return state;


        case CLEAR_CONFLICTS: //TODO Complete Clear Conflicts
            if (action.payload.length === 0) { return state }

            let searchArray = [];
            switch (action.payloadType) {
                //**LSMTypeInCode** */
                case PERSON: searchArray = [...state.persons.history]; break
                case SCRIPT_ITEM: searchArray = [...state.scriptItems.history]; break
                case PART: searchArray = [...state.parts.history]; break
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
                case PERSON: return { ...state, persons: { ...state.persons, history: updatedArray } };
                case SCRIPT_ITEM: return { ...state, scriptItems: { ...state.scriptItems, history: updatedArray } };
                case PART: return { ...state, parts: { ...state.parts, history: updatedArray } };
                default: return state;
            };
        case SYNC:
            debug && console.log(`syncing ${action.payloadType}`)
            switch (action.payloadType) {

                //**LSMTypeInCode** */
                case PERSON: return { ...state, persons: { ...state.persons, sync: { ...state.persons.sync, isSyncing: true } } };
                case SCRIPT_ITEM: return { ...state, scriptItems: { ...state.scriptItems, sync: { ...state.scriptItems.sync, isSyncing: true } } };
                case PART: return { ...state, parts: { ...state.parts, sync: { ...state.parts.sync, isSyncing: true } } };
                default: return state;
            };
        case END_SYNC:
            debug && console.log(`end syncing ${action.payloadType}`)
            let lastSyncDate = null
            const error = action.payload
            debug && console.log('setting lastSyncDate')
            if (error === null) { lastSyncDate = new Date() }

            switch (action.payloadType) {

                //**LSMTypeInCode** */
                case PERSON:

                    debug && console.log(`changing persons redux state: isSyncing: false , error: ${error}, ${lastSyncDate}`)


                    return {
                        ...state, persons: {
                            ...state.persons, sync: {
                                ...state.persons.sync, isSyncing: false, error: error, lastSyncDate: lastSyncDate || state.persons.sync.lastSyncDate
                            }
                        }
                    };
                case SCRIPT_ITEM: return {
                    ...state, scriptItems: {
                        ...state.scriptItems, sync: {
                            ...state.scriptItems.sync, isSyncing: false, error: error, lastSyncDate: lastSyncDate || state.scriptItems.sync.lastSyncDate
                        }
                    }
                };
                case PART: return {
                    ...state, parts: {
                        ...state.parts, sync: {
                            ...state.parts.sync, isSyncing: false, error: error, lastSyncDate: lastSyncDate || state.parts.sync.lastSyncDate
                        }
                    }
                }

                default: return state;
            }

        case CLEAR_IMPORT_UPDATES:

            return {
                ...state,
                scriptItems: { ...state.scriptItems, history: state.scriptItems.history.filter((item) => item.parentId !== IMPORT_GUID) }
            }
        case CLEAR_LOCAL_SERVER_STATE:
            return {
                ...defaultState,
            }
        default:
            return state;
    }
}