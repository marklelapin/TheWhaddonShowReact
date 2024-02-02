import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openStaticSidebar, openSidebar } from '../../../actions/navigation';
import { NavLink } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';

import s from '../Header.module.scss';
export function SidebarToggle(props) {

    const { showOverride = null } = props;

    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);
    const isMobileDevice = useSelector(store => store.device.isMobileDevice);
    const dispatch = useDispatch();


    const handleClick = () => {
        if (isMobileDevice) {
            dispatch(openSidebar())
        } else {
            dispatch(openStaticSidebar())
        }

    }

    const show = showOverride === null ? !sidebarStatic : showOverride

    return (

        <>
            {show &&
                <NavLink className={`${s.toggleSidebar}`} id="toggleSidebar" >
                    <span className={s.headerSvgFlipColor}>
                        <Icon icon="menu" id="header-toggle-sidebar" className={s.headerSvgFlipColor} onClick={handleClick} toolTip="Pin Sidebar Open" toolTipPlacement="right" />
                    </span>
                </NavLink>}
        </>


    )
}
export default SidebarToggle