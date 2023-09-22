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
import { Table, Button } from 'reactstrap';
import User from './User';
import { PersonUpdate } from 'dataAccess/localServerModels';
import Widget from 'components/Widget';

//SASS
import s from '../Users.module.scss';



export function UsersTable() {

    const debug = true;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userModalToOpen, setUserModalToOpen] = useState(null);
    const [newUser, setNewUser] = useState(null);
    //Access state from redux store
    const personsSync = useSelector((state) => state.localServer.persons.sync)
    const personIds = useSelector((state) => [...new Set(state.localServer.persons.history.map(person => person.id))] || [])



    useEffect(() => {
        setLoadingError();
    }, [])

    useEffect(() => {
        setLoadingError();
    }, [personIds]
    )



    //establish resize event listener to handle screen size changes.
    useEffect(() => {

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => { window.removeEventListener('resize', handleResize); }
    }, []);

    const handleResize = () => {
        if (isScreen('xs') || isScreen('sm') || isScreen('md')) { //thes screen sized should match those in index.css for the .

            switchTableBehaviour(true)
        } else {
            switchTableBehaviour(false)
        }
    }

    const switchTableBehaviour = (useModal) => {
        const table = document.getElementById('user-table')

        if (table && useModal) {
            table.addEventListener('click', openModal);
        }
        else {
            if (table && table.removeEventListener) {
                table.removeEventListener('click', openModal);
            }

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
        setNewUser(null)
    }

    const addNewUser = () => {
        debug && console.log('Adding new user')
        const userDefault = new PersonUpdate()
        debug && console.log(userDefault)
        setNewUser(userDefault)
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



                <DataLoading isLoading={isLoading && (personIds.length === 0)} isError={error !== null && (personIds.length === 0)} loadingText="Loading..." errorText={`Error loading data: ${error}`}>
                    <Button color="primary" onClick={addNewUser}>Add New User</Button>
                    <div className="table-responsive" >
                        <Table id="user-table" className="table-hover">
                            <thead>
                                <User type={headers} />
                            </thead>
                            <tbody>
                                {personIds.map((id) => {

                                    return <User type={row} id={id} key={id} openModal={(id === userModalToOpen)} closeModal={closeModal} />
                                }
                                )}
                                {(newUser !== null) && <User type={row} newUser={newUser} openModal={true} closeModal={closeModal} onCancelNewUser={closeModal} />}
                            </tbody>
                        </Table>
                    </div>
                </DataLoading>
            </Widget>


        </ >
    );
}



export default UsersTable;
