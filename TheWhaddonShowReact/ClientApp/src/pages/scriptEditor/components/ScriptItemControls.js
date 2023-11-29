//React and redux
import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import {
    updateShowComments,
    trigger,
    ADD_COMMENT,
    UPDATE_TYPE,
    ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM,
    ADD_PART,
    DELETE_PART
} from '../../../actions/scriptEditor';

//Components
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons'


//Constants
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN} from '../../../dataAccess/scriptItemTypes';
import { HEADER_TYPES } from '../../../dataAccess/scriptItemTypes';

//utils
import { log } from '../../../helper';

import { moveFocusToId } from '../scripts/utility';

import s from '../ScriptItem.module.scss';

export const CONFIRM = 'CONFIRM';
export const TOGGLE_PART_SELECTOR = 'TOGGLE_PART_SELECTOR';
function ScriptItemControls(props) {

    //utils
    const debug = false;
    const dispatch = useDispatch();
    
    //Constants
    const scriptItemTypes = [CURTAIN, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN]
    const attachTypes = [SONG, SOUND, STAGING, INITIAL_STAGING, SYNOPSIS]

    //Props
    const { toggleMedia, onClick, scriptItem = null, part = null, header = null, children } = props;

    const hasComment = scriptItem?.commentId || part?.commentId || false;

    log(debug, 'ScriptItemControlsProps', props)

    //Redux

    //Internal State
    const [dropdownOpen, setDropdownOpen] = useState(false);

    //event handlers
    const toggle = () => {

        setDropdownOpen(prevState => !prevState);
    }
    const handleTypeDropdownClick = (e, type) => {
        e.preventDefault()
        dispatch(trigger(UPDATE_TYPE, { scriptItem, type }))
    }

    const goToComment = () => {
        dispatch(updateShowComments(true))
        moveFocusToId(scriptItem.commentid);
    }

    return (
        <div className={s['script-item-controls']}>
            <div className={`${s['header-controls']} ${header ? s['header-exists'] : ''}`}>

                <div className={s['header-left-controls']}>
                    {scriptItem && attachTypes.includes(scriptItem.type) &&
                        <>
                            <Icon icon="attach" onClick={() => toggleMedia()} />
                        </>
                    }
                </div>
                <div className={s['header-right-controls']}>

                    {scriptItem && HEADER_TYPES.includes(scriptItem.type) === false &&
                        < Dropdown isOpen={dropdownOpen} toggle={toggle}>

                            <Icon icon="menu" onClick={() => setDropdownOpen(!dropdownOpen)} />

                            <DropdownMenu>
                                {scriptItemTypes.map((type) => {
                                    return <DropdownItem key={type} onClick={(e) => handleTypeDropdownClick(e, type)}>{type}</DropdownItem>
                                })
                                }
                            </DropdownMenu>
                        </Dropdown>
                    }




                    {(!hasComment) &&
                        <Icon icon='comment-o' onClick={() => dispatch(trigger(ADD_COMMENT, {scriptItem}))} />
                    }
                    {(hasComment) &&
                        <Icon icon='comment' onClick={() => goToComment()} />
                    }

                </div>


            </div>


            <div className={s['bottom-right-controls']}>
                {scriptItem && <Icon icon="play" onClick={() => onClick(CONFIRM)} />}

                {scriptItem && (!HEADER_TYPES.includes(scriptItem.type) || scriptItem.type === INITIAL_CURTAIN) && <Icon icon="add" onClick={() => dispatch(trigger(ADD_SCRIPT_ITEM, {scriptItem}))} />}


                {scriptItem && !HEADER_TYPES.includes(scriptItem.type) && <Icon icon="trash" onClick={() => dispatch(trigger(DELETE_SCRIPT_ITEM, { scriptItem }))} />}

            </div>


            <div className={s['outside-right-controls']}>
                {part &&
                    <>
                        <Icon icon="play" onClick={() => onClick(CONFIRM)} />
                    <Icon icon="add" onClick={() => dispatch(trigger(ADD_PART, {scriptItemId: scriptItem.id, partId: part.id}))} />
                        <Icon icon="search" onClick={(e) => onClick(TOGGLE_PART_SELECTOR,e)} />
                    <Icon icon="trash" onClick={() => onClick(DELETE_PART, {scriptItemId: scriptItem.id , partId: part.id})} />
                    </>
                }
            </div>

            {children}

        </div>
    )
}

export default ScriptItemControls;