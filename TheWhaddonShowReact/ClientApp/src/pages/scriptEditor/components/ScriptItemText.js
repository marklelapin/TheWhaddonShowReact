import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import TextareaAutosize from 'react-autosize-textarea';
import ScriptItemControls from './ScriptItemControls';
import { log } from 'helper';


//Utilities
import { changeFocus } from 'actions/scriptEditor';

//css
import s from 'pages/forms/elements/Elements.module.scss';
import { HEADER_TYPES, INITIAL_CURTAIN, CURTAIN, SONG, SOUND, SCENE, SYNOPSIS, DIALOGUE, INITIAL_STAGING } from 'dataAccess/scriptItemTypes';
import { moveFocusToId } from '../scripts/utility';

function ScriptItemText(props) {

    //utils
    const debug = true;
    const dispatch = useDispatch()

    //constants
    const audioTypes = [SONG, SOUND]
    const videoTypes = [SONG, SOUND, SCENE, SYNOPSIS]
    const END = 'end'
    const START = 'start'
    const UP = 'up'
    const DOWN = 'down'

    //Props
    const { scriptItem, header, onChange, onClick, moveFocus, placeholder = "...", maxWidth = null } = props;

    const { id, type, tags } = scriptItem

    log(debug, 'ScriptItemTextProps', props)


    //REdux
    const focus = useSelector(state => state.scriptEditor.focus[scriptItem.id])

    //Internal state
    const [tempTextValue, setTempTextValue] = useState(null)
    const [textAreaRows, setTextAreaRows] = useState(1)

    let finalPlaceholder;

    switch (type) {
        case SCENE: finalPlaceholder = 'enter title for scene'; break;
        case SYNOPSIS: finalPlaceholder = 'enter brief synopsis for scene'; break;
        case INITIAL_STAGING: finalPlaceholder = 'enter initial staging for scene'; break;
        case INITIAL_CURTAIN: finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }



    useEffect(() => {
        
        adjustTextareaWidth()

        //males the textarea the focus when created.
        const textInputRef = document.getElementById(`script-item-text-${id}`).querySelector('textarea')
        if (textInputRef) {
            textInputRef.focus();
        }
    }, [])

    //Calculations / Utitlity functions

    const adjustTextareaWidth = () => {
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            const textWidth = getTextWidth();

            const finalWidth = Math.max(50, Math.min(maxWidth || textWidth, textWidth))
            //let percentageWidth = '20%'

            //if (maxWidth) {
            //    const percentage = Math.max(20, Math.min(100, (textWidth / maxWidth) * 100))
            //    percentageWidth = `${percentage}%`
            //}
            const finalWidthString = `${Math.floor(finalWidth)}px`
            log(debug, ` adjustTextareaWidth: ${textareaRef.id} : ${finalWidthString}`)
            textareaRef.style.width = finalWidthString;
        }
    };


    const text = () => {
        let finalText;
        if (tempTextValue === '') {
            finalText = tempTextValue
        } else {
            finalText = tempTextValue || scriptItem.text || ''
        }
        log(debug, `EventsCheck: final text: ${finalText}`)

        return finalText
    }


    const getTextAreaRows = () => {
        const latestText = text()

        let textRows = latestText.split('\n') || []

        return textRows

    }



    const getTextWidth = () => {
        const textInputRef = document.getElementById(`script-item-text-input-${id}`)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = window.getComputedStyle(textInputRef).font;

        let textOfLongestLine = getTextAreaRows().reduce((a, b) => (a.length > b.length) ? a : b, '');

        if (textOfLongestLine === '') {textOfLongestLine = finalPlaceholder }

        const textMetrics = context.measureText(textOfLongestLine);
        log(debug, `getTextWidth: ${textMetrics.width + 50}`)
        return textMetrics.width + 50;
    };







    //Event Handlers

    const handleTextChange = (e) => {
        log(debug, `EventsCheck: handleTextChange: ${e.target.value || ''} `)
        setTempTextValue(e.target.value || '')
        const textareaRef = document.getElementById(`script-item-text-${id}`)
        if (textareaRef) {
            adjustTextareaWidth(textareaRef)
        }
    }

    const handleControlsClick = (action, value) => {

        log(debug, `EventCheck: ScriptItemTextControlsClick: ${action},${value}`)
        switch (action) {
            case 'changeType': onChange('type', value); break;
            case 'toggleCurtain': onChange('toggleCurtain', value); break;
            case 'confirm': handleBlur(); break; //TODO- only show confirm if tempTextValue is not null.remove focus.
            case 'add':
                log(debug, 'EventsCheck: ScriptItemTextControlsClick: add')
                let text = tempTextValue;
                setTempTextValue(null)
                onChange('addScriptItemBelow', text);
                break;
            case 'delete': onClick('delete'); break;
            case 'undo': onClick('undo'); break;
            case 'redo': onClick('redo'); break;
            case 'attach':
                //TODO open file
                const filesToAdd = []
                onChange('addFiles', filesToAdd);
                break;
            case 'link':
                //TODO get linkg
                const linksToAdd = []
                onChange('addLinks', linksToAdd);
                break;
            default: return;
        }

    }

    const handleKeyDown = (e, scriptItem) => {


        const closestPosition = () => {
            const percentageAcoss = (e.target.selectionEnd / e.target.value.length)
            const closestPosition = (percentageAcoss > 0.5) ? END : START
            return closestPosition
        }


        if (e.shiftKey) {

            if (e.key === 'Enter') {  //allows new line to be entered in text-area
                /*   log(debugKeys,'it got here')*/
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const text = e.target.value;
                const newText = text.substring(0, start) + '\n' + text.substring(end);
                e.target.value = newText;
                e.target.selectionStart = start + 1;
                e.target.selectionEnd = start + 1;
                handleTextChange(e)
                return

            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()

            if (HEADER_TYPES.includes(scriptItem.type) && scriptItem.type !== INITIAL_CURTAIN) {
                moveFocus(DOWN, END)
                return;
            }
            let text = tempTextValue;


            if (e.target.selectionEnd === 0) {
               
                onChange('addScriptItemAbove', text)
            } else {
                onChange('addScriptItemBelow', text)
            }
            setTempTextValue(null)
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            moveFocus(UP, closestPosition())
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            moveFocus(DOWN, closestPosition())
            return
        }
        if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
            e.preventDefault()
            moveFocus(DOWN, START)
            return
        }
        if (e.key === 'ArrowLeft' && e.target.selectionEnd === 0) {
            e.preventDefault()
            moveFocus(UP, END)
            return
        }


        if (e.key === 'Backspace') {

            if (!text() || text() === null || text() === '') {
                e.preventDefault()
                onChange('deleteScriptItem', UP)
                return
            }

            if (e.target.selectionEnd === 0) {
                e.preventDefault()
                moveFocus(UP, END)
                return
            }
        }

        if (e.key === 'Delete') {

            log(debug, `EventsCheck: ScriptItemTextKeyDown: Delete ${tempTextValue}`)
            if (e.target.selectionStart === e.target.value.length) {
                e.preventDefault()
                log(debug, `eventsCheck: Delete STage 1:`)
                if (text() === null || text().length === 0) {
                    log(debug, 'eventsCheck: Delete STage 2')
                    onChange('deleteScriptItem', DOWN)
                    return
                }

                log(debug, 'eventsCheck: Delete STage 3')
                const nextScriptItemElement = document.getElementById(scriptItem.nextId)
                if (nextScriptItemElement) {
                    const textInputElement = nextScriptItemElement.querySelector('.text-input')
                    if (textInputElement) {
                        const nextScriptItemText = textInputElement.value

                        if (nextScriptItemText === null || nextScriptItemText.length === 0) {
                            e.preventDefault()
                            onChange('deleteNextScriptItem', UP)
                            return
                        } else {
                            e.preventDefault();
                            moveFocus(DOWN, START);
                            return;
                        }

                    }



                }

            }



        }

    }

    const handleFocus = () => {
        dispatch(changeFocus(scriptItem)) //update global state of which item is focussed
    }


    const handleBlur = () => {
        log(debug, `EventsCheck: ScriptItemTextBlur: ${tempTextValue}`)

        if (tempTextValue || tempTextValue === '') {
            onChange('text', tempTextValue)
        }
        setTempTextValue(null)
        adjustTextareaWidth()
    }

    return (
        <div id={`script-item-text-${id}`} className="script-item-text">

            {(header || type === DIALOGUE) &&
                <div className="script-item-header">
                    <small>{header || 'no part'}</small>
                </div>
            }


            <TextareaAutosize
                key={id}
                id={`script-item-text-input-${id}`}
                placeholder={finalPlaceholder}
                className={`form-control ${s.autogrow} transition-height text-input`}
                value={text()}
                onChange={(e) => handleTextChange(e)}
                onBlur={() => handleBlur()}
                onFocus={() => handleFocus()}
                onKeyDown={(e) => handleKeyDown(e, scriptItem)}
                rows={getTextAreaRows().length}
            >
            </TextareaAutosize>

            {(focus) &&
                <ScriptItemControls
                    scriptItem={scriptItem}
                    header={header}
                    onClick={(action, value) => handleControlsClick(action, value)}
                />
            }
        </div>
    )

}

export default ScriptItemText;