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
    const personsSync = useSelector((state) => state.localServer.persons.sync)
    const persons = useSelector((state) => getLatest(state.localServer.persons.history).map(person => ({id: person.id, isActive: person.isActive, isSample: person.isSample, firstName: person.firstName, lastName: person.lastName })) || [])

    

    useEffect(() => {
        setLoadingError();
    }, [])

    useEffect(() => {
        setLoadingError();
    }, [persons]
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



    const personIds = () => {

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

        return sortedPersons.map((person) => person.id)

    }


    return (

        <>
            <Widget title="Users" collapse close>



                <DataLoading isLoading={isLoading && (personIds().length === 0)} isError={error !== null && (personIds().length === 0)} loadingText="Loading..." errorText={`Error loading data: ${error}`}>
                    <Button color="primary" onClick={addNewUser}>Add New User</Button>
                    
                    <div className="table-responsive" >
                        <Table id="user-table" className="table-hover">
                            <thead>
                                <User type={headers} />
                            </thead>
                            <tbody>
                                {personIds().map((id) => {

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
