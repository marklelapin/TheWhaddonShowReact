import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class
import Settings from '../../../images/sidebar/basil/Settings';

import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';



import Notifications from '../../../components/Notifications';


//interface Props {
//    menuOpen: boolean;
//    onClick: () => void;
//}

export function SettingsDropdown(props) {

    const {menuOpen, onClick} = props; 

    return (
        <Dropdown nav isOpen={menuOpen} toggle={onClick} className="tutorial-dropdown pr-4">
            <DropdownToggle nav className={`${s.mobileCog}`}>
                <span className={`${s.headerSvgFlipColor}`}>
                <Settings />
               {/*     <i className="fa fa-gear" />*/}
                </span>
            </DropdownToggle>
            <DropdownMenu end className={`${s.headerDropdownLinks} super-colors`}>
                <Notifications />
            </DropdownMenu>
        </Dropdown>

    )

}

export default SettingsDropdown

