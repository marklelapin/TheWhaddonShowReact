//import Login from '../pages/auth/login';

import React, { useLocation } from 'react';

import { Redirect, Route } from 'react-router';

import { login } from '../actions/user';




export const ByPassRoute = ({ dispatch, component, ...rest }) => {
    return (
        <Route {...rest} render={props => (React.createElement(component, props))} />
    );
}

export const UserRoute = ({ dispatch, component, authorisedUser, ...rest }) => {
    
    if (!authorisedUser) {
        return (<Redirect to="/login" />)
    } else {
        return ( // eslint-disable-line
            <Route {...rest} render={props => (React.createElement(component, props))} />
        );
    }
};

export const AuthRoute = ({ dispatch, component, ...rest }) => {
    const location = useLocation();
    const  from = location.pathname || '/app/main';
    //need to add in identity server.

    const authenticatedUser = null;

    if (authenticatedUser) {
        dispatch(login(authenticatedUser))
        return (
            <Redirect to={from} />
        );
    } else {
        return (
            <Route {...rest} render={props => (React.createElement(component, props))} />
        );
    }
};
