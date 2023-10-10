import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import TextareaAutosize from 'react-autosize-textarea';
import ScriptItemControls from './ScriptItemControls';
import { log } from 'helper';
//css
import s from 'pages/forms/elements/Elements.module.scss';

function ScriptItemText(props) {

    const debug=true

    const { scriptItem, header, inFocus, onChange, onBlur, onFocus, onKeyDown, placeholder = "...", maxWidth = null } = props;

    const { id, text, type } = scriptItem

    log(debug, 'ScriptItemTextProps', props)

   // const textareaRef = document.getElementById(`script-item-text-${id}`)

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
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }
    }

    useEffect(() => {
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }

    }, [])

    const adjustTextareaWidth = (element) => {
        if (element) {
            const textWidth = getTextWidth();

            const finalWidth = Math.max(50, Math.min(maxWidth, textWidth))
            //let percentageWidth = '20%'

            //if (maxWidth) {
            //    const percentage = Math.max(20, Math.min(100, (textWidth / maxWidth) * 100))
            //    percentageWidth = `${percentage}%`
            //}
            const finalWidthString = `${Math.floor(finalWidth)}px`

            element.style.width = finalWidthString;
        }
    };


    const getTextWidth = () => {
        const textInputRef = document.getElementById(`script-item-text-input-${id}`)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = window.getComputedStyle(textInputRef).font;
        const textMetrics = context.measureText(text);
        return textMetrics.width + 50;
    };



    return (
        <div id={`script-item-text-${id}` } className="script-item-text">

        { header &&

        <div className="script-item-header">
                    <small>{header}</small>
        </div>
                }


        <TextareaAutosize
                key={id}
                id={`script-item-text-input-${id}`}
                placeholder={finalPlaceholder}
                className={`form-control ${s.autogrow} transition-height text-input`}
                value={text || ''}
                onChange={(e) => handleChange(e)}
                onBlur={onBlur}
                onFocus={onFocus}
                onKeyDown={(e) => onKeyDown(e)}
                style={{ width: '100%' }}            >
        </TextareaAutosize>

            {(inFocus) &&
                <div className="script-item-controls">
                    <ScriptItemControls />
                </div>
            }
        </div>
    )

}

export default ScriptItemText;