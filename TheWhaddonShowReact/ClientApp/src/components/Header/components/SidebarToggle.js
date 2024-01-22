import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openStaticSidebar,openSidebar} from '../../../actions/navigation';
import { NavLink } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';

import {isScreenSmallerThan} from '../../../core/screenHelper'; 
import s from '../Header.module.scss'; 
export function SidebarToggle(props) {


    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);

    const dispatch = useDispatch();


    const handleClick = () => {
        if (isScreenSmallerThan('md')) {
            dispatch(openSidebar())
        } else {
            dispatch(openStaticSidebar())
        }

    }

    return (

        <>
            {!sidebarStatic &&
                <NavLink className={`${s.toggleSidebar}`} id="toggleSidebar" onClick={handleClick}>
                    <span className={s.headerSvgFlipColor}>
                        <Icon icon="menu" id="header-toggle-sidebar" className={s.headerSvgFlipColor} toolTip="Pin Sidebar Open" toolTipPlacement="right"/>
                    </span>
                </NavLink>}
        </>


    )
}
export default SidebarToggle