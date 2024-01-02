import {log, INDEXED_DB as logType} from '../logging.js'

export const saveState = async (state) => {
    log(logType,'saveState')
    const serializedState = JSON.stringify(state);
    await saveStateToIndexedDB(serializedState)
}

export const loadState = async () => {
log(logType,'loadState')
    const serializedState = await retrieveStateFromIndexedDB()
    const state = JSON.parse(serializedState)
    return state;
}

export const clearState = async () => {
log(logType,'clearState')
    const dbRequest = await indexedDB.open('reduxDB', 1);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reduxState'], 'readwrite');
        const objectStore = transaction.objectStore('reduxState');
        // Step 1: Use the delete method to remove the entry with key 1
        objectStore.delete(1);
    };
}

// Retrieve Redux State from IndexedDB
const retrieveStateFromIndexedDB = async () => {
    log(logType,'retrieveStateFromIndexedDB')
    const db = await openOrCreateReduxDB()
    const transaction = db.transaction(['reduxState'], 'readonly');
    const objectStore = transaction.objectStore('reduxState');

    return new Promise((resolve, reject) => {
        const request = objectStore.get(1);
        request.onsuccess = (event) => {
            // Deserialize and resolve with the Redux state
            const serializedState = event.target.result.state;
            resolve(serializedState);
        };

        request.onerror = (event) => {
            reject(new Error('Error retrieving Redux state from IndexedDB'));
        };
    });

};


// Save Redux State to IndexedDB
const saveStateToIndexedDB = async (serializedState) => {
    log(logType,'saveStateToIndexedDB')
    const db = await openOrCreateReduxDB()
    log(logType, 'objectStoreNames:', db.objectStoreNames)
    const transaction = db.transaction(['reduxState'], 'readwrite');
    const objectStore = transaction.objectStore('reduxState');

    //Store the Redux state        
    objectStore.put({ id: 1, state: serializedState });
};

const openOrCreateReduxDB = async () => {
    log(logType, 'openOrCreateReduxDB')
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('reduxDB', 1);

        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('reduxState')) {
                db.createObjectStore('reduxState', { keyPath: 'id' });
            }
        };
        
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        dbRequest.onerror = (event) => {
            reject(new Error('Failed to open or create IndexedDB'));
        };
    });

}
