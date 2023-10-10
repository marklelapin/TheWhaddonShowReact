import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import TextareaAutosize from 'react-autosize-textarea';
import ScriptItemControls from './ScriptItemControls';
import { log } from 'helper';


//Utilities
import { changeFocus } from 'actions/navigation';

//css
import s from 'pages/forms/elements/Elements.module.scss';
import { INITIAL_CURTAIN, CURTAIN, SONG, SOUND, SCENE, SYNOPSIS } from 'dataAccess/scriptItemTypes';

function ScriptItemText(props) {

    //utils
    const debug = true
    const dispatch = useDispatch()

    //constants
    const audioTypes = [SONG, SOUND]
    const videoTypes = [SONG, SOUND, SCENE, SYNOPSIS]



    //Props
    const { scriptItem, header, onChange, onBlur, onKeyDown, placeholder = "...", maxWidth = null } = props;

    const { id, text, type, tags } = scriptItem

    log(debug, 'ScriptItemTextProps', props)

    //Redux
    const focus = useSelector(state => state.scriptEditor.focus[id])

    //internal State
    /*   const [textValue, setTextValue] = useState(null)*/


    let finalPlaceholder;

    switch (type) {
        case 'scene': finalPlaceholder = 'enter title for scene'; break;
        case 'synopsis': finalPlaceholder = 'enter brief synopsis for scene'; break;
        case 'initialStaging': finalPlaceholder = 'enter initial staging for scene'; break;
        case 'initialCurtain': finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }

    useEffect(() => {
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }

    }, [])



    //Calculations / Utitlity functions

    const openCurtain = () => {

        if (type === INITIAL_CURTAIN || type === CURTAIN) {
            return tags.includes('OpenCurtain')
        }

        return null
    }

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







    //Event Handlers

    const handleChange = (e) => {

        onChange('text', e.target.value)
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }
    }

    const handleControlsClick = (action, value) => {

        switch (action) {
            case 'changeType': onChange('type', value); break;
            case 'toggleCurtain': onChange('toggleCurtain', value); break;
            default: return;
        }

    }


    const handleFocus = () => {

        dispatch(changeFocus(scriptItem)) //update global state of which item is focussed


    }


    return (
        <div id={`script-item-text-${id}`} className="script-item-text">

            {header &&
                <div className="script-item-header">
                    <small>{header}</small>
                </div>
            }


            <TextareaAutosize
                key={id}
                id={`script-item-text-input-${id}`}
                placeholder={finalPlaceholder}
                className={`form-control ${s.autogrow} transition-height text-input`}
                value={text}
                onChange={(e) => handleChange(e)}
                onBlur={onBlur}
                onFocus={()=>handleFocus()}
                onKeyDown={(e) => onKeyDown(e)}
            >
            </TextareaAutosize>

            {(focus) &&
                <div className="script-item-controls">
                    <ScriptItemControls
                        onClick={(action, value) => handleControlsClick(action, value)}
                        addAudio={audioTypes.includes(type)}
                        addVideo={videoTypes.includes(type)}
                        openCurtain={openCurtain()}
                    />
                </div>
            }
        </div>
    )

}

export default ScriptItemText;