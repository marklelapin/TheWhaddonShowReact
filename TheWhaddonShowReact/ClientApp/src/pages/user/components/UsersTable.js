import React from 'react';

//Redux Hooks
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import isScreen from '../../../core/screenHelper';

//Data Access / Local Server Model
import { getLatest } from '../../../dataAccess/localServerUtils';
//Components
import DataLoading from '../../../components/DataLoading/DataLoading';

import { headers, row } from './User';
import { Table, Button } from 'reactstrap';
import User from './User';
import { PersonUpdate } from '../../../dataAccess/localServerModels';
import Widget from '../../../components/Widget';
import { log } from '../../../helper';
//SASS
import s from '../Users.module.scss';



export function UsersTable() {

    const debug = true;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userModalToOpen, setUserModalToOpen] = useState(null);
    const [newUser, setNewUser] = useState(null);

    const [showActive, setShowActive] = useState(null);

    //Access state from redux store
    const personsSync = useSelector((state) => state.localServer.persons.sync);
    const personsHistory = useSelector((state) => state.localServer.persons.history);
    log(debug, 'UsersTable personsHistory', personsHistory)

    const persons = getLatest(personsHistory);

    log(debug, 'UsersTable persons', persons)
   
    useEffect(() => {
        setLoadingError();
    }, [])

    useEffect(() => {
        setLoadingError();
    }, [personsHistory] //es-lint disable-line react-hooks/exhaustive-deps
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

const setLoadingError = () => {
        if (persons.length > 0) {
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
        let userDefault = new PersonUpdate()
        debug && console.log(userDefault)
        userDefault.newUser = true;
        setNewUser(userDefault)
    }





    



    const filteredPersons = () => {

       let filteredPersons = persons.filter((person) => person.isActive === (showActive || person.isActive))
       filteredPersons = filteredPersons.filter((person) => !(person.isSample === true))

       const sortedPersons = filteredPersons.sort((a, b) => {
            const nameA = (a.firstName + a.lastName).toUpperCase(); // ignore upper and lowercase
            const nameB = (b.firstName + b.lastName).toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            } 
            return 1;
        })

        return sortedPersons

    }


    return (

        <>
            <Widget title="Users" collapse close>



                <DataLoading isLoading={isLoading && (filteredPersons().length === 0)} isError={error !== null && (filteredPersons().length === 0)} loadingText="Loading..." errorText={`Error loading data: ${error}`}>
                    <Button color="primary" onClick={addNewUser}>Add New User</Button>
                    
                    <div className="table-responsive" >
                        <Table id="user-table" className="table-hover">
                            <thead>
                                <User type={headers} />
                            </thead>
                            <tbody>
                                {filteredPersons().map((person) => {

                                    return <User user={person} type={row} key={person.id} openModal={(person.id === userModalToOpen)} closeModal={closeModal} />
                                }
                                )}
                                {(newUser !== null) && <User user={newUser} type={row} openModal={true} closeModal={closeModal} onCancelNewUser={closeModal} />}
                            </tbody>
                        </Table>
                    </div>
                </DataLoading>
            </Widget>


        </ >
    );
}



export default UsersTable;
