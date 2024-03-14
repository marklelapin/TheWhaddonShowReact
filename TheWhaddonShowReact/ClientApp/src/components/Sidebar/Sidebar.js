import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
//import { Progress, Alert } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import {
    closeStaticSidebar,
    openSidebar,
    closeSidebar
} from '../../actions/navigation';
import {
    updatePrintScript
} from '../../actions/scriptEditor';
import { refreshSync } from '../../actions/localServer';

//components
import { Icon } from '../../components/Icons/Icons';
import User from '../../pages/user/Users';
/*import ApiMonitor from '../../pages/apiMonitor/ApiMonitor'; */
import LinksGroup from './LinksGroup/LinksGroup';
import wslogo from '../../images/whaddon-show-logo-reversed.png';
import wstitle from '../../images/the-whaddon-show.png';
import classnames from 'classnames';
import { userAccessToComponent } from '../../dataAccess/userAccess';
import { log, SIDEBAR as logType } from '../../dataAccess/logging';
import s from './Sidebar.module.scss';

function Sidebar(props) {

    const { isModal = false } = props;

    const dispatch = useDispatch();

    //Access state from Redux store
    const sidebarOpened = useSelector(store => store.navigation.sidebarOpened);
    const sidebarStatic = useSelector(store => store.navigation.sidebarStatic);
    const isMobileDevice = useSelector(store => store.device.isMobileDevice);
    const currentUser = useSelector((state) => state.user.currentUser)


    //get Location
    const location = useLocation();
    const showScriptTools = location.pathname.includes('/app/script') && isMobileDevice

    const showTools = showScriptTools


    useEffect(() => {
        window.addEventListener('onMouseEnter', onMouseEnter);
        window.addEventListener('onMouseLeave', onMouseLeave);

        return () => {
            window.removeEventListener('onMouseEnter', onMouseEnter);
            window.removeEventListener('onMouseLeave', onMouseLeave);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleCloseSidebar = () => {
        log()
        dispatch(closeStaticSidebar())
    }

    const onMouseEnter = () => {
        log(logType, `on mouse enter static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarStatic) {
            dispatch(openSidebar());
        }
    }

    const onMouseLeave = () => {
        log(logType, `on mouse leave static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (!sidebarStatic) {
            dispatch(closeStaticSidebar());
        }
    }

    const isSidebarOpen = sidebarStatic || sidebarOpened;

    const handlePrint = (type) => {
        dispatch(closeSidebar())
        setTimeout(() =>
            dispatch(updatePrintScript(type)), 500) //introduce delay to allow modal to close before printing (otherwise modal appears in print)
    }


    const handleRefresh = () => {
        dispatch(refreshSync())
        dispatch(closeSidebar())
    }
    const linksJsx = (

        <>
            <header className={s.logo}>
                <a href="/app/home">
                    <img src={wslogo} height="60" alt="The Whaddon Show Logo of a cartoon cowboy playing the guitar" />
                    <img src={wstitle} height="40" alt="The Whaddon Show" />
                </a>
            </header>

            {/*PAGES SECTION*/}

            <ul className={s.nav}>

                <LinksGroup
                    key="home"
                    header="Home"
                    link="/app/home"
                    iconElement={<Icon icon='home' />}
                />
                <LinksGroup
                    key="script"
                    header="Script"
                    link="/app/script"
                    iconElement={<Icon icon='script' />}
                />
                <LinksGroup
                    key="scriptsummary"
                    header="Script Summary"
                    link="/app/scriptsummary"
                    iconElement={<Icon icon='summary' />}
                />
                <LinksGroup
                    key="casting"
                    header="Casting"
                    link="/app/casting"
                    iconElement={<Icon icon='casting' />}
                />
                <LinksGroup
                    key="gallery"
                    header="Gallery"
                    link="/app/gallery"
                    iconElement={<Icon icon="gallery" />}
                />

                {/*   TOOLS SECTION*/}

                {showTools &&
                    <h5 key="toolsTitle" className={[s.navTitle, s.groupTitle].join(' ')}>TOOLS</h5>
                }
                {showScriptTools &&
                    <>
                        <LinksGroup
                            key="print"
                            header="Print Scene"
                            iconElement={<Icon icon="print" />}
                            onToolClick={() => handlePrint('regular')}
                        />
                        <LinksGroup
                            key="printlarge"
                            header="Print (Large)"
                            iconElement={<Icon icon="glasses" />}
                            onToolClick={() => handlePrint('large')}
                        />
                        <LinksGroup
                            key="refresh"
                            header="Refresh Script"
                            iconElement={<Icon icon="refresh" />}
                            onToolClick={() => handleRefresh()} />
                    </>
                }

                {/*   ADIMN SECTION*/}

                {(userAccessToComponent(currentUser, <User />) || userAccessToComponent(currentUser, 'ApiMonitor')) &&
                    <h5 key="adminTitle" className={[s.navTitle, s.groupTitle].join(' ')}>ADMIN</h5>
                }
                {(userAccessToComponent(currentUser, 'Users')) &&
                    <LinksGroup
                        key="users"
                        header="Users"
                        link="/app/users"
                        iconElement={<Icon icon="user" />}
                    />
                }
                {(userAccessToComponent(currentUser, 'ApiMonitor')) &&

                    <LinksGroup
                        key="api"
                        link="/app/api"
                        header="API"
                        iconElement={<Icon icon="api" />}
                        childrenLinks={[
                            {
                                key: '/app/api/documentation',
                                header: 'Documentation',
                                link: '/app/api/documentation',
                                iconElement: <Icon icon="document" />,
                            },
                            {
                                key: '/app/api/monitor',
                                header: 'Monitor',
                                link: '/app/api/monitor',
                                iconElement: <Icon icon="layout" />,
                            },
                            {
                                key: '/app/api/testresults',
                                header: 'Test Results',
                                link: '/app/api/testresults',
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
            {isModal && <Icon icon="cross" id="close-modal-sidebar-toggle" onClick={toggleCloseSidebar} />}
            {linksJsx}
        </div>

    )

    log(logType, 'sidebar', { isSidebarOpen, sidebarOpened, sidebarStatic, isMobileDevice })
    if (!isModal) return (

        <div className={`${isSidebarOpen ? 'sidebarOpen' : s['sidebarClose']} ${s['sidebarWrapper']}`}>
            {sidebarOpened && sidebarStatic && !isMobileDevice &&
                <div className={classnames(s.closeSidebarToggle, 'clickable')} onClick={toggleCloseSidebar}>
                    <Icon icon="arrow-left" id="close-sidebar-toggle" toolTip="UnPin Sidebar" toolTipPlacement="right" />
                </div>
            }

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