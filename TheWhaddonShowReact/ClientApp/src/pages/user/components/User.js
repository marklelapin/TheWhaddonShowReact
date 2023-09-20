import React from 'react';
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import PersonalDetails from './PersonalDetails';
import Roles from './Roles';
import TagsInput from 'components/Forms/TagsInput'
import AvatarForm from './AvatarForm';
import s from '../Users.module.scss';
import CheckBox from 'components/Forms/CheckBox';
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


    //handle internal and child component clicks etc to update internal state.

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
        console.log('checked'+ event.target.checked)
        setUser({ ...user, isBand: event.target.checked })
    }

    const handleIsTechnicalChange = (event) => {
        setUser({ ...user, isTechnical: event.target.checked })
    }

    const handleIsAdminChange = (event) => {
        setUser({ ...user, isAdmin: event.target.checked })
    }

    const toggleActive = (event) => {
        console.log('user' + user.isActive)
        console.log('checked' + event.target.checked)
        console.log(user.pictureRef)
        setUser({ ...user, isActive: !user.isActive })
    }


    const handleAddTag = (tagOption) => {
        setUser({ ...user, tags: [...user.tags, tagOption] })
    }

    const handleRemoveTag = (event) => {
        setUser({ ...user, tags: user.tags.filter((tagOption) => tagOption !== event.target.textContent) })
    }


    //Functionality for both table and modal.

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
    const tags = (type, show) => {

        const headers = () => {
            return (<th className={(show) ? '' : 'd-none d-lg-table-cell'}>Tags</th>)
        }

        const row = () => {
            return (

                <td className={(show) ? '' : 'd-none d-lg-table-cell'}>
                    <TagsInput tags={user.tags} strapColor="primary" tagOptions={tagOptions}
                        onClickAdd={handleAddTag}
                        onClickRemove={handleRemoveTag} />
                </td>
            )


        }

        if (type === "headers") return headers();

        if (type === "row") return row();

        if (type === "table") return (
            <table>
                <thead>
                    <tr>
                        {headers()}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {row()}
                    </tr>

                </tbody>
            </table>

        )
    }
    const update = (type, show = false) => {

        const button = saveButtonConfig()

        const headers = () => {
            return (<th className={(show) ? '' : 'd-none d-lg-table-cell'}>Active</th>)
        }

        const row = () => {

            return (
                <td className={(show) ? '' : 'd-none d-lg-table-cell'}>
                    < div className="user-update">

                        <CheckBox id="isActive" strapColor="primary" checked={user.isActive} onChange={toggleActive} />

                        <Button id="save" type="submit" color={button.color} size="xs" className={(button.disable) ? 'disabled' : ''}>{button.text}</Button>

                    </div >
                </td>
            )

        }

        if (type === "headers") return headers();
        if (type === "row") return row();
        if (type === "table") {

            return (
                <table>
                    <thead>
                        <tr>
                            {headers()}
                        </tr>

                    </thead>
                    <tbody>
                        <tr>
                            {row()}
                        </tr>

                    </tbody>
                </table>
            )
        }


    }


    return (
        <>
            <div id="user-modal" className="draft-border">
                {personalDetails('table')}
                {roles('table', true)}
                {tags('table', true)}
                {update('table', true)}
            </div>



            <br />
            <br />
            <br />
            <br />
            <br />





            <div className="table-responsive" >
                <Table className="table-hover">
                    <thead>
                        <tr className="open-modal-when-small">
                            {personalDetails('headers')}
                            {roles('headers')}
                            {tags('headers')}
                            {update('headers')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="open-modal-when-small">
                            {personalDetails('row')}
                            {roles('row')}
                            {tags('row')}
                            {update('row')}
                        </tr>
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
                    
            <h5>Avatar</h5><p>user.avatar</p>
            <h5>firstname</h5><p>{user.firstName}</p>
            <h5>lastname</h5><p>{user.lastName}</p>
            <h5>email</h5><p>{user.email}</p>
            <h5>isActor</h5><p>{user.isActor.toString()}</p>
            <h5>isSinger</h5><p>{user.isSinger.toString()}</p>
            <h5>isWriter</h5><p>{user.isWriter.toString()}</p>
            <h5>isBand</h5><p>{user.isBand.toString()}</p>
            <h5>isTechnical</h5><p>{user.isTechnical.toString()}</p>
            <h5>isAdmin</h5><p>{user.isAdmin.toString()}</p>
            <h5>tags</h5><p>{user.tags.toString()}</p>
            <h5>isActive</h5><p>{user.isActive.toString()}</p> 
            <h5>PictureRef</h5><p>{user.pictureRef}</p>




        </>


    )

}

export default User;