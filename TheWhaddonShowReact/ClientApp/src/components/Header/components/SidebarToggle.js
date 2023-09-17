import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSidebar, openSidebar, toggleStaticSidebar, closeSidebarAndToggleStatic } from '../../../actions/navigation';
import { NavLink, UncontrolledTooltip } from 'reactstrap';
import Menu from 'images/sidebar/basil/Menu';
import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class
import { isSmallerScreen } from 'components/Sidebar/Sidebar';
export function SidebarToggle(props) {


    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);

    const dispatch = useDispatch();

    const toggleSidebarOpenClose = () => {
        //console.log(`toggle sidebar static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (sidebarOpened && isSmallerScreen()) {
            dispatch(closeSidebar())

        } else if (sidebarOpened && sidebarStatic) { //and not smaller screen
            dispatch(toggleStaticSidebar())
            dispatch(closeSidebar())
        } else if (sidebarOpened) { //and not smaller screen and not static
            dispatch(closeSidebar())
        } else {
            dispatch(openSidebar())
        }
            
    }


    return (

        <>
            <NavLink className={`${s.toggleSidebar}`} id="toggleSidebar" onClick={toggleSidebarOpenClose}>
                <span className={s.headerSvgFlipColor}>
                    <Menu />
                </span>
            </NavLink>
            <UncontrolledTooltip placement="bottom" target="toggleSidebar">
                {sidebarOpened ? 'Close' : 'Open'} <br /> sidebar
            </UncontrolledTooltip>
        </>


    )
}
export default SidebarToggle