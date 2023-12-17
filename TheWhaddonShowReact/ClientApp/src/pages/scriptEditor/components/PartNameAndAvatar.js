import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Avatar from '../../../components/Avatar/Avatar';
import { Input, Tooltip} from 'reactstrap';

import { log } from '../../../logging';
import s from '../ScriptItem.module.scss';
import QuickToolTip from '../../../components/Forms/QuickToolTip';

function PartNameAndAvatar(props) {

    const debug = false;

    const { id, partId = null,
        partPerson = null,
        onNameChange,
        onAvatarClick,
        avatarToolTip,
        toolTipPlacement = 'top'
        , onClick, onKeyDown, onBlur, onFocus, avatar, partName, personName, size = "md", selected = false } = props;

    log(debug, 'PartNameAndAvatar Props', props)

    //Redux
    const partPersonFromId = useSelector(state => state.scriptEditor.currentPartPersons[partId])

    const finalPartPerson = partPerson || partPersonFromId || {};


    //Tooltip

    const partAvatarId = `part-avater-${id}`;
    const personNameId = `person-name-${id}`;



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

        <div className={`${s['part-avatar-name']} ${onClick ? 'clickable' : ''} ${(selected) ? s['selected'] : ''}`} onClick={onClick} >

            {(avatar) &&
                <div id={partAvatarId} className={s["part-avatar"]}>
                    < Avatar
                        size={size}
                        avatarInitials={finalPartPerson.avatarInitials}
                        person={finalPartPerson}
                        onClick={(e) => handleAvatarClick(e)} />
                </div>
            }
            {(avatar && avatarToolTip) &&
                <QuickToolTip id={partAvatarId} tip={avatarToolTip} placement={toolTipPlacement} />
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
                            className={`${s['text-input']} text-input`}
                        />

                    }

                    {(!onNameChange) &&


                        <p>{finalPartPerson.name}</p>

                    }

                </div>
            }
            {(personName) &&
                <>
                <div id={personNameId} className={`${s["part-person-name"]} clickable`} onClick={(e) => handleAvatarClick(e)}>
                    {(finalPartPerson.personName) &&
                        ` played by ${finalPartPerson.personName}`
                    }
                    {(!finalPartPerson.personName) &&
                        ' (unallocated)'    
                    }
                </div>
                <QuickToolTip id={personNameId} tip={avatarToolTip} placement={toolTipPlacement} />

                </>
               
                
            }
        </div >

    )

}

export default PartNameAndAvatar;