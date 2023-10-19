//React and Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';


//Components

import TagsInput from 'components/Forms/TagsInput';

import PartNameAndAvatar from './PartNameAndAvatar';
import ScriptItemControls from './ScriptItemControls';

//Utilities
import { log } from 'helper'
import { changeFocus } from 'actions/scriptEditor';
import { NAME, ADD_TAG, REMOVE_TAG, ADD_PART_ABOVE, ADD_PART_BELOW, DELETE_PART, DELETE_NEXT_PART } from './PartEditor';
import { DOWN, UP, START, END } from '../scripts/utility';
function PartEditorRow(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch();

    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //props
    const { nextPart, sceneId, onClick, onChange, moveFocus } = props;
    log(debug, 'PartEditorProps', props)

    let { part } = props;
   

    //Redux
    const focus = useSelector(state => state.scriptEditor.focus[part.id])

    //internal state
    const [tempName, setTempName] = useState(null)


    useEffect(() => {
        //makes the textarea the focus when created
        const textInputRef = document.getElementById(`${part.id}`)?.querySelector('input')
        if (textInputRef) {
            textInputRef.focus();
        }
    }, [])



    const partWithTempName = () => {
        let partWithTempName = { ...part }
        if (tempName === '') {
            partWithTempName.name = tempName
        } else {
            partWithTempName.name = tempName || part.name || ''
        }

        return partWithTempName
    }

    const closestPosition = (e) => {
        const percentageAcross = (e.target.selectionEnd / e.target.value.length)
        const closestPosition = (percentageAcross > 0.5) ? END : START
        return closestPosition
    }

    //EVENT HANDLERS

    const handleNameChange = (text) => {
        log(debug, `EventsCheck: handleTextChange: ${text || ''} `)
        setTempName(text || '')
    }

    const handleKeyDown = (e) => {

        if (e.key === 'Enter') {

            if (e.target.selectionEnd === 0) {
                onChange(ADD_PART_ABOVE, tempName);
            } else {
                onChange(ADD_PART_BELOW, tempName);
            }
            setTempName(null)
            return
        }

        if (e.key === 'Backspace') {

            const name = partWithTempName().name

           if ( !name || name === null || name === '') {
               e.preventDefault()
               log(debug, 'PartPersons: handleKeyDown: Backspace', { name: name, tempName: tempName })
                part.name = ''
               onChange(DELETE_PART, UP)
                
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
                    part.name=''
                    onChange(DELETE_PART, DOWN)
                    return
                }

                if (nextPart && (nextPart.name || '') === '') {
                    part.name=''
                    onChange(DELETE_NEXT_PART, DOWN)
                    return
                }

                if (nextPart && nextPart.name.length > 0) {
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


    const handleControlsClick = (action, value) => {

        switch (action) {
            case 'add':
                onChange(ADD_PART_BELOW, tempName);
                setTempName(null)
                break;
            case 'confirm': handleBlur(); break;
            case 'delete': onChange(DELETE_PART, DOWN)
            setTempName(null)
                ; break;

            default: return;
        }
    }

    const handleFocus = () => {
        dispatch(changeFocus({ ...part, parentId: sceneId })) //update global state of which item is focussed
    }


    const handleBlur = () => {

        log(debug, 'PartPersons : handleBlur', (tempName === null, { tempName: null,partName: part.name }, { tempName: tempName,partName: part.name }))
        if (tempName || (tempName === '' && part.name !== '')) {
            
            onChange(NAME, tempName)
        }
        setTempName(null)
    }

    return (

        <>

            <div key={part.id} id={part.id} className="part">
                <PartNameAndAvatar avatar partName personName

                    avatarInitials={part.avatarInitials}
                    part={partWithTempName()}
                    onAvatarClick={(e, linkId) => onClick('avatar', null)}
                    onNameChange={(text) => handleNameChange(text)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    onBlur={() => handleBlur()}
                    onFocus={() => handleFocus()}
                />
                {(focus) &&
                    <ScriptItemControls
                        part={part}
                        onClick={(action, value) => handleControlsClick(action, value)}
                    />
                }

                <div className="part-tags">
                    <TagsInput
                        strapColor="primary"
                        tags={part.tags}
                        tagOptions={(focus) ? tagOptions : []}
                        onClickAdd={(tag) => onChange(ADD_TAG, tag)}
                        onClickRemove={(tag) => onChange(REMOVE_TAG, tag)} />
                </div>


            </div>


        </>



    )


}

export default PartEditorRow;