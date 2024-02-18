//React and redux
import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    setShowComments,
    trigger,
    ADD_COMMENT,
    UPDATE_TYPE,
    ADD_SCRIPT_ITEM,
    DELETE_SCRIPT_ITEM,
    ADD_PART,
    DELETE_PART
} from '../../../actions/scriptEditor';

//Components
import { Icon } from '../../../components/Icons/Icons'


//Constants
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN } from '../../../dataAccess/scriptItemTypes';
import { HEADER_TYPES } from '../../../dataAccess/scriptItemTypes';

//utils
import { log, SCRIPT_ITEM_CONTROLS as logType } from '../../../dataAccess/logging';
import classnames from 'classnames';
import { moveFocusToId } from '../scripts/utility';

import s from '../ScriptItem.module.scss';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';

export const CONFIRM = 'CONFIRM';
export const TOGGLE_PART_SELECTOR = 'TOGGLE_PART_SELECTOR';
function ScriptItemControls(props) {

    //utils
    const dispatch = useDispatch();

    //Constants
    const bodyScriptItemTypes = [CURTAIN, STAGING, DIALOGUE, ACTION, SOUND, LIGHTING]
    const attachTypes = [SOUND, STAGING, INITIAL_STAGING, SYNOPSIS]

    //Props
    const { toggleMedia, onClick, scriptItem = null, scene = null, part = null, header = null, children } = props;
    const hasComment = scriptItem?.commentId || part?.commentId || false;

    log(logType, 'props', props)

    //Redux
    const currentUser = useSelector(state => state.user.currentUser)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)
    const readOnly = isScriptReadOnly(currentUser, isMobileDevice)
    //Internal State
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const confirmPartId = `confirm-part-${part?.id}-${scene?.id}`
    const searchPartId = `search-part-${part?.id}-${scene?.id}`;
    const addPartId = `add-part-${part?.id}-${scene?.id}`;
    const deletePartId = `delete-part-${part?.id}-${scene?.id}`;

    const confirmScriptItemId = `confirm-script-item-${scriptItem?.id}`;
    const addScriptItemId = `add-script-item-${scriptItem?.id}`;
    const deleteScriptItemId = `delete-script-item-${scriptItem?.id}`;

    const viewCommentId = `view-comment-${scriptItem?.id}`;
    const addCommentId = `add-comment-${scriptItem?.id}`;
    const attachId = `attach-${scriptItem?.id}`;
    const changeTypeId = `change-type-${scriptItem?.id}`;


    //event handlers

    const handleTypeDropdownClick = (e, type) => {
        e.preventDefault()
setDropdownOpen(false)
        dispatch(trigger(UPDATE_TYPE, { scriptItem, value: type }))
    }

    const goToComment = () => {
        dispatch(setShowComments(true))
        moveFocusToId(scriptItem.commentid);
    }

    const handleAddComment = () => {
        dispatch(setShowComments(true))
        dispatch(trigger(ADD_COMMENT, { scriptItem }))
    }

    if (readOnly) return null;

    return (
        /* <div className={s['script-item-controls']}>*/
        <>

            <div className={`${s['header-controls']} ${header ? s['header-exists'] : ''}`}>

                {scriptItem && HEADER_TYPES.includes(scriptItem.type) === false &&
                    <div className={`${s['type-dropdown']}`} >

                        <Icon id={changeTypeId} key={changeTypeId} icon="menu" onClick={() => setDropdownOpen(!dropdownOpen)} toolTip="Change Type to Action, Staging etc." />

                        {dropdownOpen && <div className={s['type-dropdown-menu']}>
                            {bodyScriptItemTypes.map((type) => {
                                return <div className={classnames(s.type,'clickable')} key={type} onClick={(e) => handleTypeDropdownClick(e, type)}>{type}</div>
                            })
                            }
                        </div>}
                    </div>
                }


                {(scriptItem && !hasComment && ![SHOW, ACT, SCENE].includes(scriptItem.type)) &&
                    <Icon id={addCommentId} key={addCommentId} icon='comment-o' onClick={handleAddComment} toolTip="Add comment" />
                }
                {(hasComment && ![SHOW, ACT, SCENE].includes(scriptItem.type)) &&
                    <Icon id={viewCommentId} key={viewCommentId} icon='comment' onClick={() => goToComment()} toolTip="View comment" />
                }
                {scriptItem && attachTypes.includes(scriptItem.type) &&
                    <>
                        <Icon id={attachId} key={attachId} icon="attach" onClick={() => toggleMedia()} toolTip="Attach media" />
                    </>
                }
            </div>


            <div className={s['footer-controls']}>
                {scriptItem && ![SHOW, ACT, SCENE].includes(scriptItem.type) &&
                    <Icon id={confirmScriptItemId} key={confirmScriptItemId} icon="play" onClick={(e) => onClick(e, CONFIRM)} toolTip="Confirm text (tab)" />
                }
                {scriptItem && (!HEADER_TYPES.includes(scriptItem.type) || scriptItem.type === INITIAL_CURTAIN) &&
                    <Icon id={addScriptItemId} key={addScriptItemId} icon="add" onClick={(e) => onClick(e, ADD_SCRIPT_ITEM)} toolTip="Add new line (return)" />
                }
                {scriptItem && !HEADER_TYPES.includes(scriptItem.type) &&

                    <Icon id={deleteScriptItemId} key={deleteScriptItemId} icon="trash" onClick={() => dispatch(trigger(DELETE_SCRIPT_ITEM, { scriptItem }))} toolTip="Delete line" />
                }
            </div>


            <div className={s['center-controls']}>
                {part &&
                    <>
                        <Icon id={confirmPartId} key={confirmPartId} icon="play" onClick={() => onClick(CONFIRM)} toolTip="Confirm name (tab)" />
                        <Icon id={addPartId} key={addPartId} icon="add" onClick={() => onClick(ADD_PART)} toolTip="Add new part below (return)" />
                        <Icon id={searchPartId} key={searchPartId} icon="search" onClick={(e) => onClick(TOGGLE_PART_SELECTOR, e)} toolTip="Find existing part" />
                        <Icon id={deletePartId} key={deletePartId} icon="trash" onClick={() => onClick(DELETE_PART, { scriptItemId: scene.id, partId: part.id })} toolTip="Delete Part" />

                    </>
                }
            </div>

            {children}



        </>


        /*       </div>*/
    )
}

export default ScriptItemControls;
