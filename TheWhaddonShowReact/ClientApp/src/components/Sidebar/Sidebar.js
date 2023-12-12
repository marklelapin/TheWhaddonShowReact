import React from 'react';
import {useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
//import { Progress, Alert } from 'reactstrap';
import { withRouter, useLocation } from 'react-router-dom';

import s from './Sidebar.module.scss';
import LinksGroup from './LinksGroup/LinksGroup';
import {
    toggleStaticSidebar as toggleStaticSidebarAction
    , openSidebar as openSidebarAction
    , closeSidebar as closeSidebarAction
    , changeActiveSidebarItem
} from '../../actions/navigation';
import isScreen from '../../core/screenHelper';


import Home from '../../images/sidebar/basil/Home';
import User from '../../images/sidebar/basil/User';
import Calendar from '../../images/sidebar/Outline/Calendar';
import Stack from '../../images/sidebar/basil/Stack';
import Document from '../../images/sidebar/basil/Document';
import Layout from '../../images/sidebar/basil/Layout';
import Person from '../../images/sidebar/Outline/Person';
import Settings from '../../images/sidebar/basil/Settings';
import List from '../../images/sidebar/Outline/List';

import wslogo from '../../images/whaddon-show-logo-reversed.png'
import wstitle from '../../images/the-whaddon-show.png'

import CaretPin from './LinksGroup/CaretPin';

function Sidebar() {

    //Setup state internal to component
    const [enteredViaMouse, setEnteredViaMouse] = React.useState(false); 

    //Access state from Redux store
    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);
    const alertsList = useSelector(store => store.alerts.alertsList);
    const activeItem = useSelector(store => store.navigation.activeItem);
    const navbarType = useSelector(store => store.layout.navbarType);
    const navbarColor = useSelector(store => store.layout.navbarColor);
    const sidebarColor = useSelector(store => store.layout.sidebarColor);



    const dispatch = useDispatch();

    //get Location
    const location = useLocation();

    
    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => { window.removeEventListener('resize', handleResize); }
    }, []);


    const handleResize = () => {
        //console.log(`hadnle resize static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (isSmallerScreen()) {
            closeSidebar()
        }
        if (sidebarStatic && !isSmallerScreen()) {
            openSidebar()
        }
    }

    const onMouseEnter = () => {
        //console.log(`on mouse enter static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarOpened) {
            setEnteredViaMouse(true);
            openSidebar();
        }

    }

    const onMouseLeave = () => {
        //console.log(`on mouse leave static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarStatic && enteredViaMouse) {
            setEnteredViaMouse(false);
            closeSidebar()
        }
    }


    const openSidebar = () => {
        //console.log(`open sidebar static: ${sidebarStatic} opened: ${sidebarOpened}`)
        dispatch(openSidebarAction());
        const paths = location.pathname.split('/');
        paths.pop();
        dispatch(changeActiveSidebarItem(paths.join('/')))
    }

    const closeSidebar = () => {
        //console.log(`close sidebar static: ${sidebarStatic} opened: ${sidebarOpened}`)
        dispatch(closeSidebarAction());
        dispatch(changeActiveSidebarItem(null));
    }


    // static/non-static  and save setting to localstorage
    const toggleStaticSidebar = () => {
        //console.log(`toggle static static: ${sidebarStatic} opened: ${sidebarOpened}`)
        dispatch(toggleStaticSidebarAction());
        if (sidebarStatic) {
            localStorage.setItem('staticSidebar', 'false');
            dispatch(changeActiveSidebarItem(null));
            dispatch(closeSidebarAction())
        } else {
            localStorage.setItem('staticSidebar', 'true');
            const paths = location.pathname.split('/');
            paths.pop();
            dispatch(changeActiveSidebarItem(paths.join('/')));
        }
    }


    return (

        <div className={`${(!sidebarOpened && !sidebarStatic) ? s.sidebarClose : ''} ${s.sidebarWrapper}`}>

            <nav
                onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
                className={s.root}
            >
                <CaretPin isPinned={sidebarStatic} onClick={toggleStaticSidebar}></CaretPin>

                <header className={s.logo}>
                    <a href="https://demo.flatlogic.com/sing-app-react/">
                        <img src={wslogo} height="60" alt="The Whaddon Show Logo of a cartoon cowboy playing the guitar" />

                        <img src={wstitle} height="40" alt="The Whaddon Show" />
                    </a>
                </header>

                <ul className={s.nav}>

                    <LinksGroup
                        header="Home"
                        link="/app/main"
                        isHeader
                        iconElement={<Home />}
                        label=""
                        iconName="flaticon-home"
                        labelColor="info"
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={activeItem}
                        header="Script"
                        isHeader

                        iconElement={<Document />}
                        iconName="flaticon-document"
                        link="/app/script"
                        index=""
                  
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={activeItem}
                        header="Planning"
                        isHeader
                        iconName="flaticon-home"
                        iconElement={<Home />}
                        link="/app/planning"
                        index="planning"
                        childrenLinks={[
                            {
                                header: 'Cast', link: '/app/planning/cast',
                            },
                            {
                                header: 'Props', link: '/app/planning/props',
                            },
                            {
                                header: 'Costumes', link: '/app/planning/costumes',
                            },
                        ]}
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={activeItem}
                        header="Rehearsal"
                        isHeader
                        iconName="flaticon-calendar"
                        iconElement={<Calendar />}
                        link="/app/rehearsal"
                        index="rehearsal"
                        childrenLinks={[
                            {
                                header: 'Planner', link: '/app/rehearsal/planner',
                            },
                            {
                                header: 'Calendar', link: '/app/rehearsal/calendar',
                            },

                        ]}
                    />
                    <LinksGroup
                        onActiveSidebarItemChange={activeItem => dispatch(changeActiveSidebarItem(activeItem))}
                        activeItem={activeItem}
                        header="Show"
                        isHeader
                        iconName="flaticon-person"
                        iconElement={<Person />}
                        link="/app/show"
                        index=""
                        childrenLinks={[
                            {
                                header: 'Website', link: '/app/show/website',
                            },
                            {
                                header: 'Tickets', link: '/app/show/tickets',
                            },
                            {
                                header: 'Programme', link: '/app/show/programme',
                            },
                        ]}
                    />
                    <LinksGroup
                        header="Gallery"
                        link="/app/gallery"
                        isHeader
                        iconElement={<Layout />}
                        label=""
                        iconName="flaticon-layout"
                        labelColor="info"
                    />

                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>ADMIN</h5>

                    <LinksGroup
                        header="Users"
                        link="/admin/users"
                        isHeader
                        iconElement={<User />}
                        iconName="flaticon-user"
                        label=""
                        labelColor="info"
                    />
                    <LinksGroup
                        header="Settings"
                        link="/admin/settings"
                        isHeader
                        iconElement={<Settings />}
                        label=""
                        iconName="flaticon-settings"
                        labelColor="info"
                    />

                    <h5 className={[s.navTitle, s.groupTitle].join(' ')}>API</h5>

                    <LinksGroup
                        header="Documentation"
                        link="/apiMonitor/documentation"
                        isHeader
                        iconElement={<Stack />}
                        iconName="flaticon-stack"
                        label=""
                        labelColor="info"
                    />
                    <LinksGroup
                        header="Monitor"
                        link="/apiMonitor/dashboard"
                        isHeader
                        iconElement={<Settings />}
                        label=""
                        iconName="flaticon-settings"
                        labelColor="info"
                    />
                    <LinksGroup
                        header="Test Results"
                        link="/apiMonitor/testResults"
                        isHeader
                        iconElement={<List />}
                        label=""
                        iconName="flaticon-list"
                        labelColor="info"
                    />
                </ul>
            </nav >
        </div>
    );

}

export default withRouter(Sidebar);



export function isSmallerScreen() {

   return (isScreen('xs') || isScreen('sm'))

}