import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSync } from 'dataAccess/localServerUtils'; 
import {sync } from 'actions/localServer';
import {Person, ScriptItem, Part} from 'dataAccess/localServerModels';

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

        dispatch(sync(Person))
        //dispatch(sync(ScriptItem))
        //dispatch(sync(Part))
    }


    return (null)
}

export default LocalServerSyncing;


