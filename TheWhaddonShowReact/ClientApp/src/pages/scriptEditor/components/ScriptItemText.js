import React from 'react';
import { useEffect, useState, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    updateScriptItemTextWidth,
    trigger,
    UPDATE_TEXT,
    ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM,
    DELETE_NEXT_SCRIPT_ITEM,
    UNDO,
    REDO,
    updateMovementInProgress
} from '../../../actions/scriptEditor';

//Components
import TextareaAutosize from 'react-textarea-autosize';
import ScriptItemControls, { CONFIRM } from './ScriptItemControls';
import ScriptItemHeader from './ScriptItemHeader';
import { log, SCRIPT_ITEM_TEXT as logType } from '../../../dataAccess/logging';


//Utilities
import { curtainText } from '../scripts/curtain';
import { updateSceneInFocus, updateScriptItemInFocus} from '../../../actions/scriptEditor';
import { moveFocusFromScriptItem } from '../scripts/utility';

import { getScriptItemPlaceholder } from '../scripts/scriptItem'
import classnames from 'classnames';
//constants
import { HEADER_TYPES, INITIAL_CURTAIN, ACTION, LIGHTING, SOUND, SCENE, TYPES_WITH_HEADER, CURTAIN_TYPES } from '../../../dataAccess/scriptItemTypes';
import { UP, DOWN, START, END, ABOVE, BELOW } from '../scripts/utility';
import { DEFAULT_END_MARGIN, CHAT,CLASSIC } from '../scripts/layout';

//css
import s from '../ScriptItem.module.scss';
import { ElementInViewObserver } from '../../../components/ElementInViewObserver/ElementInViewObserver';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';
import { isMobileDevice } from '../../../core/screenHelper';


function ScriptItemText(props) {

    //utils
    const dispatch = useDispatch()

    //Props
    const { scriptItem,
        toggleMedia,
        previousCurtainOpen = null,
        previousFocusId = null,
        nextFocusId = null,
        isUndoInProgress = false,
        sceneNumber = null,
        viewStyle = CHAT
    } = props;

    const { id, type } = scriptItem

    const undoInProgress = isUndoInProgress
    const undoNotInProgress = !undoInProgress


    //Redux
    const focus = useSelector(state => state.scriptEditor.scriptItemInFocus[scriptItem.id])
    const textWidth = useSelector(state => state.scriptEditor.scriptItemTextWidths[scriptItem.id]) //used to control when to re-render for text width.
    const textWidthPx = (viewStyle === CHAT) ? `${textWidth}px` : '100%';
    const currentUser = useSelector(state => state.user.currentUser)
    const printScript = useSelector(state => state.scriptEditor.printScript)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)
    const readOnly = isScriptReadOnly(currentUser, isMobileDevice, printScript)
   
    // const storedTextWidth = useSelector(state => state.scriptEditor.scriptItemTextWidths[scriptItem.id]) || null
    //log(logType,'storedTextWidth',storedTextWidth)
    //Internal state
    const [tempTextValue, setTempTextValue] = useState(null)
    const [isFocused, setIsFocused] = useState(false);
    const [isBeingDeleted, setIsBeingDeleted] = useState(false)
    const [endMargin, setEndMargin] = useState(DEFAULT_END_MARGIN)

    const finalPlaceholder = getScriptItemPlaceholder(scriptItem.type)




    useEffect(() => {
        //    log(logType, 'props', { props })
        //makes the textarea the focus when created unless during an undo or if the item has already been updated on the server (entered by someone else in which case you don't want it to be your focus)
        const textInputRef = document.getElementById(`script-item-text-${id}`).querySelector('textarea')
        if (textInputRef && undoNotInProgress && scriptItem.updatedOnServer === null) {
            textInputRef.focus();
        }

    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setTempTextValue(null)
    }, [scriptItem.text])

    const finalText = getFinalText(scriptItem, tempTextValue, previousCurtainOpen)


    useEffect(() => {
        if (CURTAIN_TYPES.includes(scriptItem.type)) {
            dispatch(updateScriptItemTextWidth(id, finalText, type, endMargin))
        }
    }, [previousCurtainOpen]) // eslint-disable-line react-hooks/exhaustive-deps



    //Event Handlers

    const handleTextChange = (e) => {
        log(logType, `handleTextChange: ${e.target.value || ''} `)
        setEndMargin(100)
        let newTempTextValue = e.target.value || ''
        newTempTextValue = addBrackets(scriptItem.type, newTempTextValue)
        setTempTextValue(newTempTextValue)
        dispatch(updateScriptItemTextWidth(id, newTempTextValue, type, endMargin))
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        setEndMargin(100)
        setTempTextValue(pastedText)
        dispatch(updateScriptItemTextWidth(id, pastedText, type, endMargin))
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

    const handleEnterView = () => {
        const el = document.getElementById(`script-item-text-input-${id}`)
        if (el) el.classList.add('inView')
        dispatch(updateScriptItemTextWidth(scriptItem.id, finalText, scriptItem.type, endMargin))
        if (type === SCENE) dispatch(updateSceneInFocus(scriptItem.id))
    }

    const handleExitView = () => {
        const el = document.getElementById(`script-item-text-input-${id}`)
        if (el) el.classList.remove('inView')
    }

    const handleFocus = () => {
        setIsFocused(true)
        dispatch(updateScriptItemInFocus(scriptItem.id, (scriptItem.type === SCENE) ? scriptItem.id : scriptItem.parentId)) //update global state of which item is focussed
        dispatch(updateMovementInProgress(false))
        dispatch(updateScriptItemTextWidth(id, finalText, scriptItem.type, endMargin))
        toggleMedia(false)
    }


    const handleBlur = (e) => {

        if (isBeingDeleted !== true) {
            log(logType, 'handleBlur: ', { scriptItemText: scriptItem.text, eventTextValue: e.target.value })
            setEndMargin(DEFAULT_END_MARGIN)
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


    const textAreaJsx = () => (

        <TextareaAutosize
            key={id}
            id={`script-item-text-input-${id}`}
            placeholder={finalPlaceholder}
            className={classnames('form-control',s.autogrow,'transition-height','text-input',s['text-input'],isFocused ? s['focused'] : null,(printScript !== false) ? s[printScript] : s['regular'])}
            value={finalText}
            onChange={(e) => handleTextChange(e)}
            onBlur={(e) => handleBlur(e)}
            onFocus={() => handleFocus()}
            onKeyDown={(e) => handleKeyDown(e, scriptItem)}
            style={{ width: textWidthPx }}
            onPaste={(e) => handlePaste(e)}
            readOnly={readOnly}
        //rows={getTextAreaRows().length}
        >
        </TextareaAutosize>


    )


    return (
        <div id={`script-item-text-${id}`} className={classnames(s['script-item-text'], s[viewStyle])}>

            <ScriptItemHeader scriptItem={scriptItem} sceneNumber={sceneNumber} />
            {viewStyle === CHAT &&
                <ElementInViewObserver onEnterView={handleEnterView} onExitView={handleExitView} className={s['element-in-view-observer']}>
                    {textAreaJsx()}
                </ElementInViewObserver>
            }
            {viewStyle === CLASSIC && !readOnly && 
                textAreaJsx()
            }
            {viewStyle === CLASSIC && readOnly &&
                <div id={`script-item-text-input-${id}`}
                    className={classnames('text-input',
                        s['text-input'],
                        isFocused ? s.focused : '',
                        s['script-item-text-div'],
                        s[viewStyle])}>
                    {finalText}
                </div>
            }



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
            output = output.replace(/[()]/g, '') //remove all brackets
            output = `(${output})`  //add all brackets back in.
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

