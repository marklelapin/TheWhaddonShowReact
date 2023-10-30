//react/Redux
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter, Redirect } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';


//Components
import Hammer from 'rc-hammerjs';
import TablesStatic from '../../pages/tables/static';
import TablesDynamic from '../../pages/tables/dynamic';
import ExtraCalendar from '../../pages/extra/calendar';
import ExtraGallery from '../../pages/extra/gallery';
import Widgets from '../../pages/widgets';
import DashboardAnalytics from '../../pages/analytics';
import Dashboard from '../../pages/dashboard';
import Home from '../../pages/home/Home';
import Users from '../../pages/user/Users';
import Script from '../../pages/scriptEditor/Script';
import ScriptImporter from '../../pages/scriptEditor/ScriptImporter';
import { SidebarTypes } from '../../reducers/layout';
import Header from '../Header';
import Sidebar from '../Sidebar';
//import Helper from '../Helper';
import { openSidebar, closeSidebar } from '../../actions/navigation';
import s from './Layout.module.scss';
import { DashboardThemes } from '../../reducers/layout';
import BreadcrumbHistory from '../BreadcrumbHistory';
import ApiTestResults from '../../pages/apiMonitor/TestResults';


class Layout extends React.Component {
    static propTypes = {
        sidebarStatic: PropTypes.bool,
        sidebarOpened: PropTypes.bool,
        dashboardTheme: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
    };

    static defaultProps = {
        sidebarStatic: false,
        sidebarOpened: true,
        dashboardTheme: DashboardThemes.DARK
    };
    constructor(props) {
        super(props);

        this.handleSwipe = this.handleSwipe.bind(this);
    }


    handleSwipe(e) {
        if ('ontouchstart' in window) {
            if (e.direction === 4) {
                this.props.dispatch(openSidebar());
                return;
            }

            if (e.direction === 2 && this.props.sidebarOpened) {
                this.props.dispatch(closeSidebar());
                return;
            }
        }
    }

    render() {
        return (
            <div
                className={[
                    s.root,
                    this.props.sidebarStatic ? `${s.sidebarStatic}` : '',
                    !this.props.sidebarOpened ? s.sidebarClose : '',
                    'sing-dashboard',
                    `dashboard-${(localStorage.getItem("sidebarType") === SidebarTypes.TRANSPARENT) ? "light" : localStorage.getItem("dashboardTheme")}`,
                    `header-${localStorage.getItem("navbarColor") ? localStorage.getItem("navbarColor").replace('#', '') : 'FFFFFF'}`
                ].join(' ')}
            >
                <Sidebar />
                <div className={s.wrap}>
                    <Header />
                

                    <Hammer onSwipe={this.handleSwipe}>
                        <main className={s.content}>
                            {/*<BreadcrumbHistory url={this.props.location.pathname} />*/}
                            <TransitionGroup>
                                <CSSTransition
                                    key={this.props.location.key}
                                    classNames="fade"
                                    timeout={200}
                                >
                                    <Switch>
                                        <Route path="/app/main" exact component={Home} />
                                        <Route path="/app/main/dashboard" exact component={Dashboard} />
                                        <Route path="/app/main/widgets" exact component={Widgets} />
                                        <Route path="/app/main/analytics" exact component={DashboardAnalytics} />

                                        <Route path="/app/script" exact component={Script} />
                                        <Route path="/app/script/import" exact component={ScriptImporter} />

                                        <Route path="/app/planning/cast" exact render={() => <Redirect to="/app/tables/static" />} />
                                        <Route path="/app/planning/props" exact render={() => <Redirect to="/app/tables/static" />} />
                                        <Route path="/app/planning/costumes" exact render={() => <Redirect to="/app/tables/static" />} />

                                        <Route path="/app/rehearsal/planner" exact render={() => <Redirect to="/app/tables/dynamic" />} />
                                        <Route path="/app/rehearsal/calendar" exact render={() => <Redirect to="/app/extra/calendar" />} />

                                        <Route path="/app/show/website" exact render={() => <Redirect to="/app/main/widgets" />} />
                                        <Route path="/app/show/tickets" exact render={() => <Redirect to="/app/main/widgets" />} />
                                        <Route path="/app/show/programme" exact render={() => <Redirect to="/app/main/widgets" />} />

                                        <Route path="/app/gallery" exact component={ExtraGallery} />

                                        <Route path="/admin" exact render={() => <Redirect to="/admin/users" />} />
                                        <Route path="/admin/users" exact component={Users} />

                                        <Route path="/apiMonitor/documentation" exact render={() => <Redirect to="/app/grid" />} />
                                        <Route path="/apiMonitor/dashboard" exact render={() => <Redirect to="/app/main/analytics" />} />
                                        <Route path="/apiMonitor/testResults" exact component={ApiTestResults} />

                                       
                                      
                                        <Route path="/app/tables" exact render={() => <Redirect to="/app/tables/static" />} />
                                        <Route path="/app/tables/static" exact component={TablesStatic} />
                                        <Route path="/app/tables/dynamic" exact component={TablesDynamic} />
                                        
                                        <Route path="/app/extra/calendar" exact component={ExtraCalendar} />
                                       


                                    </Switch>
                                </CSSTransition>
                            </TransitionGroup>
                            <footer className={s.contentFooter}>
                                The Whaddon Show App by <a href="https://flatlogic.com" rel="nofollow noopener noreferrer" target="_blank">Mark Carter</a>
                            </footer>
                        </main>
                    </Hammer>
                </div>
                </div>
        );
    }
}

function mapStateToProps(store) {
    return {
        sidebarOpened: store.navigation.sidebarOpened,
        sidebarStatic: store.navigation.sidebarStatic,
        dashboardTheme: store.layout.dashboardTheme,
        navbarColor: store.layout.navbarColor,
        sidebarType: store.layout.sidebarType,
        currentUser: store.auth.currentUser,
    };
}

export default withRouter(connect(mapStateToProps)(Layout));
