
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSync } from '../dataAccess/localServerUtils';
import { sync } from '../actions/localServer';
import { PERSON, SCRIPT_ITEM, PART } from '../dataAccess/localServerModels';
import { log, LOCAL_SERVER_SYNCING as logType } from '../dataAccess/logging';

export function LocalServerSyncing() {

    const dispatch = useDispatch();

    const pauseSync = useSelector(state => state.localServer.sync.pauseSync);
    log(logType, 'pauseSync:', pauseSync)


    //this bit just determines if syncing is paused
    const syncWithServer = (pauseSync) => {
        log(logType, 'syncWithServer pauseSync:', pauseSync)
        if (!pauseSync) {
            dispatch(sync(SCRIPT_ITEM))
            dispatch(sync(PART))
            dispatch(sync(PERSON))
        }

    }

    //this is where the actual sync process is run
    useSync();


    //A sync is fired every 10 second unless pauseSync changes
    useEffect(() => {

        syncWithServer(pauseSync);

        const intervalId = setInterval(() => {
            syncWithServer(pauseSync);
        }, 10000);

        return () => {
            clearInterval(intervalId)
        }
    }, [pauseSync]) // eslint-disable-line react-hooks/exhaustive-deps



}

export default LocalServerSyncing;


