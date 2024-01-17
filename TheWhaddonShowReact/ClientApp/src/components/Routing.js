//import Login from '../pages/auth/login';

import React, { useLocation } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import Script from '../pages/scriptEditor/Script';
import ScriptSummary from '../pages/scriptSummary/ScriptSummary';
import UnderConstruction from '../pages/underConstruction/UnderConstruction';
import Users from '../pages/user/Users';
import TestResults from '../pages/apiMonitor/TestResults';
import ErrorPage from '../pages/error/ErrorPage';

import {SHOW } from '../pages/scriptSummary/ScriptSummary'


const Routing = () => {

    //const currentUser = useSelector(state => state.user.currentUser)

    return (
        <Routes>
            <Route path="/app/home" element={<Home />} />
            <Route path="/app/loginlink" element={<Home />} />
            <Route path="/app/script" element={<Script />} />
            <Route path="/app/scriptsummary" element={<ScriptSummary summaryType={SHOW} fixed={false} />} />
            <Route path="/app/casting" element={<UnderConstruction />} />
            <Route path="/app/gallery" element={<UnderConstruction/>} />
            <Route path="/app/users" element={<Users/>} />
            <Route path="/app/api" element={<TestResults/>} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/app/home" />} />
        </Routes>
    )
}

export default Routing;