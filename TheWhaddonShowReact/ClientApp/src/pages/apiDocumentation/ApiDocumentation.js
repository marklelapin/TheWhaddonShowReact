import React from 'react';
/*import { useSelector } from 'react-redux';*/
import theWhaddonShowApiSnapshot from '../../images/the-whaddon-show-api-snapshot.png';

import classnames from 'classnames'
//Components

import s from './ApiDocumentation.module.scss';
//import ResultsTable from './components/ResultsTable';

const ApiDocumentation = () => {


    return (
        <div className={s.apiDocumentationPage}>
            <h1>Api Monitor</h1>
            <p>The Whaddon Show App is built with a React frontend and c#/.Net backend.</p>
            <p>{`This in turn accesses a public facing API giving role based read and write permissions to The Whaddon Show's central SQL database with authentication managed through Azure AdB2C`}</p>
            <p>Check out the <a href="https://thewhaddonshowapi.azurewebsites.net">Whaddon Show APIs documentation</a> and (if you really want to!) try it out!</p >
            <div className={classnames(s.container,'clickable')}>
                <img src={theWhaddonShowApiSnapshot} alt="API Documentation"/>
            </div>
        </div>
    )

}
export default ApiDocumentation;

