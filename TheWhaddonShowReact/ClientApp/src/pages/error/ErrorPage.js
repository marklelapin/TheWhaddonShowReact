import React, { useState } from 'react';

import {
    Container,
    Button,
} from 'reactstrap';

import { clearStateFromBrowserStorage } from '../../dataAccess/browserStorage';

import s from './ErrorPage.module.scss';

const ErrorPage = (props) => {

    const { code = 500, message = 'Sorry, it seems that something has gone wrong. Try refreshing the page or logging back in.', details = null, returnHome = false } = props;

    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails)
    }

    const handleReturnHome = () => {
        clearStateFromBrowserStorage();
        window.location.href = "/";
    }


    return (
        <div className={s.errorPage}>
            <Container>
                <div className={`${s.errorContainer} mx-auto`}>
                    <h1 className={s.errorCode}>{code}</h1>
                    <p className={s.errorInfo}>
                        {message}
                    </p>
                    {details &&
                        <>
                            <Button color="primary" className="mr-2" onClick={() => toggleDetails()}>Details</Button>
                            {showDetails &&
                                <p>{JSON.stringify(details)}</p>
                            }
                        </>
                    }
                    {returnHome && <Button color="primary" className="mr-2" onClick={handleReturnHome} >Reset and Return Home</Button>}
                </div>
            </Container>
        </div>
    );
}


export default ErrorPage;
