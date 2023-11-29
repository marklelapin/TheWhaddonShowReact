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
import { log } from '../../../helper'
import { updateScriptItemInFocus } from '../../../actions/scriptEditor';
import { DOWN, UP, START, END, ABOVE, BELOW } from '../scripts/utility';
import { moveFocusToId, closestPosition } from '../scripts/utility';



//styling
import s from '../ScriptItem.module.scss'

function PartEditorRow(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch();
    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //props
    const { partId
        , sceneId
        , isFirst
        , previousFocusId
        , nextFocusId
    } = props;
    log(debug, 'Component:PartEditorRow: props', props)

    //let { part } = props;


    //Redux
    const partPerson = useSelector(state => state.scriptEditor.partPersons[partId])
    const nextPartPerson = useSelector(state => state.scriptEditor.partPersons[partPerson.nextId])
    const scriptItemInFocus = useSelector(state => state.scriptEditor.scriptItemInFocus[partId])
    const focus = useSelector(state => state.scriptEditor.scriptItemInFocus[partId])
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId])
    const scenePartIds = scene.partIds

    const zIndex = 1; //TODO - this needs to be calculated based on the number of parts in the scene

    //internal state
    const [tempName, setTempName] = useState(null);
    const [openPartSelector, setOpenPartSelector] = useState(false);

    useEffect(() => {
        log(debug, 'Component:PartEditorRow useEffect[]')
        if (isFirst) { //flags if when this is created it is the only part. in that case it selects the scene title
            moveFocusToId(sceneId, START)
        } else { //makes the textarea the focus when created
            const textInputRef = document.getElementById(`${partPerson.id}`)?.querySelector('input')
            if (textInputRef) {
                textInputRef.focus();
            }
        }
    }, [])



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

        const currentPartIndex = scenePartIds.findIndex(item => item.id === partId && item.isActive)

        const nextPart = scenePartIds[currentPartIndex + 1]
        const previousPart = scenePartIds[currentPartIndex - 1]

        if (direction === UP) { moveFocusToId(previousPart?.id || previousFocusId || partId, position || END); return }

        if (direction === DOWN) { moveFocusToId(nextPart?.id || nextFocusId || partId, position || END); return }

    }

    const handleKeyDown = (e) => {

        if (e.key === 'Enter') {

            if (e.target.selectionEnd === 0) {
                dispatch(trigger(ADD_PART, { position: ABOVE, sceneId, partId, tempTextValue: tempName }))
            } else {
                dispatch(trigger(ADD_PART), { position: BELOW, sceneId, partId, tempTextValue: tempName })
            }
            setTempName(null)
            return
        }

        if (e.key === 'Backspace') {

            const name = partWithTempName().name

            if (!name || name === null || name === '') {
                e.preventDefault()
                log(debug, 'PartPersons: handleKeyDown: Backspace', { name: name, tempName: tempName })
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
                    dispatch(trigger, DELETE_NEXT_PART, { direction: UP, sceneId, partId })
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

    }



    const handleControlsClick = (action, e) => {

        switch (action) {
            case ADD_PART:
                dispatch(trigger(ADD_PART, { position: BELOW, sceneId, partId, tempTextValue: tempName }));
                setTempName(null)
                break;
            case DELETE_PART:
                dispatch(trigger(DELETE_PART, { position: DOWN, sceneId, partId }));
                setTempName(null)
                break;
            case CONFIRM: moveFocus(DOWN, END); break;
            case TOGGLE_PART_SELECTOR:
                e.stopPropagation();
                setOpenPartSelector(!openPartSelector); break;
            default: return;
        }
    }

    const handleFocus = () => {
        dispatch(trigger(CONFIRM_UNDO))
        dispatch(updateScriptItemInFocus({ scriptItemId: partId, sceneId })) //update global state of which item is focussed
    }


    const handleBlur = () => {

        log(debug, 'Component:PartEditorRow handleBlur', { tempName: tempName, partName: partPerson.name })
        if (tempName || (tempName === '' && partPerson.name !== '')) {

            dispatch(UPDATE_PART_NAME, { partId, name: tempName })
        }
        setTempName(null)
    }





    return (

        <>

            <div key={partPerson.id} id={partPerson.id} className={s["part"]} style={{ zIndex: zIndex }}>
                <PartNameAndAvatar avatar partName

                    avatarInitials={partPerson.avatarInitials}
                    partPerson={partWithTempName()}
                    onAvatarClick={() => dispatch(updatePersonSelectorConfig({ sceneId, partId }))}
                    onNameChange={(text) => handleNameChange(text)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    onBlur={() => handleBlur()}
                    onFocus={() => handleFocus()}
                />

                {(scriptItemInFocus) &&
                    <div className={s['part-editor-controls']} >
                        <ScriptItemControls
                            part={partPerson}
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
                <div className={s['part-tags']}>
                    <TagsInput
                        strapColor="primary"
                        tags={partPerson.tags}
                        tagOptions={(focus) ? tagOptions : []}
                        onClickAdd={(tag) => dispatch(trigger(ADD_PART_TAG, { partId, tag }))}
                        onClickRemove={(tag) => dispatch(trigger(REMOVE_PART_TAG, { partId, tag }))} />
                </div>


            </div>


        </>



    )


}

export default PartEditorRow;