//React and Redux
import React from 'react';

//components
import TextareaAutosize from 'react-autosize-textarea';

//utils
import { SCRIPT_ITEM_TYPES } from '../dataAccess/scriptItemTypes'

//styling
import s from '../pages/scriptEditor/ScriptItem.module.scss';

export function TextAreaContexts() {

    return (

        <div id="text-area-contexts" style={{ display: 'none' }}>
            {SCRIPT_ITEM_TYPES.map(type => {
                return (
                    <div className={`${s['script-item']} ${s[type?.toLowerCase()]}`} key={type}>
                      
                        <TextareaAutosize id={`text-area-context-${type.toLowerCase()}`} key={type} className={`${s['text-input']}`}></TextareaAutosize>
                
                    </div>
                )
            })
            }

        </div >

    )

}
export default TextAreaContexts;





