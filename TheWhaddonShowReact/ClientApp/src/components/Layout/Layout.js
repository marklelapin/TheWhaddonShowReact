//react/Redux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import {  Route, useLocation } from 'react-router-dom';


//Components
import Hammer from 'rc-hammerjs';
import ExtraGallery from '../../pages/extra/gallery';
import Home from '../../pages/home/Home';
import Users from '../../pages/user/Users';
import Script from '../../pages/scriptEditor/Script';
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header/Header';
import Sidebar from '../Sidebar';
import Login  from '../Login/Login';
import UnderConstruction from '../../pages/underConstruction/UnderConstruction';
//import Helper from '../Helper';
import { openSidebar, closeSidebar } from '../../actions/navigation';
import s from './Layout.module.scss';
import ApiTestResults from '../../pages/apiMonitor/TestResults';
import { userAccessToComponent } from '../../dataAccess/userAccess';

import {log, LAYOUT as logType } from '../../logging.js'



export const Layout = (props) => {

    const { children } = props

    const location = useLocation();
    const dispatch = useDispatch();

    //Redux
    const sidebarStatic = useSelector(state => state.navigation.sidebarStatic);
    const sidebarOpened = useSelector(state => state.navigation.sidebarOpened);
    const currentUser = useSelector(state => state.user.currentUser)

    const handleSwipe = (e) => {
        if ('ontouchstart' in window) {
            if (e.direction === 4) {
                dispatch(openSidebar());
                return;
            }

            if (e.direction === 2 && sidebarOpened) {
                dispatch(closeSidebar());
                return;
            }
        }
    }


    return (
        <div
            className={[
                s.root,
                sidebarStatic ? s.sidebarStatic : '',
                !sidebarOpened ? s.sidebarClose : '',
                'sing-dashboard',
                `dashboard-${(localStorage.getItem("sidebarType") === SidebarTypes.TRANSPARENT) ? "light" : localStorage.getItem("dashboardTheme")}`,
                `header-${localStorage.getItem("navbarColor") ? localStorage.getItem("navbarColor").replace('#', '') : 'FFFFFF'}`
            ].join(' ')}
        >
            <Sidebar />
            <div className={s.wrap}>
                <Header />
                <Hammer onSwipe={handleSwipe}>
                    <main className={s.content}>
                        <TransitionGroup className="flex-full-height">
                            <CSSTransition
                                key={location.key}
                                classNames="fade"
                                timeout={200}
                            >
                                {()=>children}
                            </CSSTransition>
                        </TransitionGroup>
                        <footer className={s.contentFooter}>
                            The Whaddon Show App by <a href="https://github.com/marklelapin" rel="nofollow noopener noreferrer" target="_blank">Mark Carter</a>
                        </footer>
                    </main>
                </Hammer>
            </div>
            <Login />
        </div>
    );
}

