//REact and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from 'connected-react-router';

//dataAccess Components
import LocalServerSyncing from '../dataAccess/LocalServerSyncing';
import ScriptEditorProcessing from '../pages/scriptEditor/components/ScriptEditorProcessing';

//Components
import { Layout } from '../components/Layout';
//import Login from '../pages/auth/login';
//import Verify from '../pages/auth/verify';
//import Register from '../pages/auth/register';
//import Reset from '../pages/auth/reset';
//import Forgot from '../pages/auth/forgot';
import CacheProcessing from '../dataAccess/CacheProcessing';
import TextAreaContexts from '../dataAccess/TextAreaContexts';

//Utils
import { getHistory } from '../index.js';
import { ByPassRoute, UserRoute, AuthRoute } from './RouteComponents';
/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

// Styles
import '../styles/theme.scss';

 

const CloseButton = ({ closeToast }) => <i onClick={closeToast} className="la la-close notifications-close" />

function App() {

    const authorisedUser = useSelector((state) => state.user.authorizedUser)

    const loadingInit = useSelector((state) => state.auth.loadingInit)

    const dispatch = useDispatch();
  
    if (loadingInit) { //this.props.loadingInit this.props.dispatch in {} below
        return <div />;
    }

    return (
        <>
            <LocalServerSyncing /> 
            <ScriptEditorProcessing />
            <CacheProcessing />
            <TextAreaContexts />

            <ToastContainer
                autoClose={5000}
                hideProgressBar
                closeButton={<CloseButton />}
            />
            <ConnectedRouter history={getHistory()}>
                <HashRouter>
                    <Switch>
                        <Route path="/" exact render={() => <Redirect to="/app/main" />} />
                        <Route path="/app" exact render={() => <Redirect to="/app/main" />} />

                        <ByPassRoute path="/app/main" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/script" dispatch={dispatch} component={Layout} authorisedUser={authorisedUser} />
                        <UserRoute path="/app/casting" dispatch={dispatch} component={Layout} authorisedUser={authorisedUser}  />
                        <UserRoute path="/app/gallery" dispatch={dispatch} component={Layout} authorisedUser={authorisedUser}  />
                        <UserRoute path="/app/admin" dispatch={dispatch} component={Layout} authorisedUser={authorisedUser} />
                        <UserRoute path="/app/api" dispatch={dispatch} component={Layout} authorisedUser={authorisedUser} />

                        <AuthRoute path="/login" dispatch={dispatch} component={Layout} />
                        {/*<UserRoute path="/app" dispatch={dispatch} component={LayoutComponent} />*/}
                        {/*<UserRoute path="/apiMonitor" dispatch={dispatch} component={LayoutComponent} /> */}

                        {/*<AdminRoute path="/admin" currentUser={currentUser} dispatch={dispatch}*/}
                        {/*    component={LayoutComponent} />*/}
                        {/*<Route path="/documentation" exact*/}
                        {/*    render={() => <Redirect to="/documentation/getting-started/overview" />} />*/}
                       
                        {/*<AuthRoute path="/register" exact component={Register} />*/}
                        {/*<AuthRoute path="/login" exact component={Login} />*/}
                        {/*<AuthRoute path="/verify-email" exact component={Verify} />*/}
                        {/*<AuthRoute path="/password-reset" exact component={Reset} />*/}
                        {/*<AuthRoute path="/forgot" exact component={Forgot} />*/}
                        <Route path="/error" exact component={ErrorPage} />
                        <Redirect from="*" to="/app/main" />
                    </Switch>
                </HashRouter>
            </ConnectedRouter>
        
        
        </>

        

    );

}


export default App;
