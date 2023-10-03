import React from 'react';
import {useState, useEffect} from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import TextareaAutosize from 'react-autosize-textarea';
import s from 'pages/forms/elements/Elements.module.scss';

function Synopsis(props) {

    const {scriptItem: synopsis, onChange,onBlur,onKeyDown } = props;

    return (

            <TextareaAutosize
                    key={synopsis.id}
                    placeholder="..."
                    className={`form-control ${s.autogrow} transition-height scene-synopsis text-input`}
                    value={synopsis.text || ''}
                    onChange={(e) => onChange('text', e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={(e) => onKeyDown(e)}
                //nextFocusId={scenePartIds[0]}
                />

    )
    

}

export default Synopsis;