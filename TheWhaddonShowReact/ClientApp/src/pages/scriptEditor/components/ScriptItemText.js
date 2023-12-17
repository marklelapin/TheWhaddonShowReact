import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    trigger,
    UPDATE_TEXT,
    ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM,
    DELETE_NEXT_SCRIPT_ITEM,
    UNDO,
    REDO,
    CONFIRM_UNDO
} from '../../../actions/scriptEditor';

//Components
import TextareaAutosize from 'react-autosize-textarea';
import ScriptItemControls, { CONFIRM } from './ScriptItemControls';
import ScriptItemHeader from './ScriptItemHeader';
import { log, SCRIPT_ITEM_TEXT as logType } from '../../../logging';


//Utilities
import { updateScriptItemInFocus } from '../../../actions/scriptEditor';
import { moveFocusFromScriptItem } from '../scripts/utility';

//constants
import { HEADER_TYPES, INITIAL_CURTAIN, ACTION,LIGHTING, SOUND, SCENE, SYNOPSIS, DIALOGUE, STAGING, INITIAL_STAGING, TYPES_WITH_HEADER } from '../../../dataAccess/scriptItemTypes';
import { UP, DOWN, START, END, ABOVE, BELOW, SCENE_END } from '../scripts/utility';

//css
import s from '../ScriptItem.module.scss';


function ScriptItemText(props) {

    //utils
    const dispatch = useDispatch()

    const defaultEndMargin = 100;

    //Props
    const { scriptItem,
        placeholder = "...",
        toggleMedia,
        previousFocusId = null,
        nextFocusId = null,
        isUndoInProgress = false
    } = props;

    const { id, type } = scriptItem

    const undoInProgress = isUndoInProgress
    const undoNotInProgress = !undoInProgress


    //Redux
    const focus = useSelector(state => state.scriptEditor.scriptItemInFocus[scriptItem.id])
    const maxWidth = useSelector(state => state.scriptEditor.maxScriptItemTextWidth)

    //Internal state
    const [tempTextValue, setTempTextValue] = useState(null)
    const [redoTempTextValue, setRedoTempTextValue] = useState(null)
    const [isFocused, setIsFocused] = useState(false);
    const [isBeingDeleted, setIsBeingDeleted] = useState(false)
    const [finalWidthPx, setFinalWidthPx] = useState(null)
    const [endMargin,setEndMargin] = useState(defaultEndMargin)

    let finalPlaceholder;

    const finalText = (tempTextValue === null) ? scriptItem.text : tempTextValue;

    switch (type) {
        case SCENE: finalPlaceholder = 'enter title for scene'; break;
        case SYNOPSIS: finalPlaceholder = 'enter brief synopsis for scene'; break;
        case INITIAL_STAGING: finalPlaceholder = 'enter initial staging for scene'; break;
        case INITIAL_CURTAIN: finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }

    useEffect(() => {
        log(logType, 'props', { props })

        setFinalWidthPx(getFinalWidth())

        //makes the textarea the focus when created unless during an undo or if the item has already been updated on the server (entered by someone else in which case you don't want it to be your focus)
        const textInputRef = document.getElementById(`script-item-text-${id}`).querySelector('textarea')
        if (textInputRef && undoNotInProgress && scriptItem.updatedOnServer === null) {
            textInputRef.focus();
        }
    }, [])

    useEffect(() => {
        setFinalWidthPx(getFinalWidth())
    }, [tempTextValue, scriptItem.text, maxWidth, endMargin])

    useEffect(() => {
        setTempTextValue(null)
    },[scriptItem.text])

    //log(logType, 'width props', { maxWidth, endMargin, finalWidthPx })

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

    const getFinalWidth = () => {

        const textToMeasure = finalText || finalPlaceholder

        const textToMeasureRows = textToMeasure.split('\n') || []

        const longestRow = textToMeasureRows.reduce((a, b) => (a.length > b.length) ? a : b, '');

        const context = getContext(type)

        const textMetrics = (context) ? context.measureText(longestRow) : { width: 0 }

        const idealWidth = textMetrics.width + endMargin

        const finalWidth = Math.max(endMargin, Math.min(maxWidth || idealWidth, idealWidth))

        const finalWidthPx = `${Math.floor(finalWidth)}px`

        return finalWidthPx;
    }


    //Event Handlers

    const handleTextChange = (e) => {
        log(logType, `handleTextChange: ${e.target.value || ''} `)
        setEndMargin(100)
        setTempTextValue(e.target.value || '')
    }

    const handleControlsClick = (action, value) => {

        log(logType, 'handlesControlsClick: ', { action, value })

        switch (action) {
            case CONFIRM: moveFocus(DOWN, END); break; //TODO- only show confirm if tempTextValue is not null.remove focus.
            case ADD_SCRIPT_ITEM:
                dispatch(trigger(ADD_SCRIPT_ITEM, { position: BELOW, scriptItem: scriptItem, tempTextValue }))
                setTempTextValue(null)
                break;
            default: return;
        }

    }

    const moveFocus = (direction, position) => {

        moveFocusFromScriptItem(scriptItem, direction, position, nextFocusId, previousFocusId)

    }


    const handleKeyDown = (e, scriptItem) => {

        log(logType, 'handleKeyDown: ', { key: e.key, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, tempTextValue })
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

            if (e.target.selectionEnd === 0) {

                dispatch(trigger(ADD_SCRIPT_ITEM, { position: ABOVE, scriptItem: scriptItem, tempTextValue }))
            } else {
                dispatch(trigger(ADD_SCRIPT_ITEM, { position: BELOW, scriptItem: scriptItem, tempTextValue }))
            }
            setTempTextValue(null)
            return
        }
        if (e.key === 'ArrowUp') {
            if (e.target.selectionEnd === 0) {
                e.preventDefault()
                moveFocus(UP, END)
            }
            return
        }
        if (e.key === 'ArrowDown') {
            if (e.target.selectionStart === e.target.value.length) {
                e.preventDefault()
                moveFocus(DOWN, START)
            }
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

                dispatch(trigger(DELETE_SCRIPT_ITEM, { scriptItem, direction: UP }))

                return
            }

            if (e.target.selectionEnd === 0) {
                e.preventDefault()
                moveFocus(UP, END)
                return
            }
        }

        if (e.key === 'Delete') {

            if (e.target.selectionStart === e.target.value.length) {
                e.preventDefault()
                if (finalText === null || finalText.length === 0) {

                    setIsBeingDeleted(true)
                    dispatch(trigger(DELETE_SCRIPT_ITEM, { scriptItem, direction: DOWN }))
                    log(logType, 'key: delete post dispatch')
                    return
                }


                const nextScriptItemElement = document.getElementById(scriptItem.nextId)
                if (nextScriptItemElement) {
                    const textInputElement = nextScriptItemElement.querySelector('.text-input')
                    if (textInputElement) {
                        const nextScriptItemText = textInputElement.value

                        if (nextScriptItemText === null || nextScriptItemText.length === 0) {
                            e.preventDefault()
                            dispatch(trigger(DELETE_NEXT_SCRIPT_ITEM, { scriptItem, direction: UP }))
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
            e.preventDefault()
            moveFocus(DOWN, END)
        }

        if (e.ctrlKey && e.key === 'z' && tempTextValue === scriptItem.text) {
            if (tempTextValue !== null) {
                setRedoTempTextValue(tempTextValue)
                setTempTextValue(null)
            } else {
                dispatch(trigger(UNDO, { sceneId: scriptItem.parentId }))
            }
        }

        if (e.ctrlKey && e.key === 'y' && undoInProgress) {
            if (undoNotInProgress && redoTempTextValue !== null) {
                setTempTextValue(redoTempTextValue)
                setRedoTempTextValue(null)
            } else {
                dispatch(trigger(REDO, { sceneId: scriptItem.parentId }))
            }

        }


    }

    const handleFocus = () => {
        setIsFocused(true)
        dispatch(updateScriptItemInFocus(scriptItem.id, (scriptItem.type === SCENE) ? scriptItem.id : scriptItem.parentId)) //update global state of which item is focussed
        toggleMedia(false)
    }


    const handleBlur = (e) => {
        
        if (isBeingDeleted !== true) {
            log(logType, 'handleBlur: ', { scriptItemText: scriptItem.text, eventTextValue: e.target.value })
            setEndMargin(defaultEndMargin)
            setIsFocused(false)
            if (scriptItem.text !== e.target.value) {
                log(logType, 'dispatch update text', { scriptItem, value: e.target.value })
                dispatch(trigger(UPDATE_TEXT, { scriptItem, value: e.target.value }))
            }
            toggleMedia(false)
        }

    }



    return (
        <div id={`script-item-text-${id}`} className={s['script-item-text']}>

            <ScriptItemHeader scriptItem={scriptItem} />

            {[ACTION, LIGHTING, SOUND].includes(scriptItem.type) && <div className={s['open-bracket']}>(</div>}
            <TextareaAutosize
                key={id}
                id={`script-item-text-input-${id}`}
                placeholder={finalPlaceholder}
                className={`form-control ${s.autogrow} transition-height text-input ${s['text-input']} text-input ${isFocused ? s['focused'] : ''}`}
                value={finalText}
                onChange={(e) => handleTextChange(e)}
                onBlur={(e) => handleBlur(e)}
                onFocus={() => handleFocus()}
                onKeyDown={(e) => handleKeyDown(e, scriptItem)}
                style={{ width: finalWidthPx }}
            //rows={getTextAreaRows().length}
            >
            </TextareaAutosize>
            {[ACTION,LIGHTING,SOUND].includes(scriptItem.type) && <div className ={s['close-bracket']}>)</div>}

            {(focus) &&
                <ScriptItemControls
                    key={`script-item-controls-${id}`}
                    scriptItem={scriptItem}
                    header={TYPES_WITH_HEADER.includes(scriptItem.type)}
                    onClick={handleControlsClick}
                    toggleMedia={toggleMedia}
                />
            }
        </div>
    )

}

export default ScriptItemText;