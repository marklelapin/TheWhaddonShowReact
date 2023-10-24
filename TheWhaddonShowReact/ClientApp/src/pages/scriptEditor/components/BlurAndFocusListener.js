import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function BlurAndFocusListener(props) {

    const { children, onBlur, onFocus } = props;

    const blurAndFocusRef = useRef(null)
    //ADD FOCUS AND BLUR EVENT LISTENERS
    //--------------------------------------------------------------------------------------------------------
    useEffect(() => {

        const element = blurAndFocusRef.current;

        if (element) {
            element.addEventListener('focus', onFocus, true);
            element.addEventListener('blur', onBlur, true);
        }

        return () => {
            if (element) {
                element.removeEventListener('focus', onFocus, true);
                element.removeEventListener('blur', onBlur, true);
            }
        }
    }
        , []
    )

    return (
        < div ref={blurAndFocusRef} >
            {children}
        </div >
    )
}

export default BlurAndFocusListener;