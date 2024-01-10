import React from 'react';
import Loader from '../../components/Loader'

 const DataLoading = (props) => {

    const { loadingText = 'Loading...',
        errorText = 'Error loading data.',
        isLoading = true,
        isError = false,
        children,
        spinnerSize = 0 } = props;


    if (isLoading && !isError) {

        if (spinnerSize === 0) {
            return <span>{loadingText}</span>
        }

        return (
            <>
                < span > {loadingText}</span >
                <Loader size={spinnerSize} />
            </>

        )

    }

    if (isError) {
        return <span>{errorText}</span>
    }

    return <>{children}</>
}
    
export default DataLoading;