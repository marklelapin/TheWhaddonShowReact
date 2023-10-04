import React from 'react';
import {useState, useEffect} from 'react'; 
import {useSelector, useDispatch} from 'react-redux'; 

function Comment(props) {

    const {scriptItem} = props;

    return (

        <div className="script-item-comment draft-border">
            <span>Mark Carter</span>
            <small className="d-block text-muted">
               This is atest comment. REally need to do something about this line.
            </small>
        </div>
    )

}

export default Comment;