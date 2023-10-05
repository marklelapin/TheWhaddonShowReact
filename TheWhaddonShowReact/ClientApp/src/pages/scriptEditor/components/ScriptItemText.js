import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import TextareaAutosize from 'react-autosize-textarea';
import s from 'pages/forms/elements/Elements.module.scss';

function ScriptItemText(props) {

    const { scriptItem, onChange, onBlur, onFocus, onKeyDown, placeholder = "...", maxWidth = null } = props;

    const { id, text, type } = scriptItem

    let finalPlaceholder;

    switch (type) {
        case 'scene': finalPlaceholder = 'enter title for scene'; break;
        case 'synopsis': finalPlaceholder = 'enter brief synopsis for scene'; break;
        case 'initialStaging': finalPlaceholder = 'enter initial staging for scene'; break;
        case 'initialCurtain': finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }


    const handleChange = (e) => {

        onChange('text', e.target.value)
        adjustTextareaWidth(e.target)

    }

    useEffect(() => {

        const textareaRef = document.getElementById(`textarea-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }

    }, [])

    const adjustTextareaWidth = (element) => {
        if (element) {
            const textWidth = getTextWidth(element);

            let percentageWidth = '20%'

            if (maxWidth) {
                const percentage = Math.max(20, Math.min(100, (textWidth / maxWidth) * 100))
                percentageWidth = `${percentage}%`
            }

            element.style.width = percentageWidth;
        }
    };


    const getTextWidth = (element) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = window.getComputedStyle(element).font;
        const textMetrics = context.measureText(text);
        return textMetrics.width + 40;
    };



    return (

        <TextareaAutosize
            key={id}
            id={`textarea-${id}` }
            placeholder={finalPlaceholder}
            className={`form-control ${s.autogrow} transition-height script-item-${type} text-input`}
            value={text || ''}
            onChange={(e) => handleChange(e)}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={(e) => onKeyDown(e)}

        />

    )

}

export default ScriptItemText;