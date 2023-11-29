import React from 'react';
import { useState } from 'react';
import { useDispatch , useSelector} from 'react-redux';

//Components
import { Icon } from '../../../components/Icons/Icons';
import TagsInput from '../../../components/Forms/TagsInput';
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { updateScriptItemInFocus, trigger, DELETE_COMMENT, UPDATE_TEXT, ADD_TAG, REMOVE_TAG } from '../../../actions/scriptEditor';
import { END } from '../scripts/utility';
import { moveFocusToId } from '../scripts/utility';

import { log } from '../../../helper';
//css
import s from '../ScriptItem.module.scss';

function Comment(props) {

    //constants
    const debug = true;
    const dispatch = useDispatch();
    const tagOptions = ['Guy ToDo', 'Mark C ToDo', 'Heather ToDo', 'Mark B ToDo'];

    //props
    const { id } = props;

    //redux
    const comment = useSelector(state => state.scriptEditor.scriptItems[id]) || [];
    const scriptItem = { ...comment };

    log(debug, 'Component:Comment:', { id, comment })

    //internal state
    const [tempText, setTempText] = useState(null);

    const text = () => {
        return tempText || comment.text;
    }
             
    const handleTextChange = (e) => {
        setTempText(e.target.value)
    }

    const handleFocus = () => {
        dispatch(updateScriptItemInFocus({ scriptItemId: scriptItem.id, sceneId: scriptItem.parentId }) )//update global state of which item is focussed
    }

    const handleBlur = () => {
        log(debug, 'Component:Comment handleBlur ', { tempText })

        if (tempText || tempText === '') {
            dispatch(trigger(UPDATE_TEXT, { scriptItem, text: tempText }))
        }
        setTempText(null)
    }



    return (

        (comment) &&

        <div id={comment.id} key={comment.id} className={s['script-item-comment']}>
            <div className={s['comment-header']}>
                <div className={s['created-by']}>Mark Carter</div>
                    <Icon icon="trash" onClick={() => dispatch(trigger(DELETE_COMMENT, {scriptItem}))} />
            </div>



            <TextareaAutosize
                key={comment.id}
                id={`comment-text-input-${comment.id}`}
                placeholder='Enter comment...'
                className={`form-control ${s.autogrow} transition-height ${s['text-input']} text-input`}
                value={text()}
                onChange={(e) => handleTextChange(e)}
                onBlur={() => handleBlur()}
                onFocus={() => handleFocus()}
            />

                <div className={s['comment-header']}>

                    <TagsInput key={comment.id}
                        tags={comment.tags}
                        tagOptions={tagOptions}
                        onClickRemove={(tag) => dispatch(trigger(REMOVE_TAG, { scriptItem, tag }))}
                        onClickAdd={(tag) => dispatch(trigger(ADD_TAG, { scriptItem, tag }))}
                        strapColor='primary'

                    />
                <Icon icon="play" onClick={() => moveFocusToId(comment.previousId,END)} />
            </div>

        </div>

    )

}

export default Comment;