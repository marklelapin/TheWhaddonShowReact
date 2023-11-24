//React and Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { trigger, CONFIRM_UNDO } from '../../../actions/scriptEditor'; 

//Components
import Avatar from '../../../components/Avatar/Avatar';
import PartSelectorDropdown from './PartSelectorDropdown';

//styles
import s from '../ScriptItem.module.scss';
//Utilities

import { log } from '../../../helper'


function PartSelector(props) {


    const debug = false;
    const dispatch = useDispatch();

    log(debug, 'PartSelectorProps', props)
    //Props
    const { sceneId, allocatedPartIds = [], onChange, size = "md"} = props;

    //REdux
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[sceneId])

    //Internal State
    const [openPartSelector, setOpenPartSelector] = useState(false);



    const sceneParts = scenePartPersons?.partPersons
    const partsArray = sceneParts?.map(part => allocatedPartIds.includes(part.id) ? { ...part, allocated: true } : { ...part, allocated: false }) || []

   
    //Event Handlers

    const handleSelect = (partIds) => {
            onChange(partIds)
            setOpenPartSelector(false)        
    }

    const toggleDropdown = (e) => {
        e.stopPropagation();
        dispatch(trigger(CONFIRM_UNDO)) //confirms undo if user has moved on to another field
        setOpenPartSelector(!openPartSelector)

    }

    return (
        <div className={s['part-selector']} >
            <div className={`${s['part-selector-avatars']} clickable`} onClick={(e) => toggleDropdown(e)}>

                {partsArray.filter(part => part.allocated === true).map(part => {
                    return (
                        <div className={s['avatar']} key={part.id}>
                            <Avatar onClick={(e) => toggleDropdown(e)} size={size} key={part.id} person={part} avatar />
                        </div>
                    )
                })}
                {(partsArray.some(part => part.allocated === true)) === false &&
                    <div className={s['avatar']}>
                        < Avatar onClick={(e) => toggleDropdown(e)} person={{ id: 0, firstName: 'empty' }} size={size} avatarInitials="?" />
                    </div>
                }



            </div>
            {(openPartSelector) &&


                <PartSelectorDropdown
                parts={partsArray}
                toggle={(e)=>toggleDropdown(e)}
                    onSelect={(partIds) => handleSelect(partIds)} />

            }
        </div >
    )

}

export default PartSelector;