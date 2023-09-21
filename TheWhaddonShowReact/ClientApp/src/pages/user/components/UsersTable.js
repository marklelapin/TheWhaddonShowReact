import React from 'react';
import { push } from 'connected-react-router';

//Redux Hooks
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isScreen from 'core/screenHelper';

//Data Access / Local Server Model
import { getLatest } from 'dataAccess/localServerUtils';
//Components
import DataLoading from 'components/DataLoading/DataLoading';

import { headers, row, modal } from './User';
import { Table } from 'reactstrap';
import User from './User';

import Widget from 'components/Widget';

//SASS
import s from '../Users.module.scss';



export function UsersTable() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userModalToOpen, setUserModalToOpen] = useState(null);
    //Access state from redux store
    const personsSync = useSelector((state) => state.localServer.persons.sync)
    const personIds = useSelector((state) => [...new Set(state.localServer.persons.history.map(person => person.id))] || [] )

    console.log('after useSelecter: ' +personIds.toString())
    
    useEffect(() => {
        setLoadingError();
    }, [])

    useEffect(() => {
        setLoadingError();
    }, [personIds]
    )



    //establish resize event listener to handle screen size changes.
    useEffect(() => {
        console.log('screen event listerner added')
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => { window.removeEventListener('resize', handleResize); }
    }, []);

    const handleResize = () => {
        if (isScreen('xs') || isScreen('sm') || isScreen('md')) { //thes screen sized should match those in index.css for the .
            console.log('useModal set to true')
            switchTableBehaviour(true)
        } else {
            switchTableBehaviour(false)
        }
    }

    const switchTableBehaviour = (useModal) => {
        const table = document.getElementById('user-table')

        if (useModal) {
            table.addEventListener('click', openModal);
        }
        else {
            table.removeEventListener('click', openModal);
        }
    }

    const openModal = (event) => {
        event.preventDefault();

        const row = event.target.closest("tr")

        if (row) {
            const rowId = row.id
            setUserModalToOpen(rowId)
        }
    }

    const closeModal = () => {
        setUserModalToOpen(null);
    }
   


    const setLoadingError = () => {
        if (personIds.length > 0) {
            setIsLoading(false)
            setError(null)
        }
        if (personsSync.isSyncing) {
            setIsLoading(true);
            setError(null);
        }
        else {
            setIsLoading(false);
            setError(personsSync.error);
        }
    }

    
    return (

        <>
            <Widget title="Users" collapse close>
            
                <DataLoading isLoading={isLoading} isError={error !== null} loadingText="Loading..." errorText={`Error loading data: ${error}`}>

                    <div className="table-responsive" >
                        <Table id="user-table" className="table-hover">
                            <thead>
                               <User type={headers} />
                            </thead>
                            <tbody>
                                {personIds.map((id) => {
                                    console.log(id)
                                    return <User type={row} id={id} key={id} openModal={(id === userModalToOpen)} closeModal={closeModal} />
                                }
                                )}
                            </tbody>
                        </Table>
                    </div>
                </DataLoading>
            </Widget>

            
        </ >
    );
}



export default UsersTable;
