//import Login from '../pages/auth/login';

import React from 'react';
import { Redirect, Route } from 'react-router';


const logOutUser = () => {

    //Todo: when new authentication module is added.
}


export const ByPassRoute = ({ dispatch, component, ...rest }) => {
    return (
        <Route {...rest} render={props => (React.createElement(component, props))} />
    );
}


//export const AdminRoute = ({currentUser, dispatch, component, ...rest}) => {
//  if (!currentUser || currentUser.role !== 'admin' || !Login.isAuthenticated(localStorage.getItem('token'))) {
//    return (<Redirect to="/app/main"/>)
//  } else if (currentUser && currentUser.role === 'admin') {
//    return (
//      <Route {...rest} render={props => (React.createElement(component, props))}/>
//    );
//  }
//};

//export const UserRoute = ({dispatch, component, ...rest}) => {
//  if (!Login.isAuthenticated()) {
//    logOutUser()
//    return (<Redirect to="/login"/>)
//  } else {
//    return ( // eslint-disable-line
//      <Route {...rest} render={props => (React.createElement(component, props))}/>
//    );
//  }
//};

//export const AuthRoute = ({dispatch, component, ...rest}) => {
//  const {from} = rest.location.state || {from: {pathname: '/app'}};

//  if (Login.isAuthenticated()) {
//    return (
//      <Redirect to={from}/>
//    );
//  } else {
//    return (
//      <Route {...rest} render={props => (React.createElement(component, props))}/>
//    );
//  }
//};
