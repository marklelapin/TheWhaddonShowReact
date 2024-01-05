//react/Redux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';


//Components
import Hammer from 'rc-hammerjs';
import ExtraGallery from '../../pages/extra/gallery';
import Home from '../../pages/home/Home';
import Users from '../../pages/user/Users';
import Script from '../../pages/scriptEditor/Script';
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header';
import Sidebar from '../Sidebar';
import UnderConstruction from '../../pages/underConstruction/UnderConstruction';
//import Helper from '../Helper';
import { openSidebar, closeSidebar } from '../../actions/navigation';
import s from './Layout.module.scss';
import BreadcrumbHistory from '../BreadcrumbHistory';
import ApiTestResults from '../../pages/apiMonitor/TestResults';
import { userAccessToComponent } from '../../dataAccess/userAccess';




export const Layout = (props) => {

    const location = useLocation();
    const dispatch = useDispatch();

    //Redux
    const sidebarStatic = useSelector(state => state.navigation.sidebarStatic);
    const sidebarOpened = useSelector(state => state.navigation.sidebarOpened);
    const currentUser = useSelector(state => state.user.currentUser)

    const handleSwipe = (e) => {
        if ('ontouchstart' in window) {
            if (e.direction === 4) {
                this.props.dispatch(openSidebar());
                return;
            }

            if (e.direction === 2 && this.props.sidebarOpened) {
                dispatch(closeSidebar());
                return;
            }
        }
    }

    const accessToScript = userAccessToComponent(currentUser, 'Script')
    const accessToCasting = userAccessToComponent(currentUser, 'Casting')
    const accessToGallery = userAccessToComponent(currentUser, 'Gallery')
    const accessToUsers = userAccessToComponent(currentUser, 'Users')
    const accessToApi = userAccessToComponent(currentUser, 'Api')


    return (
        <div
            className={[
                s.root,
                sidebarStatic ? `${s.sidebarStatic}` : '',
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
                                <Switch>
                                    <Route path="/app/main" exact component={Home} />
                                    {accessToScript && <Route path="/app/script" exact component={Script} userAccess={accessToScript} />}
                                    {accessToCasting && <Route path="/app/casting" exact component={UnderConstruction} userAccess={accessToCasting} />}
                                    {accessToGallery && <Route path="/app/gallery" exact component={ExtraGallery} userAccess={accessToGallery} />}
                                    {accessToUsers &&
                                        <>
                                            <Route path="app/admin" exact render={() => <Redirect to="/admin/users" />} />
                                            <Route path="app/admin/users" exact component={Users} userAccess={accessToUsers} />
                                        </>
                                    }
                                    {accessToApi &&
                                        <>
                                            <Route path="app/api/documentation" exact component={UnderConstruction} />
                                            <Route path="app/api/dashboard" exact component={UnderConstruction} />
                                            <Route path="app/api/testResults" exact component={ApiTestResults} />
                                        </>
                                    }

                                </Switch>
                            </CSSTransition>
                        </TransitionGroup>
                        <footer className={s.contentFooter}>
                            The Whaddon Show App by <a href="https://github.com/marklelapin" rel="nofollow noopener noreferrer" target="_blank">Mark Carter</a>
                        </footer>
                    </main>
                </Hammer>
            </div>
        </div>
    );
}

