import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openStaticSidebar } from '../../../actions/navigation';
import { NavLink } from 'reactstrap';
import {Icon} from '../../../components/Icons/Icons';
import s from '../Header.module.scss'; 
export function SidebarToggle(props) {


    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);

    const dispatch = useDispatch();



    return (

        <>
            {!sidebarStatic &&
                <NavLink className={`${s.toggleSidebar}`} id="toggleSidebar" onClick={()=>dispatch(openStaticSidebar())}>
                    <span className={s.headerSvgFlipColor}>
                        <Icon icon="menu" id="header-toggle-sidebar" className={s.headerSvgFlipColor} toolTip="Pin Sidebar Open" toolTipPlacement="right"/>
                    </span>
                </NavLink>}
        </>


    )
}
export default SidebarToggle