import React from 'react';
import {useState, useEffect} from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 

import TextareaAutosize from 'react-textarea-autosize';
import s from '../../../pages/forms/elements/Elements.module.scss';

function Staging(props) {

    const { scriptItem: staging, onChange, onBlur, onKeyDown } = props;

    return (

        <TextareaAutosize
            key={staging.id}
            placeholder="..."
            className={`form-control ${s.autogrow} transition-height scene-staging text-input`}
            value={staging.text || ''}
            onChange={(e) => onChange('text', e.target.value)}
            onBlur={onBlur}
            onKeyDown={(e) => onKeyDown(e)}
 
        />

    )

}

export default Staging;