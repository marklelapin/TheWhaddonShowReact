import React from 'react';
import {useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from 'connected-react-router';
import { getHistory } from 'index';
import { AdminRoute, UserRoute, AuthRoute } from './RouteComponents';

/* eslint-disable */
import ErrorPage from 'pages/error';
/* eslint-enable */

import 'styles/theme.scss';
import LayoutComponent from 'components/Layout';
import Login from 'pages/auth/login';
import Verify from 'pages/auth/verify';
import Register from 'pages/auth/register';
import Reset from 'pages/auth/reset';
import Forgot from 'pages/auth/forgot';

import { useSync } from 'dataAccess/localServerUtils';
import { sync } from 'actions/localServer';
import { Person, ScriptItem, Part } from 'dataAccess/localServerModels';

import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query'



// Create a client
const queryClient = new QueryClient()

const CloseButton = ({ closeToast }) => <i onClick={closeToast} className="la la-close notifications-close" />

function App() {

const currentUser = useSelector((state) => state.auth.currentUser)
const loadingInit = useSelector((state) => state.auth.loadingInit)

const dispatch = useDispatch();

useSync();

    useEffect(() => {
    
        dispatch(sync(Person))
        //dispatch(sync(ScriptItem))
        //dispatch(sync(Part))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (loadingInit) { //this.props.loadingInit this.props.dispatch in {} below
        return <div />;
    }

    return (

        <QueryClientProvider client={queryClient}>
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


                        <UserRoute path="/app" dispatch={dispatch} component={LayoutComponent} />
                        <UserRoute path="/apiMonitor" dispatch={dispatch} component={LayoutComponent} /> 

                        <AdminRoute path="/admin" currentUser={currentUser} dispatch={dispatch}
                            component={LayoutComponent} />
                        <Route path="/documentation" exact
                            render={() => <Redirect to="/documentation/getting-started/overview" />} />
                       
                        <AuthRoute path="/register" exact component={Register} />
                        <AuthRoute path="/login" exact component={Login} />
                        <AuthRoute path="/verify-email" exact component={Verify} />
                        <AuthRoute path="/password-reset" exact component={Reset} />
                        <AuthRoute path="/forgot" exact component={Forgot} />
                        <Route path="/error" exact component={ErrorPage} />
                        <Redirect from="*" to="/app/main" />
                    </Switch>
                </HashRouter>
            </ConnectedRouter>
        </QueryClientProvider>

    );

}


export default App;
