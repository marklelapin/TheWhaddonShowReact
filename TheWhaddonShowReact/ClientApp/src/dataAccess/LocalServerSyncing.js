import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSync } from '../dataAccess/localServerUtils';
import { sync } from '../actions/localServer';
import { PERSON, SCRIPT_ITEM, PART } from '../dataAccess/localServerModels';
import { log } from '../helper';

export function LocalServerSyncing() {

    const debug = true;
    const dispatch = useDispatch();

    const pauseSync = useSelector(state => state.localServer.sync.pauseSync);
    log(debug, 'LocalServerSyncing: pauseSync', pauseSync)


    const syncWithServer = (pauseSync) => {
        log(debug, 'LocalServerSyncing: syncWithServer pauseSync', pauseSync)
        if (!pauseSync) {
            dispatch(sync(SCRIPT_ITEM))
            dispatch(sync(PART))
            dispatch(sync(PERSON))
        }

    }

    useSync();

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


