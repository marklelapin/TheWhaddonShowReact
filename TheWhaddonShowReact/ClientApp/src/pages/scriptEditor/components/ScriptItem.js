import React from 'react';
import {useState, useEffect} from 'react'; 
import {useSelector, useDispatch} from 'react-redux'; 

function ScriptItem(props) {

    const { scriptItem } = props;

    const {  partIds } = scriptItem; 

    return (
        partIds.map((partId) => {
            return (
<h2>{partId}</h2>
            )
            
        })
    )
}

export default ScriptItem;