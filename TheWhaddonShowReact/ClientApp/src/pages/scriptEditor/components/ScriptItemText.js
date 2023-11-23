import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

//Components
import TextareaAutosize from 'react-autosize-textarea';
import ScriptItemControls from './ScriptItemControls';
import { log } from '../../../helper';


//Utilities
import { changeFocus } from '../../../actions/scriptEditor';
import { moveFocusToId } from '../scripts/utility';

//constants
import { HEADER_TYPES, INITIAL_CURTAIN, SONG, SOUND, SCENE, SYNOPSIS, DIALOGUE, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';
import { UP, DOWN, START, END, SCENE_END } from '../scripts/utility';

//css
import s from '../ScriptItem.module.scss';


function ScriptItemText(props) {

    //utils
    const debug = true;
    const dispatch = useDispatch()

    const endMargin = 100;

    //Props
    const { scriptItem,
        header,
        onChange,
        onClick,
        placeholder = "...",
        maxWidth = null,
        toggleMedia,
        previousFocusId = null,
        nextFocusId = null
    } = props;

    const { id, type, tags } = scriptItem

    log(debug, 'Component:ScriptItemText props', props)


    //REdux
    const focus = useSelector(state => state.scriptEditor.focus[scriptItem.id])
    const isUndoInProgress = useSelector(state => state.scriptEditor.isUndoInProgress)

    //Internal state
    const [tempTextValue, setTempTextValue] = useState(null)


    let finalPlaceholder;

    switch (type) {
        case SCENE: finalPlaceholder = 'enter title for scene'; break;
        case SYNOPSIS: finalPlaceholder = 'enter brief synopsis for scene'; break;
        case INITIAL_STAGING: finalPlaceholder = 'enter initial staging for scene'; break;
        case INITIAL_CURTAIN: finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }

    useEffect(() => {

        //makes the textarea the focus when created unless during an undo.
        const textInputRef = document.getElementById(`script-item-text-${id}`).querySelector('textarea')
        if (textInputRef && !isUndoInProgress) {
            textInputRef.focus();
        }
    }, [])

    const getContext = (type) => {
        try {
            const textInputRef = document.getElementById(`text-area-context-${type?.toLowerCase()}`)
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = window.getComputedStyle(textInputRef).font;
            return context;
        }
        catch {
            return null
        }

    }

    const finalText = tempTextValue || scriptItem.text

    const textToMeasure = finalText || finalPlaceholder

    const textToMeasureRows = textToMeasure.split('\n') || []

    const longestRow = textToMeasureRows.reduce((a, b) => (a.length > b.length) ? a : b, '');

    const context = getContext(type)

    const textMetrics = (context) ? context.measureText(longestRow) : { width: 0 }

    const idealWidth = textMetrics.width + endMargin

    const finalWidth = Math.max(endMargin, Math.min(maxWidth || idealWidth, idealWidth))

    const finalWidthPx = `${Math.floor(finalWidth)}px`


    //Event Handlers

    const handleTextChange = (e) => {
        log(debug, `EventsCheck: handleTextChange: ${e.target.value || ''} `)
        setTempTextValue(e.target.value || '')
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
            case 'toggleMedia':
                toggleMedia()
                break;
            case 'addComment': onChange('addComment', null); break;
            case 'goToComment': onClick('goToComment', null); break;
            default: return;
        }

    }

    const moveFocus = (direction, position) => {

        let newPosition;
        //moving up from scene is a special case where it needs to find the last item in the scene
        if (scriptItem.type === SCENE && direction === UP) {
            newPosition = SCENE_END;
        } else {
            newPosition = position || END;
        }

        const newId = (direction === DOWN) ? nextFocusId || scriptItem.nextId : previousFocusId || scriptItem.previousId

        log(debug, 'Component:ScriptItemText handleMoveFocus input:', { direction, position, previousFocusId, nextFocusId })
        log(debug, 'Component:ScriptItemText handleMoveFocus output:', { newId, newPosition })
        if (newId) {
            moveFocusToId(newId, newPosition)
        }

    }


    const handleKeyDown = (e, scriptItem) => {

        log(debug, `EventsCheck: ScriptItemTextKeyDown: key: ${e.key}`)
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

            if (!finalText || finalText === null || finalText === '') {
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
                if (finalText === null || finalText.length === 0) {
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

        if (e.key === 'Tab') {
            handleBlur();
        }
        log(debug, `EventsCheck: ScriptItemTextKeyDown: key: ${e.key}, tempTextValue = ${tempTextValue}`)
        if (e.ctrlKey && e.key === 'z' && tempTextValue === scriptItem.text) {
            setTempTextValue(null)
            onClick('undo')
        }

        if (e.ctrlKey && e.key === 'y' && isUndoInProgress) {
            onClick('redo')
        }


    }

    const handleFocus = () => {
        if (isUndoInProgress) { onClick('confirmUndo') }
        dispatch(changeFocus(scriptItem)) //update global state of which item is focussed
        toggleMedia(false)
    }


    const handleBlur = () => {
        log(debug, `EventsCheck: ScriptItemTextBlur: ${tempTextValue}`)

        if (tempTextValue || tempTextValue === '') {
            onChange('text', tempTextValue)
        }
        log(debug, 'showMedia handleBlur')
        toggleMedia(false)
    }

    return (
        <div id={`script-item-text-${id}`} className={s['script-item-text']}>

            {(header || type === DIALOGUE) &&
                <div className={s['script-item-header']}>
                    {header || 'no part'}
                </div>
            }

            <TextareaAutosize
                key={id}
                id={`script-item-text-input-${id}`}
                placeholder={finalPlaceholder}
                className={`form-control ${s.autogrow} transition-height text-input ${s['text-input']} text-input`}
                value={finalText}
                onChange={(e) => handleTextChange(e)}
                onBlur={() => handleBlur()}
                onFocus={() => handleFocus()}
                onKeyDown={(e) => handleKeyDown(e, scriptItem)}
                style={{ width: finalWidthPx }}
            //rows={getTextAreaRows().length}
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