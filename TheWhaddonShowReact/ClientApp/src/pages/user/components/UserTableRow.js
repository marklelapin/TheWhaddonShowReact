import React from 'react';
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import PeronalDetailsForm from './PersonalDetailsForm';
import RolesForm from './RolesForm';
import TagsInput from 'components/Forms/TagsInput'
import AvatarForm from './AvatarForm';
import s from '../Users.module.scss';
import PersonalDetailsForm from './PersonalDetailsForm';
import CheckBox from 'components/Forms/CheckBox';
import { Button } from 'reactstrap';
import { getLatest } from 'dataAccess/localServerUtils'
import 'index.css'

function UserTableRow(props) {

    const { id, type, onClose } = props

    //Set state for internal component.
    //This is the default state for a new user setup.
    const [user, setUser] = useState({
        id: null,
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
        isActive: true
    })
    const [userChanged, setUserChanged] = useState(false)

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

    }, [user,userPrev])



    //const saveChanges = () => {
    //    dispatch(localServerUpdate(user))
    //}


    //General Code...



    //const fakeUser = {
    //    firstName: "John",
    //    lastName: "Smith",
    //    email: "john.smith@cloudcuckooland.com",
    //    isActor: true,
    //    isSinger: true,
    //    isTechnical: true,
    //    tags: ['male', 'kid', 'teacher'],
    //    isActive: true
    //}

    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //handle internal and child component clicks etc to update internal state.

    const handleFirstNameChange = (event) => {
        setUser({ ...user, firstName: event.target.value })
    }

    const handleLastNameChange = (event) => {
        setUser({ ...user, lastName: event.target.value })
    }

    const handleEmailChange = (event) => {
        setUser({ ...user, email: event.target.value })
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
        setUser({ ...user, isBand: event.target.checked })
    }

    const handleIsTechnicalChange = (event) => {
        setUser({ ...user, isTechnical: event.target.checked })
    }

    const handleIsAdminChange = (event) => {
        setUser({ ...user, isAdmin: event.target.checked })
    }

    const toggleActive = (event) => {
        setUser({ ...user, isActive: !user.isActive })
    }


   const handleAddTag=(tagOption)=>{
      console.log(tagOption)
        setUser({ ...user, tags: [...user.tags, tagOption] })
    }

    const handleRemoveTag = (event) => {

       setUser({ ...user, tags: user.tags.filter((tagOption) => tagOption !== event.target.textContent) })

    }



    const saveButtonConfig = () => {

        if (!userChanged) {
            return {
                disabled: true,
                text: 'No changes',
                color: 'tertiary'
            }
        }
        if (user.id === null) {
            return {
                disabled: false,
                text: 'Add',
                color: 'danger'
            }
        }

        return {
            disabled: false,
            text: 'Update',
            color: 'danger'
        }
    }

    const personalDetailsSection = () => {
        return (
            <PersonalDetailsForm person={user}
                onFirstNameChange={handleFirstNameChange}
                onLastNameChange={handleLastNameChange}
                onEmailChange={handleEmailChange}
            />
        )
    }

    const tagsSection = () => {

        return (
            <TagsInput tags={user.tags} strapColor="primary" tagOptions={tagOptions}
                onClickAdd={handleAddTag}
                onClickRemove={handleRemoveTag} />
        )
    }

    const rolesSection = () => {
        return (
            <RolesForm person={user} strapColor="primary"
                onIsActorChange={handleIsActorChange}
                onIsSingerChange={handleIsSingerChange}
                onIsWriterChange={handleIsWriterChange}
                onIsBandChange={handleIsBandChange}
                onIsTechnicalChange={handleIsTechnicalChange}
                onIsAdminChange={handleIsAdminChange}
            />
        )
    }

    const updateSection = () => {

        const button = saveButtonConfig()

        return (
            < div >
                <CheckBox id="isActive" strapColor="primary" label="Active" checked={user.isActive} onChange={toggleActive} />

                <Button id="save" type="submit" color={button.color} className={(button.disable) ? 'disabled' : ''}>{button.text}</Button>
                
            </div >
        )

    }
    //if (type=modal o type = table row)

    return (
        <>
            <div className="container-fluid draft-border" >
                {personalDetailsSection()}

                {tagsSection()}

                {rolesSection()}

                {updateSection() }
                
            </div>


            <h5>FirstName</h5><p>{user.firstName}</p>
            <h5>LastName</h5><p>{user.lastName}</p>
            <h5>Email</h5><p>{user.email}</p>
            <h5>IsActor</h5><p>{user.isActor.toString()}</p>
            <h5>IsSinger</h5><p>{user.isSinger.toString()}</p>
            <h5>IsWriter</h5><p>{user.isWriter.toString()}</p>
            <h5>IsBand</h5><p>{user.isBand.toString()}</p>
            <h5>IsTechnical</h5><p>{user.isTechnical.toString()}</p>
            <h5>IsAdmin</h5><p>{user.isAdmin.toString()}</p>
            <h5>Tags</h5><p>{user.tags.toString()}</p>
            <h5>IsActive</h5><p>{user.isActive.toString()}</p>
            <h5>Avatar</h5><p>{user.avatar}</p>


        </>


    )

}

export default UserTableRow;