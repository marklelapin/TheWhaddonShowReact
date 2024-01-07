import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { withRouter } from 'react-router';

//Azure
//import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
//import { InteractionStatus } from "@azure/msal-browser";
//import { loginRequest, b2cPolicies } from '../authConfig';


//Components
import {
    Navbar,
    Nav
} from 'reactstrap';

import { NavbarTypes } from '../../reducers/layout';

import {  openSidebar, closeSidebar } from '../../actions/navigation';
import isScreen from '../../core/screenHelper';
import { updateScreenSize } from '../../actions/layout';
import SettingsDropdown from './components/SettingsDropdown';
import SidebarToggle from './components/SidebarToggle';
import SyncDropdown from './components/SyncDropdown';
import AccountDropdown from './components/AccountDropdown';

//Utils
import {screenSize } from '../../core/screenHelper';

//css
import s from './Header.module.scss'; // eslint-disable-line css-modules/no-unused-class


function Header(props) {

    //const { instance, inProgress } = useMsal();
    //const activeAccount = (instance) ? instance.getActiveAccount() : null;

    //State relating to internal component
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const [syncMenuOpen, setSyncMenuOpen] = useState(false);
    const [syncTabSelected, setSyncTabSelected] = useState(1);

    //State relating to redux store
    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const navbarType = useSelector(store => store.layout.navbarType);
    const navbarColor = useSelector(store => store.layout.navbarColor);
    const openUsersList = 100 //useSelector(store => store.auth.openUsersList); //TODO add on who's logged in list.

    const currentUser = useSelector(store => store.user.currentUser);
    const storedScreenSize = useSelector(store => store.layout.screenSize);
    const dispatch = useDispatch();
    const hideHeader = useSelector(store => store.layout.hideHeader);

    useEffect(() => {

        const handleResize = () => {
            const newScreenSize = screenSize()
            if (newScreenSize !== storedScreenSize) {
                dispatch(updateScreenSize(s))
            }
        }


        window.addEventListener('resize', handleResize);

        return () => { window.removeEventListener('resize', handleResize); }
    }, []);



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
        <Navbar className={`${s.root} d-print-none ${navbarType === NavbarTypes.FLOATING ? s.navbarFloatingType : ''} ${hideHeader ? 'hide' : ''}`} style={{ zIndex: 100 }}>
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
            </Nav>

        </Navbar >
    );

}

export default withRouter(Header);

