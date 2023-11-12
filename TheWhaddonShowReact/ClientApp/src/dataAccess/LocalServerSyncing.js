import React from 'react';
import { useEffect } from 'react';
import {  useDispatch } from 'react-redux';
import { useSync } from '../dataAccess/localServerUtils'; 
import {sync } from '../actions/localServer';
import {PERSON,SCRIPT_ITEM,PART } from '../dataAccess/localServerModels';

export  function LocalServerSyncing() {

    const dispatch = useDispatch();

    useSync();

    useEffect(() => {
        syncWithServer()

        const intervalId = setInterval(syncWithServer, 1000 * 10) //every minute

        return () => {
            clearInterval(intervalId)
        }

    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const syncWithServer = () => {

        dispatch(sync(PERSON))
        //dispatch(sync(SCRIPT_ITEM))
        //dispatch(sync(PART))
    }


    return (null)
}

export default LocalServerSyncing;


