import React from 'react';
import { useNavigate } from 'react-router-dom';
/*import { useSelector } from 'react-redux';*/
import theWhaddonShowApiSnapshot from '../../images/the-whaddon-show-api-snapshot.png';
import apiMonitor from '../../images/api-monitor.png';

//Components

import classnames from 'classnames';
import s from './ApiDocumentation.module.scss';
//import ResultsTable from './components/ResultsTable';


const ApiDocumentation = () => {

    const navigate = useNavigate();

    const handleImageLinkClick = (e, path) => {
        console.log('handleImageLinkClick')
        e.preventDefault();
        navigate(path)
    }
    return (
        <>
            <h1>The Whaddon Show Api</h1>
            <div className={s.apiDocumentationPage}>

                <p>The Whaddon Show App is built with a React frontend and c#/.Net backend.</p>
                <p>{`This in turn accesses a public facing API giving role based read and write permissions to The Whaddon Show's central SQL database with authentication managed through Azure AdB2C`}</p>
                <p>Check out the <a href="https://thewhaddonshowapi.azurewebsites.net">Whaddon Show APIs documentation</a> and (if you really want to!) try it out!</p >

                <a href='https://thewhaddonshowapi.azurewebsites.net' rel='noreferrer' title='https://thewhaddonshowapi.azurewebsites.net' target='_blank' className={classnames(s.apiImage, s.documentationImage)}>
                    <img src={theWhaddonShowApiSnapshot} alt="API Documentation" />
                </a>

                <h2>Api Monitor</h2>
                <p>An Api Monitoring service built using Azure Functions in c# runs the api periodically to check its reliability and performance.</p>
                <p>{`Check out the `}<a href="/app/api/monitor">API Monitor Dashboard</a> {`to see how well it's doing!`}</p>
                <a href='/app/api/monitor' className={classnames(s.apiImage, s.apiMonitorImage)} onClick={(e) => handleImageLinkClick(e, '/app/api/monitor')}>
                    <img src={apiMonitor} alt="API Documentation" />
                </a>

            </div>
        </>

    )

}
export default ApiDocumentation;

