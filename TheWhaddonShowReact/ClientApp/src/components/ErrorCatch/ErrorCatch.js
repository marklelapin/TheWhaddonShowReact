import React, { useState, useEffect } from 'react';
import ErrorPage from '../../pages/error/ErrorPage';

const ErrorCatch = ({ children }) => {
    const [error, setError] = useState(null);

    const isProduction = process.env.NODE_ENV === 'production';

    useEffect(() => {

        if (isProduction) {
            const handleErrors = (error, errorInfo) => {
                // Log the error to an error reporting service (e.g., Sentry, LogRocket)
                console.error('Error:', error, errorInfo);
                setError(error);
            };

            window.addEventListener('error', handleErrors);

            return () => {
                window.removeEventListener('error', handleErrors);
            };
        }

    }, []);

    if (error) {
        // Render fallback UI
        return <ErrorPage code={error.code || 500} message={'Sorry, an error has occured in the app.'} returnHome={true} />;
    }

    // Render children normally
    return <>{children}</>;
};

export default ErrorCatch;
