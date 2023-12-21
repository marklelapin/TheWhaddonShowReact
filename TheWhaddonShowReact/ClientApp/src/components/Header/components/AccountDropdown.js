import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import Avatar from '../../../components/Avatar/Avatar.js';
import UserDefault from '../../../images/sidebar/basil/UserDefault';

import { impersonateUser, stopImpersonating, login, logout } from '../../../actions/user';
import { updatePersonSelectorConfig } from '../../../actions/scriptEditor';
import { addUpdates } from '../../../actions/localServer';
import { getLatest, prepareUpdate } from '../../../dataAccess/localServerUtils';
import PowerButton from '../../../images/sidebar/basil/PowerButton';
import { Icon } from '../../../components/Icons/Icons';
import { PERSON } from '../../../dataAccess/localServerModels';
import PersonSelector from '../../../pages/scriptEditor/components/PersonSelector';
import { log, ACCOUNT_DROPDOWN as logType } from '../../../logging';

function AccountDropdown(props) {

    const dispatch = useDispatch();

    const { menuOpen, onClick } = props;

    const authenticatedUser = useSelector((state) => state.user.authenticatedUser);
    const currentUser = useSelector((state) => state.user.currentUser);

    const storedPersons = useSelector((state) => state.localServer.persons.history)

    const persons = getLatest(storedPersons)

    log(logType, 'props', { authenticatedUser, currentUser })

    const doLogin = () => {

        const mark = persons.find(person => person.id === 'af60b927-7f73-4dfd-8343-206c1b30a03b')

        log(logType, 'login', { mark })

        dispatch(login(mark))
    }

    const doLogout = () => {
        dispatch(logout())
    }

    const handlePersonSelect = (person) => {
        dispatch(impersonateUser(person))
    }

    const handleAvatarToggle = (e) => {
        e.preventDefault();
        onClick()
    }

    const handleAvatarChange = (pictureRef) => {

        log(logType, 'handleAvatarChange', { pictureRef })

        const preparedUpdate = prepareUpdate({ ...authenticatedUser, pictureRef: pictureRef })

        dispatch(addUpdates(preparedUpdate, PERSON))

    }

    const handleStopImpersonating = (e) => {
        e.preventDefault();
        dispatch(stopImpersonating())
    }

    const handlePersonSelectorToggle = (e) => {
        e.stopPropagation();
        dispatch(updatePersonSelectorConfig({}))
    }

    return (
        <>
            {!authenticatedUser && <Button onClick={doLogin} color="primary" style={{ marginRight: '10px' }}>Login</Button>}
            {authenticatedUser &&
                <>
                    <Dropdown nav isOpen={menuOpen} toggle={onClick} id="account-dropdown" className={`${s.notificationsMenu}`}>
                        <DropdownToggle nav className={s.headerSvgFlipColor}>
                            <Avatar onClick={handleAvatarToggle} person={authenticatedUser} />
                            {authenticatedUser !== currentUser && <Avatar onClick={handleAvatarToggle} person={currentUser} />}
                        </DropdownToggle>
                        {authenticatedUser &&
                            <DropdownMenu end className={`${s.headerDropdownLinks} super-colors`}>
                                <DropdownItem>
                                    <div className={s['authenticated-user']}>
                                        <div>Current user:</div>
                                        <div >
                                        <Avatar person={authenticatedUser} onChange={(pictureRef) => handleAvatarChange(pictureRef)} />
                                        </div>

                                        <div>{`${authenticatedUser.firstName} ${authenticatedUser.lastName}`}</div>
                                    </div>
                                </DropdownItem>
                                <DropdownItem divider />
                                {authenticatedUser.isAdmin && currentUser.id === authenticatedUser.id &&
                                    <>
                                        <DropdownItem onClick={(e) => handlePersonSelectorToggle(e)} >
                                            <Icon icon="man" /><Icon icon="child" />Impersonate</DropdownItem>
                                        <DropdownItem divider />
                                    </>
                                }
                                {authenticatedUser.isAdmin && currentUser.id !== authenticatedUser.id &&
                                    <>
                                        <DropdownItem >
                                            <div className={s['currently-impersonating']}>
                                                <div>Currently impersonating:</div>
                                                <div className={s['impersonated-person']}>
                                                    <Avatar person={currentUser} />
                                                    <div>{`${currentUser.firstName} ${currentUser.lastName}`}</div>
                                                </div>
                                                <Button onClick={(e) => handleStopImpersonating(e)} color="danger">Stop impersonating</Button>
                                            </div>
                                        </DropdownItem>
                                        <DropdownItem divider />
                                    </>
                                }
                                <DropdownItem onClick={doLogout}><span className={s.headerDropdownIcon}><PowerButton /></span> Log Out</DropdownItem>
                            </DropdownMenu>
                        }
                    </Dropdown >
                    <PersonSelector onSelect={(person) => handlePersonSelect(person)} closeModal={() => dispatch(updatePersonSelectorConfig(null))} />
                </>}

        </>



    )



}

export default AccountDropdown