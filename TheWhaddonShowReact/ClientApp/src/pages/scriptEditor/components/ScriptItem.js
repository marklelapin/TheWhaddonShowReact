import React from 'react';
import {useState, useEffect} from 'react'; 
import {useSelector, useDispatch} from 'react-redux'; 

function ScriptItem(props) {

    const { scriptItem } = props;

    const {  partIds, type, text } = scriptItem; 

    return (
        <>
            <h5>{type}:</h5><h6>{text}</h6>

        </>


    )
}

export default ScriptItem;