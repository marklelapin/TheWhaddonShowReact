import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

//Components
import {
    Navbar,
    Nav
} from 'reactstrap';

import { Icon } from '../../components/Icons/Icons'

import { NavbarTypes } from '../../reducers/layout';

import SyncDropdown from './components/SyncDropdown';
import AccountDropdown from './components/AccountDropdown';
import SidebarToggle from './components/SidebarToggle';

//css
import s from './Header.module.scss';

 

function Header() {

    const location = useLocation()

    const pathName = location.pathname
    const isMobileDevice = useSelector(store => store.device.isMobileDevice);

    const showHeader = !isMobileDevice || pathName !== '/app/script'

    //State relating to internal component
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [syncMenuOpen, setSyncMenuOpen] = useState(false);


    //State relating to redux store
    const navbarType = useSelector(store => store.layout.navbarType);
    const currentUser = useSelector(store => store.user.currentUser);
 

    const isServiceWorkerActivated = (navigator.serviceWorker?.controller) ? true : false;



    const toggleSyncMenu = () => {
        setSyncMenuOpen(!syncMenuOpen);
    }

    const toggleAccountMenu = () => {
        setAccountMenuOpen(!accountMenuOpen);
    }

    const user = currentUser;

    if (!showHeader) return null;

    return (
        <Navbar className={`${s.root} d-print-none ${navbarType === NavbarTypes.FLOATING ? s.navbarFloatingType : ''}`} style={{ zIndex: 100 }}>
            <Nav className="justify-content-start align-middle">
                <SidebarToggle />
            </Nav>

            <Nav className="justify-content-end align-middle">
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SyncDropdown menuOpen={syncMenuOpen} onClick={toggleSyncMenu}></SyncDropdown>
                </div>
                {isServiceWorkerActivated && <div className={s.offline} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon icon="offline" toolTip="available offline"></Icon>
                </div>
                }
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccountDropdown user={user} menuOpen={accountMenuOpen} onClick={toggleAccountMenu} />
                </div>
            </Nav>

        </Navbar >

    );

}

export default Header;

