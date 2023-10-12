//React and Redux
import React from 'react';
import {  useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';


//Components

import TagsInput from 'components/Forms/TagsInput';

import PartNameAndAvatar from './PartNameAndAvatar';
import ScriptItemControls from './ScriptItemControls';

//Utilities
import { log } from 'helper'
import { changeFocus } from 'actions/navigation';
import { moveFocusToId } from '../scripts/utilityScripts';


function PartEditorRow(props) {

    //utility consts
    const debug = false;
    const dispatch = useDispatch();

    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']


    //props
    const { part, onClick, onChange, onKeyDown, onBlur } = props;

    log(debug, 'PartEditorProps', props)




    //Redux
    const focus = useSelector(state => state.scriptEditor.focus[part.id])

    const handleFocus = () => {

        dispatch(changeFocus(part)) //update global state of which item is focussed

    }

    useEffect(() => {

        if (focus && focus.id === part.id) {
            moveFocusToId(part.id, focus.position)
        }

    }, [focus])



    return (

        <>

            <div key={part.id} id={part.id} className="part">
                <PartNameAndAvatar avatar partName personName

                    avatarInitials={part.avatarInitials}
                    part={part}
                    onAvatarClick={(e, linkId) => onClick('avatar', null)}
                    onNameChange={(text) => onChange('text', text)}
                    onKeyDown={(e) => onKeyDown(e,part)}
                    onBlur={(e) => onBlur(e)}
                    onFocus={() => handleFocus()}
                />
                {(focus) &&
                    <ScriptItemControls
                        part={part}
                        onClick={(action, value) => onClick(action, value, part)}
                    />
                }

                <div className="part-tags">
                    <TagsInput
                        strapColor="primary"
                        tags={part.tags}
                        tagOptions={(focus) ? tagOptions : []}
                        onClickAdd={(tag) => onClick('addTag', tag)}
                        onClickRemove={(tag) => onClick('removeTag', tag)} />
                </div>


            </div>


        </>



    )


}

export default PartEditorRow;