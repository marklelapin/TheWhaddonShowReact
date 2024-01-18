import s from '../Header.module.scss'; 
import { Icon } from '../../../components/Icons/Icons';
import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';




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
                <Icon icon="gear" />
               {/*     <i className="fa fa-gear" />*/}
                </span>
            </DropdownToggle>
            <DropdownMenu end className={`${s.headerDropdownLinks} super-colors`}>
                
            </DropdownMenu>
        </Dropdown>

    )

}

export default SettingsDropdown

