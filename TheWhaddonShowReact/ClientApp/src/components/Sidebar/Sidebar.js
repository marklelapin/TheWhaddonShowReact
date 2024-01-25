import React from 'react';
import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
//import { Progress, Alert } from 'reactstrap';
import { useLocation } from 'react-router-dom';


import LinksGroup from './LinksGroup/LinksGroup';
import {

    closeStaticSidebar,
    openSidebar,
} from '../../actions/navigation';
import { isScreenSmallerThan } from '../../core/screenHelper';

import { Icon } from '../../components/Icons/Icons';
import User from '../../pages/user/Users';
import ApiMonitor from '../../pages/apiMonitor/ApiMonitor';

import wslogo from '../../images/whaddon-show-logo-reversed.png'
import wstitle from '../../images/the-whaddon-show.png'

import { userAccessToComponent } from '../../dataAccess/userAccess';

import s from './Sidebar.module.scss';
function Sidebar(props) {

    const { isModal = false } = props;

    //Access state from Redux store
    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);
    const isMobileDevice = useSelector(store => store.device.isMobileDevice);
    const currentUser = useSelector((state) => state.user.currentUser)

    const dispatch = useDispatch();

    //get Location
    const location = useLocation();


    useEffect(() => {
        window.addEventListener('onMouseEnter', onMouseEnter);
        window.addEventListener('onMouseLeave', onMouseLeave);

        return () => {
            window.removeEventListener('onMouseEnter', onMouseEnter);
            window.removeEventListener('onMouseLeave', onMouseLeave);

        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleCloseSidebar = () => {
        dispatch(closeStaticSidebar())
    }

    const onMouseEnter = () => {
        console.log(`on mouse enter static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarStatic) {
            dispatch(openSidebar());
        }
    }

    const onMouseLeave = () => {
        console.log(`on mouse leave static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarStatic) {
            dispatch(closeStaticSidebar());
        }
    }

    const isSidebarOpen = sidebarStatic || sidebarOpened;



    const linksJsx = (

        <>
            <header className={s.logo}>
                <a href="/app/home">
                    <img src={wslogo} height="60" alt="The Whaddon Show Logo of a cartoon cowboy playing the guitar" />

                    <img src={wstitle} height="40" alt="The Whaddon Show" />
                </a>
            </header>

            <ul className={s.nav}>

                <LinksGroup
                    header="Home"
                    link="/app/home"
                    iconElement={<Icon icon='home' />}
                />
                <LinksGroup
                    header="Script"
                    link="/app/script"
                    iconElement={<Icon icon='script' />}
                />
                <LinksGroup
                    header="Script Summary"
                    link="/app/scriptsummary"
                    iconElement={<Icon icon='summary' />}
                />
                <LinksGroup
                    header="Casting"
                    link="/app/casting"
                    iconElement={<Icon icon='casting' />}
                />
                <LinksGroup
                    header="Gallery"
                    link="/app/gallery"
                    iconElement={<Icon icon="gallery" />}
                />
                {(userAccessToComponent(currentUser, <User />) || userAccessToComponent(currentUser, 'ApiMonitor')) &&
                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>ADMIN</h5>
                }
                {userAccessToComponent(currentUser, 'Users') &&
                    <LinksGroup
                        header="Users"
                        link="/app/users"
                        iconElement={<Icon icon="user" />}
                    />
                }
                {userAccessToComponent(currentUser, 'ApiMonitor') &&

                    <LinksGroup
                        header="API"
                        link="/app/api"
                        iconElement={<Icon icon="api" />}
                        childrenLinks={[
                            {
                                subHeader: 'Documentation',
                                link: '/app/api/documentation',
                                iconElement: <Icon icon="document" />,
                            },
                            {
                                subHeader: 'Monitor',
                                link: '/app/api/monitor',
                                iconElement: <Icon icon="layout" />,
                            }
                        ]}
                    />

                }

            </ul>

        </>



    )


    if (isModal) return (

        <div className={s.modalSidebar}>
            {linksJsx}
        </div>

    )


    if (!isModal) return (

        <div className={`${isSidebarOpen ? 'sidebarOpen' : s['sidebarClose']} ${s['sidebarWrapper']}`}>
            {sidebarOpened && sidebarStatic && !isMobileDevice && <Icon icon="arrow-left" id="close-sidebar-toggle" className={s.closeSidebarToggle} onClick={toggleCloseSidebar} toolTip="UnPin Sidebar" toolTipPlacement="right" />}

            <nav
                onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
                className={s.root}
            >
                {linksJsx}
            </nav >

            <footer className={s.contentFooter}>
                The Whaddon Show App by <a href="https://github.com/marklelapin" rel="nofollow noopener noreferrer" target="_blank">Mark Carter</a>
            </footer>

        </div >
    );

}

export default Sidebar;



export function isSmallerScreen() {

    return (isScreen('xs') || isScreen('sm'))

}