import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Components
import { Icon } from '../../../components/Icons/Icons';
import TagsInput from '../../../components/Forms/TagsInput';
import TextareaAutosize from 'react-textarea-autosize';

//utils
import { updateScriptItemInFocus, trigger, DELETE_COMMENT, UPDATE_TEXT, ADD_TAG, REMOVE_TAG } from '../../../actions/scriptEditor';
import { END } from '../scripts/utility';
import { moveFocusToId } from '../scripts/utility';
import { finalReadOnly } from '../scripts/layout';

import { log, COMMENT as logType } from '../../../dataAccess/logging';
//css
import s from '../ScriptItem.module.scss';

function Comment(props) {

    //constants
    const dispatch = useDispatch();
    const tagOptions = ['Guy ToDo', 'Mark C ToDo', 'Heather ToDo', 'Mark B ToDo'];

    //props
    const { id } = props;

    //redux
    const comment = useSelector(state => state.scriptEditor.currentScriptItems[id]) || [];
    const showComments = useSelector(state => state.scriptEditor.showComments);
    const scriptItem = { ...comment };
    const _readOnly = useSelector(state => state.scriptEditor.readOnly)
    const readOnly = finalReadOnly(_readOnly)


    //internal state
    const [tempText, setTempText] = useState(null);

    const finalText = (tempText === null) ? scriptItem.text : tempText

    log(logType, 'props', { id, comment, tempText, finalText, readOnly })

    const handleTextChange = (e) => {
        setTempText(e.target.value || '')
    }

    const handleFocus = () => {
        dispatch(updateScriptItemInFocus(scriptItem.id, scriptItem.parentId))//update global state of which item is focussed
    }

    const handleBlur = (e) => {
        log(logType, 'handleBlur ', { tempText, eventTextValue: e.target.value })

        if (scriptItem.text !== e.target.value) {
            dispatch(trigger(UPDATE_TEXT, { scriptItem, value: e.target.value }))
        }
        // setTempText(null)
    }



    return (

        (comment) && showComments &&

        <div id={comment.id} key={comment.id} className={s['script-item-comment']}>
            <div className={s['comment-header']}>
                <div className={s['created-by']}>Mark Carter</div>
                    {!readOnly && <Icon id={`delete-${comment.id}`} icon="trash" onClick={() => dispatch(trigger(DELETE_COMMENT, { scriptItem }))} toolTip="Delete comment" />}
            </div>

            <TextareaAutosize
                key={comment.id}
                id={`comment-text-input-${comment.id}`}
                placeholder='Enter comment...'
                className={`form-control ${s.autogrow} transition-height ${s['text-input']} text-input`}
                value={finalText}
                onChange={(e) => handleTextChange(e)}
                onBlur={(e) => handleBlur(e)}
                onFocus={() => handleFocus()}
                readOnly={readOnly}
            />

            <div className={s['comment-header']}>

                <TagsInput key={comment.id}
                    tags={comment.tags}
                    tagOptions={tagOptions}
                    onClickRemove={(tag) => dispatch(trigger(REMOVE_TAG, { scriptItem, tag }))}
                    onClickAdd={(tag) => dispatch(trigger(ADD_TAG, { scriptItem, tag }))}
                    strapColor='primary'
                    readOnly={readOnly}

                />
                    {!readOnly && <Icon icon="play" onClick={() => moveFocusToId(comment.previousId, END)} />}
            </div>

        </div>

    )

}

export default Comment;