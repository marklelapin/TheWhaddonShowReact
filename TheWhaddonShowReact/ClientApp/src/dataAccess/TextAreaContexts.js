//React and Redux
import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addTextAreaContext } from '../actions/scriptEditor';

//components
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { log } from '../helper';
import { SCRIPT_ITEM_TYPES } from '../dataAccess/scriptItemTypes'

//styling
import s from '../pages/scriptEditor/ScriptItem.module.scss';



export function TextAreaContexts() {


    const debug = true;
    

    return (

        <div id="text-area-contexts" style={{ display: 'none' }}>
            {SCRIPT_ITEM_TYPES.map(type => {
                return (
                    <div id={`text-area-context-${type.toLowerCase()}`} className={`${s['script-item']} ${s[type?.toLowerCase()]}`} key={type}>
                        <TextareaAutosize key={type} className={`${s['text-input']}`}></TextareaAutosize>
                    </div>
                )
            })
            }

        </div>

    )

}
export default TextAreaContexts;





