//react/Redux
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';


//Components
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header/Header';
import Sidebar from '../Sidebar';
import Login from '../Login/Login';
import { Modal } from 'reactstrap';
//import Helper from '../Helper';
import {  closeSidebar, closeStaticSidebar } from '../../actions/navigation';
import { updateDeviceInfo } from '../../actions/device';
import s from './Layout.module.scss';
import { getSidebarWrapStatus, preventRefresh } from '../../core/screenHelper';
import classnames from 'classnames';

export const Layout = (props) => {

    const { children, doCurtain = true } = props

    const location = useLocation();
    const dispatch = useDispatch();

    //Redux
    const sidebarStatic = useSelector(state => state.navigation.sidebarStatic);
    const sidebarOpened = useSelector(state => state.navigation.sidebarOpened);
    const isMobileDevice = useSelector(state => state.device.isMobileDevice);


    const isModalSidebar = isMobileDevice

    const sidebarStatus = getSidebarWrapStatus(sidebarStatic, sidebarOpened, isModalSidebar)

    useEffect(() => {
        if (isMobileDevice) {
            dispatch(closeStaticSidebar())
        }
    }, [isMobileDevice])//eslint-disable-line react-hooks/exhaustive-deps


    //const handleSwipe = (e) => {
    //    if ('ontouchstart' in window) {
    //        if (e.direction === 4) {
    //            dispatch(openSidebar());
    //            return;
    //        }

    //        if (e.direction === 2 && sidebarOpened) {
    //            dispatch(closeSidebar());
    //            return;
    //        }
    //    }
    //}

    useEffect(() => {

        const handleResize = () => {
            dispatch(updateDeviceInfo())
        }
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); }
    }, []); //eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div
            className={[
                s.root,
                s[sidebarStatus],
                'sing-dashboard',
                `dashboard-${(localStorage.getItem("sidebarType") === SidebarTypes.TRANSPARENT) ? "light" : localStorage.getItem("dashboardTheme")}`,
                `header-${localStorage.getItem("navbarColor") ? localStorage.getItem("navbarColor").replace('#', '') : 'FFFFFF'}`
            ].join(' ')}
            onTouchStart={preventRefresh}
        >
            {!isModalSidebar && <Sidebar />}
            <Modal isOpen={isModalSidebar && sidebarOpened} toggle={() => dispatch(closeSidebar())} centered>
                <Sidebar isModal={true} />
            </Modal>


            <div className={classnames(s.wrap, s[sidebarStatus])}>
                <Header />
                {/*  <Hammer onSwipe={handleSwipe}>*/}
                <main className={classnames(s.content,isMobileDevice ? s.isMobileDevice : null)}>
                    <TransitionGroup id="layout-window" className="flex-full-height">
                        <CSSTransition
                            key={location.key}
                            classNames="fade"
                            timeout={200}
                        >
                            {() => children}
                        </CSSTransition>
                    </TransitionGroup>

                </main>
                {/*     </Hammer>*/}
            </div>
            <Login doCurtain={doCurtain} />
        </div>
    );
}

