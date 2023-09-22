import React from 'react';
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';


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

import { getLatest, prepareUpdate } from 'dataAccess/localServerUtils'
import 'index.css'

import { addUpdates } from 'actions/localServer';
import { Person, PersonUpdate } from 'dataAccess/localServerModels';

export const headers = 'headers'
export const row = 'row'
export const modal = 'modal'


function User(props) {


    const debug = true;

    const { type, closeModal, openModal = false, newUser = null, onCancelNewUser } = props //type = modal, headers, row.

    let { id } = props

    if (newUser !== null) { id = newUser.id }

    const storedUser = useSelector((state) => getLatest(state.localServer.persons.history).filter((person) => person.id === id)[0])

    //Set state for internal component.
    //This user state is used to track changes to the user and is not synced with the redux store until dispatch.
    const [user, setUser] = useState(newUser || storedUser || new PersonUpdate());
    const [userChanged, setUserChanged] = useState(false)

    const dispatch = useDispatch()

    //if storedUser changes then update the user state.
    //useEffect(() => {

    //    setUser((newUser !== null ? newUser : storedUser))
    //    setUserChanged(false)

    //}, [storedUser])

    useEffect(() => {
        if (user === storedUser) {
            setUserChanged(false)
        } else {
            setUserChanged(true)
        }
    }, [user]) //eslint-disable-line react-hooks/exhaustive-deps             


    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //Event Handlers

    const handleNameChange = (event) => {

        let firstName = null
        let lastName = null

        const originalText = event.target.value

       let text = originalText

        text = text.replace(/^\s+/, '') //remove leading spaces
        text = text.replace(/\s+/g, ' ') //remove multiple spaces

        const spaceArray = text.split(' ')

        firstName = spaceArray[0] || ''

        if (spaceArray.length > 1) {
            lastName = spaceArray[1] 
        }



        setUser({ ...user, firstName: firstName, lastName: lastName })

 }

    const handleEmailChange = (event) => {
        console.log('EMail Change User:')
        console.log({ user })
        console.log('stored user')
        console.log(storedUser)

        setUser({ ...user, email: event.target.value })
    }

    const handleAvatarChange = (pictureRef) => {

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
        console.log('IsActiveChnage user:')
        console.log(user)
        console.log('stored user')
        console.log(storedUser)
        setUser({ ...user, isActive: event.target.checked })
    }


    const handleAddTag = (tagOption) => {
        setUser({ ...user, tags: [...user.tags, tagOption] })
    }

    const handleRemoveTag = (event) => {
        setUser({ ...user, tags: user.tags.filter((tagOption) => tagOption !== event.target.textContent) })
    }


    const handleClickUpdate = () => {

        const userUpdate = prepareUpdate(user)

        dispatch(addUpdates(userUpdate, Person))  //saves the user to the redux store where it will be synced separately.
        setUserChanged(false)
        closeModal()
    }

    const handleClickCancel = () => {
        if (user.newUser === true) {
            onCancelNewUser()
        } else {
            setUser(storedUser)
        }
        closeModal()

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
            <Update type={type} user={user} userChanged={userChanged} onClickCancel={handleClickCancel} onClickUpdate={handleClickUpdate} isNew={newUser!==null} className={(show) ? '' : 'd-none d-lg-table-cell'}
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
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            {update('table', true)}
                        </ModalFooter>
                    </Modal>)}

            </>

        )
    }


}

export default User;