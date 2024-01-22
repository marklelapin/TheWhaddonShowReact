import React from 'react';
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import axios from 'axios';
import config from '../../../config';
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

import { prepareUpdate } from '../../../dataAccess/localServerUtils'
import '../../../index.css'

import { addUpdates } from '../../../actions/localServer';
import { PERSON } from '../../../dataAccess/localServerModels';
import { log, USERS as logType } from '../../../dataAccess/logging'
export const headers = 'headers'
export const row = 'row'
export const modal = 'modal'


function User(props) {


    const debug = true;

    const { user: storedUser = {}, type, closeModal, openModal = false, onCancelNewUser } = props //type = modal, headers, row.

    log(debug, 'User props', props)
    log(debug, 'User storedUser', storedUser)

    //Set state for internal component.
    //This user state is used to track changes to the user and is not synced with the redux store until dispatch.
    const [user, setUser] = useState({});
    const [userChanged, setUserChanged] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        setUser(storedUser)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (user === storedUser) {
            setUserChanged(false)
        } else {
            setUserChanged(true)
        }
    }, [user]) //eslint-disable-line react-hooks/exhaustive-deps             


    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //Event Handlers

    const handleClickUpdate = async () => {

        const userUpdate = (user.isActive === false) ? {...user,msalLink: null } : user
        const preparedUpdate = prepareUpdate(userUpdate)
        dispatch(addUpdates(preparedUpdate, PERSON))  //saves the user to the redux store where it will be synced separately.
        setUserChanged(false)

        const justMadeActive = (user.isActive === true && storedUser.isActive === false)  
        if (justMadeActive && user.email) {
            try {
                const response = await sendLoginLink(user)
                if (response.status === 200) {
                    alert('Login link sent to ' + user.email)
                } else {
                    alert('Failed to send login link to ' + user.email + '. See console for more information.')
                }
            } catch (error) {
                console.error("Error sending login link: " + error.message)
            }
            
        }
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

    const handleChange = (type, value) => {
        switch (type) {
            case 'avatar': setUser({ ...user, pictureRef: value });
                break;
            case 'name': handleNameChange(value)
                break;
            case 'email': setUser({ ...user, email: value })
                break;
            case 'isActor': setUser({ ...user, isActor: value })
                break;
            case 'isSinger': setUser({ ...user, isSinger: value })
                break;
            case 'isWriter': setUser({ ...user, isWriter: value })
                break;
            case 'isBand': setUser({ ...user, isBand: value })
                break;
            case 'isTechnical': setUser({ ...user, isTechnical: value })
                break;
            case 'isAdmin': setUser({ ...user, isAdmin: value })
                break;
            case 'isActive': setUser({ ...user, isActive: value })
                break;
            case 'addTag': setUser({ ...user, tags: [...user.tags, value] })
                break;
            case 'removeTag': setUser({ ...user, tags: user.tags.filter((tagOption) => tagOption !== value) })
                break;

            default:
                break;
        }
    }

    const handleNameChange = (value) => {

        let firstName = null
        let lastName = null

        const originalText = value

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


    //Sections...
    const personalDetails = (type) => {
        return (

            <PersonalDetails type={type} person={user}
                onChange={(type, value) => handleChange(type, value)}
            />
        )
    }
    const roles = (type, show = false) => {
        return (
            <Roles type={type} person={user} strapColor="primary" className={(show) ? '' : 'd-none d-lg-table-cell'}
                onChange={(type, value) => handleChange(type, value)}
            />
        )
    }
    const tags = (type, show = false) => {
        return (
            <Tags type={type} user={user} tagOptions={tagOptions} className={(show) ? '' : 'd-none d-lg-table-cell'}
                onChange={(type, value) => handleChange(type, value)}
            />
        )

    }
    const update = (type, show = false) => {
        return (
            <Update type={type}
                user={user}
                userChanged={userChanged}
                onClickCancel={handleClickCancel}
                onClickUpdate={handleClickUpdate}
                isNew={user.newUser === true}
                className={(show) ? '' : 'd-none d-lg-table-cell'}
                onChange={(type, value) => handleChange(type, value)}
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
                    <tr id={user.id} key={user.id}>
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



const sendLoginLink = async (person) => {

    const firstName = person.firstName
    const email = person.email
    const id = person.id
    const appUrl = config.baseURLApp

    const data = { firstName, email, id,appUrl }
    
    const url = `email/loginlink`

    try {

        const response = await axios.post(url, data);

        log(logType, 'post email/loginlink response: ', { dataSent: data, status: response.status })

        return (response)
    }
    catch (error) {
        console.error("Error posting loginlink: " + error.message)
    }
}