import React from 'react';
import { useState, useEffect } from 'react'
import { useSelector,useDispatch } from 'react-redux';


import PersonalDetails from './PersonalDetails';
import Roles from './Roles';
import Update from './Update';
import Tags from './Tags';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';

import { getLatest } from 'dataAccess/localServerUtils'
import 'index.css'

import { PersonUpdate } from 'dataAccess/localServerModels';
import { addUpdates } from 'actions/localServer';
import { Person } from 'dataAccess/localServerModels';

export const headers = 'headers'
export const row = 'row'
export const modal = 'modal'


function User(props) {

    //console.log('user component props' + props)

   

    const { type, closeModal, openModal = false, newUser = { id: '' } } = props //type = modal, headers, row.

    const {id = newUser.id} = props

    const storedUser = useSelector((state) => getLatest(state.localServer.persons.history).filter((person) => person.id === id)[0])

    //Set state for internal component.
    //This user state is used to track changes to the user and is not synced with the redux store until dispatch.
    const [user, setUser] = useState(newUser || storedUser || new PersonUpdate());
    const [userChanged, setUserChanged] = useState(false)

    const dispatch = useDispatch()

    //if storedUser changes then update the user state.
    useEffect(() => {
        setUser(storedUser)
        setUserChanged(false)
        console.log('storedUser changed')
    }, [storedUser])

    useEffect(() => {
        if (user == storedUser) {
            setUserChanged(false)
        } else {
            setUserChanged(true)
        }
    }, [user]) //eslint-disable-line react-hooks/exhaustive-deps             


    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //Event Handlers

    const handleNameChange = (event) => {

        const fullName = event.target.value

        const cleanedName = fullName.replace(/\s+/g, ' ').trim() //remove multiple spaces and trim

        const nameParts = cleanedName.split(' ')

        setUser({ ...user, firstName: nameParts[0] || '', lastName: nameParts[1] || '' })

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
        console.log(user)
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


    const handleClickUpdate = () => {
        dispatch(addUpdates([user],Person))  //saves the user to the redux store where it will be synced separately.
        setUserChanged(false)
    }

    const handleClickCancel = () => {
        setUser(storedUser)
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
            <Update type={type} user={user} userChanged={userChanged} onClickCancel={handleClickCancel} onClickUpdate={handleClickUpdate} className={(show) ? '' : 'd-none d-lg-table-cell'}
                onChange={handleIsActiveChange}
            />
        )
    }



    //Return split out header and rows and modal to allow for different layouts.

    if (type === headers) {
        return (

            <tr >
                {personalDetails('headers')}
                {roles('headers')}
                {tags('headers')}
                {update('headers')}
            </tr>

        )
    }

    if (type === row) {
        return (
            <>

                {(user &&
                    <tr id={id} key={id}>
                        {personalDetails('row')}
                        {roles('row')}
                        {tags('row')}
                        {update('row')}
                    </tr>)}

                {(openModal &&
                    <Modal isOpen={true} toggle={closeModal}>
                        <ModalHeader toggle={closeModal}>Edit User</ModalHeader>
                        <ModalBody className="bg-white">

                            <div id="user-modal" className="draft-border">
                                {personalDetails('table')}
                                {roles('table', true)}
                                {tags('table', true)}
                                {update('table', true)}
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            {update('table', true)}
                        </ModalFooter>
                    </Modal>)}

            </>
        
        )
    }

    //if (type === modal) {
    //    return (

    //    )
    //}



}

export default User;