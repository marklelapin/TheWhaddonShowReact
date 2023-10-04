import React from 'react';
import {useState, useEffect} from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 

import TextareaAutosize from 'react-autosize-textarea';
import s from 'pages/forms/elements/Elements.module.scss';

function ScriptItemText(props) {

    const { scriptItem, onChange, onBlur, onFocus, onKeyDown, placeholder = "..." } = props;

    const {id,text,type } = scriptItem


    let finalPlaceholder;

    switch (type) {
        case 'scene': finalPlaceholder = 'enter title for scene'; break;
        case 'synopsis': finalPlaceholder = 'enter brief synopsis for scene'; break;
        case 'initialStaging': finalPlaceholder = 'enter initial staging for scene'; break;
        case 'initialCurtain': finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }
    


    return (

        <TextareaAutosize
            key={id}
            placeholder={finalPlaceholder}
            className={`form-control ${s.autogrow} transition-height script-item-${type} text-input`}
            value={text || ''}
            onChange={(e) => onChange('text', e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={(e) => onKeyDown(e)}
 
        />

    )

}

export default ScriptItemText;