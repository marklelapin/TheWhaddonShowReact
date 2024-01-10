//import Login from '../pages/auth/login';

import React, { useLocation } from 'react';
import { Route } from 'react-router-dom';
import { login } from '../actions/user';
import {useMsal } from '@azure/msal-react'


export const ByPassRoute = ({ dispatch, component, ...rest }) => {
    return (
        <Route {...rest} render={props => (React.createElement(component, props))} />
    );
}

export const UserRoute = ({ dispatch, component, ...rest }) => {

    const { instance } = useMsal();
    const activeAccount = (instance) ? instance.getActiveAccount() : null;

    if (!activeAccount) {
        return (<Redirect to="/login" />)
    } else {
        return ( // eslint-disable-line
            <Route {...rest} render={props => (React.createElement(component, props))} />
        );
    }
};

//export const AuthRoute = ({ dispatch, component, ...rest }) => {

//    //work out where to go afterwards
//    const location = useLocation();
//    const from = location.pathname || '/app/main';

//    const { instance, inProgress } = useMsal();
//    const activeAccount = instance.getActiveAccount();


    

//    if (activeAccount) {
//        dispatch(login(authenticatedUser))
//        return (
//            <Redirect to={from} />
//        );
//    } else {
//        return (
//            <Route {...rest} render={props => (React.createElement(component, props))} />
//        );
//    }
//};
