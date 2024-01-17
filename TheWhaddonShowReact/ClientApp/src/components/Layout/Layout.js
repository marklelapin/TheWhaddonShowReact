//react/Redux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Route, useLocation } from 'react-router-dom';


//Components
import Hammer from 'rc-hammerjs';
import ExtraGallery from '../../pages/extra/gallery';
import Home from '../../pages/home/Home';
import Users from '../../pages/user/Users';
import Script from '../../pages/scriptEditor/Script';
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header/Header';
import Sidebar from '../Sidebar';
import Login from '../Login/Login';
import UnderConstruction from '../../pages/underConstruction/UnderConstruction';
//import Helper from '../Helper';
import { openSidebar, closeSidebar } from '../../actions/navigation';
import s from './Layout.module.scss';
import ApiTestResults from '../../pages/apiMonitor/TestResults';


import { log, LAYOUT as logType } from '../../logging.js'

const SVGMask = (<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
    <defs>
        <mask id="mask" x="0" y="0" width="100%" height="100%">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
        </mask>
    </defs>
</svg>)

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
                                {() => children}
                            </CSSTransition>
                        </TransitionGroup>
                        
                    </main>
                </Hammer>
            </div>
            <Login />
        </div>
    );
}

