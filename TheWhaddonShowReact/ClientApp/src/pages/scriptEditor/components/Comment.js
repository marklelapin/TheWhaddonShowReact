import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import { Icon } from 'components/Icons/Icons';
import TagsInput from 'components/Forms/TagsInput';
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { changeFocus } from 'actions/scriptEditor';
import { log } from 'helper';
import { END } from '../scripts/utility';
import { moveFocusToId } from '../scripts/utility';
import { prepareUpdate } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
//css
import s from 'pages/forms/elements/Elements.module.scss';

function Comment(props) {

    //constants
    const dispatch = useDispatch();
    const tagOptions = ['GuyToDo', 'MarkToDo', 'HeatherToDo'];

    //props
    const { comment = {} } = props;



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
                newFocusId = comment.previousId;
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
            handleChange('text', tempText)
        }
        setTempText(null)
    }



    return (

        <>
            <div className="comment-header">
                <div className="created-by">Mark Carter</div>
                <Icon icon="trash" onClick={() => handleChange('delete', null)} />
            </div>



            <TextareaAutosize
                key={comment.id}
                id={`comment-text-input-${comment.id}`}
                placeholder='Enter comment...'
                className={`form-control ${s.autogrow} transition-height text-input`}
                value={text()}
                onChange={(e) => handleTextChange(e)}
                onBlur={() => handleBlur()}
                onFocus={() => handleFocus()}
                onKeyDown={(e) => handleKeyDown(e)}
            />

            <div className="comment-footer">

<TagsInput key={comment.id} tags={comment.tags} tagOptions={tagOptions} onClickRemove={(tag) => handleChange('removeTag', tag)} onClickAdd={(tag) => handleChange('addTag', tag)} />
                <Icon icon="play" onClick={() => handleChange('confirm', text())} />
            </div>


            

        </>
    )

}

export default Comment;