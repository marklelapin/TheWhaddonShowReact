
import { log, INDEXED_DB as logType } from '../dataAccess/logging.js'

export const NO_INDEXED_DB = 'noIndexDB'

export const saveState = async (state) => {
    try {
        log(logType, 'saveState')
        const serializedState = JSON.stringify(state);
        await saveStateToIndexedDB(serializedState)
    } catch (err) {
        log(logType, 'Error whilst saving state to IndexedDB: ' + err)
    }
}

export const loadState = async () => {
    try {
        /*   await setupPersistentIndexedDB()*/
        log(logType, 'retrievingState')
        const serializedState = await retrieveStateFromIndexedDB()
        if (serializedState === NO_INDEXED_DB) return NO_INDEXED_DB
        log(logType, 'serializingState')
        const state = (serializedState === null) ? null : JSON.parse(serializedState)
        return state;
    } catch (error) {
        log(logType, 'Error whilst loading state from IndexedDB: ' + error);
        return undefined
    }

}

export const clearState = async () => {
    log(logType, 'clearState')
    const dbRequest = await indexedDB.open('reduxDB', 1);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reduxState'], 'readwrite');
        const objectStore = transaction.objectStore('reduxState');
        // Step 1: Use the delete method to remove the entry with key 1
        objectStore.delete(1);
    };
}

//export const setupPersistentIndexedDB = async () => {

//    log(logType, 'setupPersistentIndexedDB', { persistExists: (navigator.storage.persist) ? true : false })

//    if (navigator.storage && navigator.storage.persist) {

//        navigator.storage.persist().then((granted) => {
//            if (granted) {
//                console.log("Storage will persist.");
//            } else {
//                console.log("Storage will not persist.");
//                // alert("Refusing to persist storage means all unsynced changes will be lost on refresh. Please enable storage persistence for an optimal experience, to work offline and to avoid potential lose of data.")  
//            }
//        }).catch((error) => {
//            console.error("Error checking storage persistence:", error);
//            alert("Error checking storage persistence. Please enable storage persistence for an optimal experience, to work offline and to avoid potential lose of data.")
//            throw new Error("Error checking storage persistence:" + error);
//        });
//    } else {
//        console.log("navigator.storage.persist() is not supported in this browser.");
//        // Handle the case where the browser doesn't support the method
//        alert("Because your browser does not support storage persistence , all unsynced changes will be lost on refresh. You will need to upgrade your browser for an optimal experience, to work offline and to avoid potential lose of data.")
//        throw new Error("navigator.storage.persist() is not supported in this browser.");
//    }


//}

// Retrieve Redux State from IndexedDB
const retrieveStateFromIndexedDB = async () => {
    try {
        const db = await openOrCreateReduxDB()
        if (db === NO_INDEXED_DB) return NO_INDEXED_DB
        const transaction = db.transaction(['reduxState'], 'readonly');
        const objectStore = transaction.objectStore('reduxState');

        return new Promise((resolve, reject) => {
            const request = objectStore.get(1);
            request.onsuccess = (event) => {
                // Deserialize and resolve with the Redux state
                const serializedState = event.target.result?.state || null;
                resolve(serializedState);
            };

            request.onerror = (event) => {
                log(logType, 'Error retrieving Redux state from IndexedDB');
                resolve(null)
            };
        });
    } catch (err) {
        log(logType, `Error retrieving Redux state from IndexedDB: ${err}`);
        return null;
    }




};


// Save Redux State to IndexedDB
const saveStateToIndexedDB = async (serializedState) => {
    try {
        const db = await openOrCreateReduxDB()
        const transaction = db.transaction(['reduxState'], 'readwrite');
        const objectStore = transaction.objectStore('reduxState');
        //Store the Redux state        
        objectStore.put({ id: 1, state: serializedState });
        log(logType, 'Saved redux state to indexDB.')

    } catch (err) {
        const deserializedState = JSON.parse(serializedState)
        log(logType, `Error saving Redux state for localCopyId (${deserializedState.localServer.localCopyId}) to indexDb: ${err}`);
    }

};

const openOrCreateReduxDB = async () => {
    log(logType, 'openOrCreateReduxDB')
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('reduxDB', 1);

        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('reduxState')) {
                db.createObjectStore('reduxState', { keyPath: 'id' });
                log(logType, 'indexDB reduxState created')
                resolve(db)
            } else {
                log(logType, 'indexDB reduxState already exists')
                resolve(db)
            }
        };
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            log(logType, 'indexDB reduxState opened')
            resolve(db);

        };
        dbRequest.onerror = (event) => {
            log(logType, 'Failed to open or create IndexedDB.')
            resolve(NO_INDEXED_DB)
        };
    });

}
