import React from 'react';
import { useEffect } from 'react';
import {  useDispatch, useSelector } from 'react-redux';
import { useSync } from '../dataAccess/localServerUtils'; 
import {sync } from '../actions/localServer';
import {PERSON,SCRIPT_ITEM,PART } from '../dataAccess/localServerModels';
import { log } from '../helper';

export function LocalServerSyncing() {

    const dispatch = useDispatch();
    const debug = true;

    useSync();

    useEffect(() => {
        syncWithServer()

        const intervalId = setInterval(syncWithServer, 1000 * 10) //every 10 seconds

        return () => {
            clearInterval(intervalId)
        }

    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const syncWithServer = () => {

        dispatch(sync(PERSON))
        dispatch(sync(SCRIPT_ITEM))
        //dispatch(sync(PART))

    }

}

export default LocalServerSyncing;


