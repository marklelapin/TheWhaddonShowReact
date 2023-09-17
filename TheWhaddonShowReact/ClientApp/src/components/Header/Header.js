import React from 'react';
import { useState, } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { withRouter } from 'react-router';
import {
    Navbar,
    Nav
} from 'reactstrap';

import { NavbarTypes } from '../../reducers/layout';

import {  openSidebar, closeSidebar } from '../../actions/navigation';


import SettingsDropdown from './components/SettingsDropdown';
import SidebarToggle from './components/SidebarToggle';
import SyncDropdown from './components/SyncDropdown';
import AccountDropdown from './components/AccountDropdown';

import s from './Header.module.scss'; // eslint-disable-line css-modules/no-unused-class


function Header(props) {

    //State relating to internal component
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [syncMenuOpen, setSyncMenuOpen] = useState(false);
    const [syncTabSelected, setSyncTabSelected] = useState(1);

    //State relating to redux store
    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const navbarType = useSelector(store => store.layout.navbarType);
    const navbarColor = useSelector(store => store.layout.navbarColor);
    const openUsersList = useSelector(store => store.chat.openUsersList);
    const currentUser = useSelector(store => store.auth.currentUser);

    const dispatch = useDispatch();






    const toggleSidebar = () => {
        if (sidebarOpened) {
            dispatch(closeSidebar())
        } else {
            dispatch(openSidebar())
            //TODO expand all submenus
        }
    }

    const toggleSettingsMenu = () => {
        setSettingsMenuOpen(!settingsMenuOpen);
    }

    const toggleSyncMenu = () => {
        setSyncMenuOpen(!syncMenuOpen);
    }

    const toggleAccountMenu = () => {
        setAccountMenuOpen(!accountMenuOpen);
    }

    const user = currentUser;

    return (
        <Navbar className={`${s.root} d-print-none ${navbarType === NavbarTypes.FLOATING ? s.navbarFloatingType : ''}`} style={{ zIndex: !openUsersList ? 100 : 0 }}>
            <Nav className="justify-content-start align-middle">
                <SidebarToggle />
            </Nav>

            <Nav className="justify-content-end align-middle">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SyncDropdown menuOpen={syncMenuOpen} onClick={toggleSyncMenu}></SyncDropdown>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccountDropdown user={user} menuOpen={accountMenuOpen} onClick={toggleAccountMenu} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsDropdown menuOpen={settingsMenuOpen} onClick={toggleSettingsMenu} />
                </div>
            </Nav>

        </Navbar >
    );

}

export default withRouter(Header);

