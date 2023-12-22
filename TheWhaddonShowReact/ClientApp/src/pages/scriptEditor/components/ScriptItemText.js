import React from 'react';
import { useEffect, useState, useLayoutEffect } from 'react';
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
import { curtainText } from '../scripts/curtain';
import { updateScriptItemInFocus } from '../../../actions/scriptEditor';
import { moveFocusFromScriptItem } from '../scripts/utility';
import { getTextAreaWidthPx } from '../scripts/layout';

//constants
import { HEADER_TYPES, INITIAL_CURTAIN, ACTION, LIGHTING, SOUND, SCENE, SYNOPSIS, DIALOGUE, STAGING, INITIAL_STAGING, TYPES_WITH_HEADER, CURTAIN_TYPES, CURTAIN, ACT } from '../../../dataAccess/scriptItemTypes';
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
        previousCurtainOpen = null,
        previousFocusId = null,
        nextFocusId = null,
        isUndoInProgress = false
    } = props;

    const { id, type } = scriptItem

    const undoInProgress = isUndoInProgress
    const undoNotInProgress = !undoInProgress


    //Redux
    const focus = useSelector(state => state.scriptEditor.scriptItemInFocus[scriptItem.id])
    const showSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const showComments = useSelector(state => state.scriptEditor.showComments)

    //Internal state
    const [tempTextValue, setTempTextValue] = useState(null)
    const [isFocused, setIsFocused] = useState(false);
    const [isBeingDeleted, setIsBeingDeleted] = useState(false)
    const [endMargin, setEndMargin] = useState(defaultEndMargin)


    let finalPlaceholder;
    switch (type) {
        case SCENE: finalPlaceholder = 'enter title for scene'; break;
        case SYNOPSIS: finalPlaceholder = 'enter brief synopsis for scene'; break;
        case INITIAL_STAGING: finalPlaceholder = 'enter initial staging for scene'; break;
        case INITIAL_CURTAIN: finalPlaceholder = 'enter initial curtain for scene'; break;
        default: finalPlaceholder = placeholder;
    }

    const finalText = getFinalText(scriptItem, tempTextValue, previousCurtainOpen)
    const finalWidthPx = getTextAreaWidthPx(finalText, finalPlaceholder, scriptItem.type, endMargin, showSceneSelector, showComments)

    useEffect(() => {
        log(logType, 'props', { props })

        //makes the textarea the focus when created unless during an undo or if the item has already been updated on the server (entered by someone else in which case you don't want it to be your focus)
        const textInputRef = document.getElementById(`script-item-text-${id}`).querySelector('textarea')
        if (textInputRef && undoNotInProgress && scriptItem.updatedOnServer === null) {
            textInputRef.focus();
        }
    }, [])

    useEffect(() => {
        setTempTextValue(null)
    }, [scriptItem.text])





    //Event Handlers

    const handleTextChange = (e) => {
        log(logType, `handleTextChange: ${e.target.value || ''} `)
        setEndMargin(100)
        let newTempTextValue = e.target.value || ''
        newTempTextValue = addBrackets(scriptItem.type, newTempTextValue)

        setTempTextValue(newTempTextValue)
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        setEndMargin(100)
        setTempTextValue(pastedText)
    }

    const handleControlsClick = (e, action) => {
        e.preventDefault();
        log(logType, 'handlesControlsClick: ', { action })

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

        if (e.ctrlKey && e.key === 'z' && (tempTextValue === null || tempTextValue === '')) {
            //if (tempTextValue !== null) {
            //    setRedoTempTextValue(tempTextValue)
            //    setTempTextValue(null)
            //} else {
            dispatch(trigger(UNDO, { sceneId: scriptItem.parentId }))
            //}
        }

        if (e.ctrlKey && e.key === 'y' && undoInProgress) {
            //if (undoNotInProgress && redoTempTextValue !== null) {
            //    setTempTextValue(redoTempTextValue)
            //    setRedoTempTextValue(null)
            //} else {
            dispatch(trigger(REDO, { sceneId: scriptItem.parentId }))
            //}

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
            let targetText = e.target.value || ''
            targetText = removeBrackets(scriptItem.type, targetText)

            if (scriptItem.text !== targetText) {
                log(logType, 'dispatch update text', { scriptItem, value: targetText })
                dispatch(trigger(UPDATE_TEXT, { scriptItem, value: targetText }))
            }
            toggleMedia(false)
        }

    }


    return (
        <div id={`script-item-text-${id}`} className={s['script-item-text']}>

            <ScriptItemHeader scriptItem={scriptItem} />

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
                onPaste={(e) => handlePaste(e)}
            //rows={getTextAreaRows().length}
            >
            </TextareaAutosize>

            {(focus) &&
                <ScriptItemControls
                    key={`script-item-controls-${id}`}
                    scriptItem={scriptItem}
                    header={TYPES_WITH_HEADER.includes(scriptItem.type)}
                    onClick={(e, action) => handleControlsClick(e, action)}
                    toggleMedia={toggleMedia}
                />
            }
        </div>
    )

}

export default ScriptItemText;





const addBrackets = (type, text) => {
    return changeBrackets(type, text, true)
}

const removeBrackets = (type, text) => {
    return changeBrackets(type, text, false)
}

const changeBrackets = (type, text, addBrackets) => {

    let output = text;
    if (![ACTION, LIGHTING, SOUND].includes(type)) { return output }

    switch (addBrackets) {
        case true:
            if (output[0] !== '(') { output = `(${output}` }
            if (output[output.length - 1] !== ')') { output = `${output})` }
            return output;
        case false:
            if (output[0] === '(') { output = output.substring(1) }
            if (output[output.length - 1] === ')') { output = output.substring(0, output.length - 1) }
            return output;
        default: return output;
    }

}

const getFinalText = (scriptItem, tempTextValue, previousCurtainOpen) => {
    log(logType, 'getFinalText', { id: scriptItem.id, scriptItemText: scriptItem.text, tempTextValue, previousCurtainOpen })
    let finalText = scriptItem.text //default
    finalText = addBrackets(scriptItem.type, finalText) //adds brackets according to rules set out within addBrackets function
    if (CURTAIN_TYPES.includes(scriptItem.type)) {
        finalText = curtainText(scriptItem, previousCurtainOpen)
        log(logType, 'getFinalText curtain_types:', { finalText, scriptItem })
    } else if (tempTextValue !== null) {
        finalText = tempTextValue;
    }

    return finalText
}

