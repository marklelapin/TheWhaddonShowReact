

export const saveState = (state) => {
    const serializedState = JSON.stringify(state);
    saveStateToIndexedDB(serializedState)
}

export const loadState = () => {
    const serializedState = retrieveStateFromIndexedDB()
    const state = JSON.parse(serializedState)
    return state;
}

export const clearState = () => {
    const dbRequest = indexedDB.open('reduxDB', 1);
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reduxState'], 'readwrite');
        const objectStore = transaction.objectStore('reduxState');
        // Step 1: Use the delete method to remove the entry with key 1
        objectStore.delete(1);
    };
}

// Retrieve Redux State from IndexedDB
const retrieveStateFromIndexedDB = () => {

    const db = openOrCreateReduxDB()
    const transaction = db.transaction(['reduxState'], 'readonly');
    const objectStore = transaction.objectStore('reduxState');

    const request = objectStore.get(1);
    request.onsuccess = (event) => {
        // Deserialize and dispatch the Redux state
        const serializedState = event.target.result.state;
        return serializedState;
    };

};


// Save Redux State to IndexedDB
const saveStateToIndexedDB = (serializedState) => {
    const db = openOrCreateReduxDB()
    const transaction = db.transaction(['reduxState'], 'readwrite');
    const objectStore = transaction.objectStore('reduxState');

    //Store the Redux state        
    objectStore.put({ id: 1, state: serializedState });
};

const openOrCreateReduxDB = () => {
    const dbRequest = indexedDB.open('reduxDB', 1);
    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('reduxState')) {
            db.createObjectStore('reduxState', { keyPath: 'id' });
        }
    };
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        return db;
    }
    dbRequest.onerror = (event) => {
        throw new Error('Failed to open or create IndexedDB');
    };
}
