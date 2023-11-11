import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/auth';
import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Avatar from '../../components/Avatar/Avatar.js';
import UserDefault from '../../images/sidebar/basil/UserDefault';
import CalendarIcon from '../../images/sidebar/Outline/Calendar';
import EnvelopeBlack from '../../images/sidebar/basil/EnvelopeBlack';
import PowerButton from '../../images/sidebar/basil/PowerButton';



function AccountDropdown(props) {

    const dispatch = useDispatch();

    const { user, menuOpen, onClick } = props;

    const doLogout = () => {
        dispatch(logoutUser());
    }

    return (
        <Dropdown nav isOpen={menuOpen} toggle={onClick} id="account-dropdown" className={`${s.notificationsMenu}`}>    
            <DropdownToggle nav caret className={s.headerSvgFlipColor}>
                <Avatar person={user} />
                {/*<span className={`small m-2 d-sm-down-none ${s.headerTitle} ${this.props.sidebarStatic ? s.adminEmail : ''}`}>{user ? (user.firstName || user.email) : "Philip smith"}</span>*/}
                {/*<span className="m-1 circle bg-light-red text-white fw-semi-bold d-sm-down-none">13</span>*/}
            </DropdownToggle>
                <DropdownMenu end className={`${s.headerDropdownLinks} super-colors`}>
                    <DropdownItem href="http://demo-flatlogic2.herokuapp.com/sing-app-react/#/app/profile"><span className={s.headerDropdownIcon}><UserDefault /></span> My Account</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem href="http://demo-flatlogic2.herokuapp.com/sing-app-react/#/app/extra/calendar"><span className={s.headerDropdownIcon}><CalendarIcon /></span>Calendar</DropdownItem>
                    <DropdownItem href="http://demo-flatlogic2.herokuapp.com/sing-app-react/#/app/inbox"><span className={s.headerDropdownIcon}><EnvelopeBlack /></span>Inbox &nbsp;&nbsp;</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={doLogout}><span className={s.headerDropdownIcon}><PowerButton /></span> Log Out</DropdownItem>
                </DropdownMenu>
        </Dropdown>

    )



}

export default AccountDropdown