import React from 'react';
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import PersonalDetails from './PersonalDetails';
import Roles from './Roles';
import TagsInput from 'components/Forms/TagsInput'
import Update from './Update';
import Tags from './Tags';

import {
    Button,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';
import { getLatest } from 'dataAccess/localServerUtils'
import 'index.css'
import isScreen from 'core/screenHelper';

function User(props) {

    const { id, type, onClose } = props

    //Set state for internal component.
    //This is the default state for a new user setup.
    const [user, setUser] = useState({
        id: 'test',
        firstName: null,
        lastName: null,
        email: null,
        isActor: true,
        isSinger: false,
        isWriter: false,
        isBand: true,
        isTechnical: false,
        isAdmin: false,
        tags: [],
        isActive: true,
        pictureRef: null,
        role: 'admin'
    })
    const [userChanged, setUserChanged] = useState(false)

    const [modalOpen, setModalOpen] = useState(false)

    //useHooks..

    //get the user from the Redux store.
    const userHistory = useSelector(state => state.localServer.persons.history.find(person => person.id === id)) ?? []

    const userPrev = getLatest(userHistory)

    const dispatch = useDispatch();

    useEffect(() => {

        if (user == userPrev) {
            setUserChanged(false)
        } else {
            setUserChanged(true)
        }

    }, [user, userPrev])

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
            switchRowBehaviour(true)
        } else {
            switchRowBehaviour(false)
        }
    }


    const switchRowBehaviour = (useModal) => {

        const rows = document.querySelectorAll('.open-modal-when-small');
        console.log(`${rows.length} rows found`)

        rows.forEach(row => {
            if (useModal) {
                console.log('add open modal event listener')
                row.addEventListener('click', openModal);
            }
            else {
                console.log('remove open modal event listener')
                row.removeEventListener('click', openModal);
                //row.addEventListener('click', toggleEditing);
            }
        });
    }

    const openModal = (event) => {

        console.log('openModal event fired')
        event.preventDefault();
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
    }
    //const saveChanges = () => {
    //    dispatch(localServerUpdate(user))
    //}


    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //Event Handlers

    const handleNameChange = (event) => {

        const fullName = event.target.value

        const cleanedName = fullName.replace(/\s+/g, ' ').trim() //remove multiple spaces and trim

        const nameParts = cleanedName.split(' ')

        setUser({ ...user, firstName: nameParts[0], lastName: nameParts[1] })
    }

    const handleEmailChange = (event) => {
        setUser({ ...user, email: event.target.value })
    }

    const handleAvatarChange = (pictureRef) => {
        console.log('handle Avatar Change:' + pictureRef)
        setUser({ ...user, pictureRef: pictureRef })
    }

    const handleIsActorChange = (event) => {

        setUser({ ...user, isActor: event.target.checked })
    }

    const handleIsSingerChange = (event) => {
        setUser({ ...user, isSinger: event.target.checked })
    }

    const handleIsWriterChange = (event) => {
        setUser({ ...user, isWriter: event.target.checked })
    }

    const handleIsBandChange = (event) => {
        console.log('handleIsBandChange')
        console.log('user' + user.isBand)
        console.log('checked' + event.target.checked)
        setUser({ ...user, isBand: event.target.checked })
    }

    const handleIsTechnicalChange = (event) => {
        setUser({ ...user, isTechnical: event.target.checked })
    }

    const handleIsAdminChange = (event) => {
        setUser({ ...user, isAdmin: event.target.checked })
    }

    const handleIsActiveChange = (event) => {
        console.log('user' + user.isActive)
        console.log('checked' + event.target.checked)
        console.log(user.pictureRef)
        setUser({ ...user, isActive: event.target.checked })
    }


    const handleAddTag = (tagOption) => {
        setUser({ ...user, tags: [...user.tags, tagOption] })
    }

    const handleRemoveTag = (event) => {
        setUser({ ...user, tags: user.tags.filter((tagOption) => tagOption !== event.target.textContent) })
    }



    //Sections...
    const personalDetails = (type) => {
        return (

            <PersonalDetails type={type} person={user}
                onNameChange={handleNameChange}
                onEmailChange={handleEmailChange}
                onAvatarChange={handleAvatarChange}
            />
        )
    }
    const roles = (type, show = false) => {
        return (
            <Roles type={type} person={user} strapColor="primary" className={(show) ? '' : 'd-none d-lg-table-cell'}
                onIsActorChange={handleIsActorChange}
                onIsSingerChange={handleIsSingerChange}
                onIsWriterChange={handleIsWriterChange}
                onIsBandChange={handleIsBandChange}
                onIsTechnicalChange={handleIsTechnicalChange}
                onIsAdminChange={handleIsAdminChange}
            />
        )
    }
    const tags = (type, show = false) => {
        return (
            <Tags type={type} user={user} tagOptions={tagOptions} className={(show) ? '' : 'd-none d-lg-table-cell'}
                onClickAdd={handleAddTag}
                onClickRemove={handleRemoveTag}
            />
        )

    }
    const update = (type, show = false) => {
        return (
            <Update type={type} user={user} userChanged={userChanged} className={(show) ? '' : 'd-none d-lg-table-cell'}
                onChange={handleIsActiveChange}
            />
        )
    }



    //Split out of Rows and Headers to allow for different layouts.

    const tableHeaders = () => {
        return (
            <tr className="open-modal-when-small">
                {personalDetails('headers')}
                {roles('headers')}
                {tags('headers')}
                {update('headers')}
            </tr>


        )


    }

    const tableRow = () => {
        return (
                        <tr className="open-modal-when-small">
                            {personalDetails('row')}
                            {roles('row')}
                            {tags('row')}
                            {update('row')}
                        </tr>
     
        )
    }


   

    const modalLayout = () => {
        return (
            <div id="user-modal" className="draft-border">
                {personalDetails('table')}
                {roles('table', true)}
                {tags('table', true)}
                {update('table', true)}
            </div>
        )

    }


    return (
        <>

        
            <div className="table-responsive" >
                <Table className="table-hover">
                    <thead>
                        {tableHeaders() }
                    </thead>
                    <tbody>
                        {tableRow() }
                    </tbody>
                </Table>
            </div>

            


            <Modal isOpen={modalOpen} toggle={closeModal}>
                <ModalHeader toggle={closeModal}>Edit User</ModalHeader>
                <ModalBody className="bg-white">
                    <div id="user-modal" className="draft-border">
                        {personalDetails('table')}
                        {roles('table', true)}
                        {tags('table', true)}

                    </div>
                </ModalBody>
                <ModalFooter>
                    {update('table', true)}
                </ModalFooter>
            </Modal>
        </>


    )

}

export default User;