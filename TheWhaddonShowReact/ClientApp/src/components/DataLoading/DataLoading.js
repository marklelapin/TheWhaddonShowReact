import React from 'react';
import Loader from '../../components/Loader'

export default class DataLoading extends React.Component {

    static defaultProps = {
        loadingText: 'Loading...',
        errorText: 'Error loading data.',
        spinnerSize: 0,
        isLoading: true,
        isError: false,
    }

   render() {

        const { loadingText, errorText, isLoading, isError, children, spinnerSize } = this.props;

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

        return <>{ children }</>
    }
    
}