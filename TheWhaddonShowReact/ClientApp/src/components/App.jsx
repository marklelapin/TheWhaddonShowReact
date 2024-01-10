//REact and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

//dataAccess Components
import LocalServerSyncing from '../dataAccess/LocalServerSyncing';
import ScriptEditorProcessing from '../pages/scriptEditor/components/ScriptEditorProcessing';

//Azure
import { MsalProvider, useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import { b2cPolicies, protextedResources } from '../authConfig.js'
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
import {log, APP as logType } from '../logging.js'
/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

// Styles
import '../styles/theme.scss';



const CloseButton = ({ closeToast }) => <i onClick={closeToast} className="la la-close notifications-close" />

function App(props) {

    log(logType,'props',props)


    const { instance } = props

    const loadingInit = useSelector((state) => state.auth.loadingInit)

    const dispatch = useDispatch();

    if (loadingInit) { //this.props.loadingInit this.props.dispatch in {} below
        return <div />;
    }

    return (

        <MsalProvider instance={instance}>
            <LocalServerSyncing />
            <ScriptEditorProcessing />
            <CacheProcessing />
            <TextAreaContexts />

            <ToastContainer
                autoClose={5000}
                hideProgressBar
                closeButton={<CloseButton />}
            />
            <BrowserRouter>
                <Routes>
                  
                        {/*<Route path="/" exact render={() => <Redirect to="/app/main" />} />*/}
                        {/*<Route path="/app" exact render={() => <Redirect to="/app/main" />} />*/}

                        <Route path="/app/main" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/script" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/casting" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/gallery" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/admin" dispatch={dispatch} component={Layout} />
                        <UserRoute path="/app/api" dispatch={dispatch} component={Layout} />
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
                </Routes>
            </BrowserRouter>

        </MsalProvider>

    );

}


export default App;
