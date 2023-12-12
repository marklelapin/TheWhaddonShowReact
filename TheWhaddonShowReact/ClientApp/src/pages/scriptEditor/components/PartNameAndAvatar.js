import React from 'react';
import { useSelector } from 'react-redux';

import { getLatest, } from '../../../dataAccess/localServerUtils';
import Avatar from '../../../components/Avatar/Avatar';
import {  Input } from 'reactstrap';

import { addPersonInfo } from '../scripts/part'

import { log } from '../../../logging';
import s from '../ScriptItem.module.scss';

function PartNameAndAvatar(props) {

    const debug = false;

    const { partId = null, partPerson = null, onNameChange, onAvatarClick, onClick, onKeyDown, onBlur, onFocus, avatar, partName, size = "md" ,selected = false} = props;

    log(debug, 'PartNameAndAvatar Props', props)

    //Redux
    const partPersonFromId = useSelector(state => state.scriptEditor.currentPartPersons[partId])

    const finalPartPerson = partPerson || partPersonFromId || {};
  

    //EVENT HANDLERS
    const handleAvatarClick = (e) => {
        e.stopPropagation();
        if (props.onAvatarClick) {
            onAvatarClick(e);
        } else if (props.onClick) {
            onClick(e);
        }

    }

    const handleNameChange = (text) => {

        if (props.onNameChange) {
            onNameChange(text)
        }
    }


    log(debug, 'Component:PartNameAndAvatar partPerson', finalPartPerson)
    //RENDERING

    return (

        <div className={`${s['part-avatar-name']} ${onClick ? 'clickable' : ''} ${(selected)? s['selected'] : ''}` } onClick={onClick} >

            {(avatar) &&
                <div className={s["part-avatar"]}>
                    < Avatar
                        size={size}
                        avatarInitials={finalPartPerson.avatarInitials}
                        person={finalPartPerson}
                        onClick={(e) => handleAvatarClick(e)} />
                </div>
            }


            {(partName) &&
                <div className={s["part-name"]}>
                    {(onNameChange) &&
                     
                        <Input
                        type="text"
                        key={finalPartPerson.id}
                        placeholder="enter name"
                        value={finalPartPerson.name || ''}
                        onKeyDown={onKeyDown}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        className="text-input"
                            />               
               
                    }

                    {(!onNameChange) && 
                       

                        <p>{finalPartPerson.name}</p>
                      
                        }
                    
                </div>
            }            
            
        </div >

    )

}

export default PartNameAndAvatar;