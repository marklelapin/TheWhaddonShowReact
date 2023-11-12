export const saveState = (state) => {
    try {
        //properties identified separately are exlcuded from ...stateToSaveToLocalStorage
        const { localServer,layout } = state ;

        const stateToPersist = {localServer,layout} 

        const serializedState = JSON.stringify(stateToPersist);

        localStorage.setItem('state', serializedState);
    }
    catch (err) {
        console.log(err);
    }
}

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');      

        if (serializedState === null) return undefined;

        return JSON.parse(serializedState);
    }
    catch (err) {
        console.log('Failed to get state from local Storage: ' +err);
        return undefined;
    }
}