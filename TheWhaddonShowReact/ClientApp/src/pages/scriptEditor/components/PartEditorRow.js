//React and Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    updatePersonSelectorConfig,
    trigger, ADD_PART, DELETE_PART,
    DELETE_NEXT_PART, CONFIRM_UNDO,
    SWAP_PART, UPDATE_PART_NAME,
    ADD_PART_TAG, REMOVE_PART_TAG
} from '../../../actions/scriptEditor';
//Components

import TagsInput from '../../../components/Forms/TagsInput';

import PartNameAndAvatar from './PartNameAndAvatar';
import ScriptItemControls, { TOGGLE_PART_SELECTOR, CONFIRM } from './ScriptItemControls';
import PartSelectorDropdown from './PartSelectorDropdown';

//Utilities
import { log, PART_EDITOR_ROW as logType } from '../../../dataAccess/logging'
import { updateScriptItemInFocus } from '../../../actions/scriptEditor';
import { DOWN, UP, START, END, ABOVE, BELOW } from '../scripts/utility';
import { moveFocusToId, closestPosition } from '../scripts/utility';
import { partEditorRowId } from '../scripts/part'
import { isScriptReadOnly } from '../../../dataAccess/userAccess';

//styling
import s from '../ScriptItem.module.scss'

function PartEditorRow(props) {

    //utility consts
    const dispatch = useDispatch()

    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //props
    const { partId
        , sceneId
        , isFirst
        , previousFocusId
        , nextFocusId
        , scenePartIds
        , zIndex
    } = props;


    //Redux
    const partPerson = useSelector(state => state.scriptEditor.currentPartPersons[partId])
    const nextPartPerson = useSelector(state => state.scriptEditor.currentPartPersons[partPerson?.nextId])
    const scriptItemInFocus = useSelector(state => state.scriptEditor.scriptItemInFocus[partId])
    const focus = useSelector(state => state.scriptEditor.scriptItemInFocus[partId])
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId])
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const currentUser = useSelector(state => state.user.currentUser)
    const printScript = useSelector(state => state.scriptEditor.printScript)
    const readOnly = isScriptReadOnly(currentUser, printScript)

    //const scenePartIds = scene.partIds



    //internal state
    const [tempName, setTempName] = useState(null);
    const [openPartSelector, setOpenPartSelector] = useState(false);



    useEffect(() => {
        log(logType, 'useEffect[] props', props)
        if (isFirst) { //flags if when this is created it is the only part. in that case it selects the scene title
            //moveFocusToId(sceneId, START)
        } else if (partPerson?.updatedOnServer === null) { //makes the textarea the focus when created unless it has come from the server.
            const textInputRef = document.getElementById(partEditorRowId(partId, sceneId))?.querySelector('input')
            if (textInputRef) {
                textInputRef.focus();
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps



    const partWithTempName = () => {
        let partWithTempName = { ...partPerson }
        if (tempName === '') {
            partWithTempName.name = tempName
        } else {
            partWithTempName.name = tempName || partPerson.name || ''
        }

        return partWithTempName
    }



    //EVENT HANDLERS

    const handleNameChange = (text) => {
        setTempName(text || '')
    }

    const moveFocus = (direction, position) => {

        const currentPartIndex = scenePartIds.findIndex(id => id === partId)

        const nextPart = scenePartIds[currentPartIndex + 1]
        const previousPart = scenePartIds[currentPartIndex - 1]
        log(logType, 'moveFocus', { partPerson, currentPartIndex, nextPart, previousPart, scenePartIds, sceneId })
        log(logType, 'partEditorRowId', partEditorRowId(nextPart, sceneId))

        let moveToId;

        if (direction === UP && previousPart) moveToId = partEditorRowId(previousPart, sceneId)
        if (direction === UP && !previousPart) moveToId = previousFocusId
        if (direction === DOWN && nextPart) moveToId = partEditorRowId(nextPart, sceneId)
        if (direction === DOWN && !nextPart) moveToId = nextFocusId

        moveFocusToId(moveToId, position || END); return
    }



    const handleKeyDown = (e) => {

        if (e.key === 'Enter') {

            if (e.target.selectionEnd === 0) {
                dispatch(trigger(ADD_PART, { position: ABOVE, sceneId, partId, tempTextValue: tempName }))
            } else {

                dispatch(trigger(ADD_PART, { position: BELOW, sceneId, partId, tempTextValue: tempName }))
            }
            setTempName(null)
            return
        }

        if (e.key === 'Backspace') {

            const name = partWithTempName().name

            if (!name || name === null || name === '') {
                e.preventDefault()
                log(logType, 'handleKeyDown: Backspace', { name: name, tempName: tempName })
                partPerson.name = ''
                dispatch(trigger(DELETE_PART, { direction: UP, sceneId, partId }))

                return
            }

            if (e.target.selectionEnd === 0) {
                e.preventDefault()
                moveFocus(UP, END)
                return
            }

        }

        if (e.key === 'Delete') {

            const name = partWithTempName().name

            if (e.target.selectionStart === e.target.value.length) {
                e.preventDefault()

                if ((!name || name === null || name.length === 0)) {
                    partPerson.name = ''
                    dispatch(trigger(DELETE_PART, { direction: DOWN, sceneId, partId }))
                    return
                }

                if (nextPartPerson && (nextPartPerson.name || '') === '') {
                    partPerson.name = ''
                    dispatch(trigger(DELETE_NEXT_PART, { direction: UP, sceneId, partId }))
                    return
                }

                if (nextPartPerson && nextPartPerson.name.length > 0) {
                    moveFocus(DOWN, START)
                    return
                }


            }


        }

        if (e.key === 'ArrowUp') {
            e.preventDefault()
            moveFocus(UP, closestPosition(e))
            return
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            moveFocus(DOWN, closestPosition(e))
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

        if (e.key === 'tab') {
            e.preventDefault()
            moveFocus(DOWN, closestPosition(e))
            return
        }
    }

    const handleControlsClick = (action, e) => {

        switch (action) {
            case ADD_PART:
                dispatch(trigger(ADD_PART, { position: BELOW, sceneId, partId, tempTextValue: tempName }));
                setTempName(null)
                break;
            case DELETE_PART:
                dispatch(trigger(DELETE_PART, { direction: DOWN, sceneId, partId }));
                setTempName(null)
                break;
            case CONFIRM: moveFocus(DOWN, END); break;
            case TOGGLE_PART_SELECTOR:
                e.stopPropagation();
                setOpenPartSelector(!openPartSelector); break;
            default: return;
        }
    }

    const togglePersonSelector = () => {
        if (!readOnly) { dispatch(updatePersonSelectorConfig({ sceneId, partId })) }
    }

    const handleFocus = () => {
        dispatch(updateScriptItemInFocus(partId, sceneId)) //update global state of which item is focussed
    }


    const handleBlur = (e) => {

        log(logType, 'handleBlur', { eventTextValue: e.target.value, partName: partPerson.name })
        if (partPerson.name !== e.target.value) {

            dispatch(trigger(UPDATE_PART_NAME, { partId, value: e.target.value }))
        }
        setTempName(null)
    }

    return (

        partPerson && (

            <div key={partEditorRowId(partId, sceneId)} id={partEditorRowId(partId, sceneId)} className={`${s["part"]} ${s[viewStyle]}`} style={{ zIndex: zIndex }}>

                <PartNameAndAvatar avatar={viewStyle === 'chat'} personName={viewStyle === 'classic'} partName
                    id={'part-name-avatar-' + partEditorRowId(partId, sceneId)}
                    avatarInitials={partPerson.avatarInitials}
                    partPerson={partWithTempName()}
                    onAvatarClick={() => togglePersonSelector()}
                    avatarToolTip={partPerson.personId ? "Re-allocate part" : "Allocate part"}
                    onNameChange={(text) => handleNameChange(text)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    onBlur={(e) => handleBlur(e)}
                    onFocus={() => handleFocus()}
                    readOnly={readOnly}
                />

                {(scriptItemInFocus) && !readOnly &&
                    <div className={s['part-editor-controls']} >
                        <ScriptItemControls
                            part={partPerson}
                            scene={scene}
                            onClick={(action, e) => handleControlsClick(action, e)}
                        />

                        {(openPartSelector) &&
                            <PartSelectorDropdown
                                allowMultiSelect={false}
                                allowClear={false}
                                centered
                                toggle={(e) => setOpenPartSelector(!openPartSelector)}
                                onSelect={(selectedPartIds) => dispatch(trigger(SWAP_PART, { sceneId, oldPartId: partId, newPartId: selectedPartIds[0] }))} />
                        }
                    </div>
                }
                {!readOnly &&
                    <div className={s['part-tags']}>
                        <TagsInput
                            strapColor="primary"
                            tags={partPerson.tags}
                            tagOptions={(focus) ? tagOptions : []}
                            onClickAdd={(tag) => dispatch(trigger(ADD_PART_TAG, { partId, tag }))}
                            onClickRemove={(tag) => dispatch(trigger(REMOVE_PART_TAG, { partId, tag }))}
                            readOnly={readOnly}
                        />
                    </div>
                }

            </div>


        )

    )


}

export default PartEditorRow;