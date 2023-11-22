import React from 'react';
import { useState } from 'react';
import { useDispatch , useSelector} from 'react-redux';

//Components
import { Icon } from '../../../components/Icons/Icons';
import TagsInput from '../../../components/Forms/TagsInput';
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { changeFocus } from '../../../actions/scriptEditor';
import { END } from '../scripts/utility';
import { moveFocusToId } from '../scripts/utility';
import { prepareUpdate, getLatest } from '../../../dataAccess/localServerUtils';
import { addUpdates } from '../../../actions/localServer';
import { log } from '../../../helper';
//css
import s from '../ScriptItem.module.scss';

function Comment(props) {

    //constants
    const debug = true;
    const dispatch = useDispatch();
    const tagOptions = ['Guy ToDo', 'Mark C ToDo', 'Heather ToDo', 'Mark B ToDo'];

    //props
    const { id, onChange } = props;

    //redux
    const commentHistory = useSelector(state => state.scriptEditor.scriptItemHistory[id]) || [];
    const comment = getLatest(commentHistory)[0]

    log(debug, 'Component:Comment:', { id, comment })

    //internal state
    const [tempText, setTempText] = useState(null);

    const text = () => {
        return tempText || comment.text;
    }




    const handleKeyDown = (e) => {

        //if (e.key === 'Enter') {
        //    handleBlur()
        //    moveFocusToId(comment.previousId, END)
        //}
    }

    const handleChange = (type, value) => {

        let newComment = { ...comment }
        let newFocusId = null;

        switch (type) {
            case 'addTag': newComment.tags.push(value); break;
            case 'removeTag': newComment.tags = newComment.tags.filter(tag => tag !== value); break;
            case 'text': newComment.text = value; break;
            case 'confirm':
                newComment.text = value;
                newFocusId = comment.previousId;
                break;
            case 'delete':
                newComment.isActive = false;
                newComment.previousId = null;
                newFocusId = comment.previousId;
                onChange('deleteComment', null)
                break;
            default: return;
        }

        const preparedUpdate = prepareUpdate(newComment)
        dispatch(addUpdates(preparedUpdate, 'ScriptItem'))

        if (newFocusId) {
            moveFocusToId(newFocusId, END)
        }
    }

    const handleTextChange = (e) => {
        setTempText(e.target.value)
    }


    const handleFocus = () => {
        dispatch(changeFocus(comment)) //update global state of which item is focussed
    }


    const handleBlur = () => {

        if (tempText || tempText === '') {

            log(debug, 'Component:Comment handleBlur', { tempText })
            handleChange('text', tempText)
        }
        setTempText(null)
    }



    return (

        (comment) &&

        <div id={comment.id} key={comment.id} className={s['script-item-comment']}>
            <div className={s['comment-header']}>
                <div className={s['created-by']}>Mark Carter</div>
                <Icon icon="trash" onClick={() => handleChange('delete', null)} />
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
                onKeyDown={(e) => handleKeyDown(e)}
            />

                <div className={s['comment-header']}>

                    <TagsInput key={comment.id}
                        tags={comment.tags}
                        tagOptions={tagOptions}
                        onClickRemove={(tag) => handleChange('removeTag', tag)}
                        onClickAdd={(tag) => handleChange('addTag', tag)}
                        strapColor='primary'

                    />
                <Icon icon="play" onClick={() => handleChange('confirm', text())} />
            </div>

        </div>

    )

}

export default Comment;