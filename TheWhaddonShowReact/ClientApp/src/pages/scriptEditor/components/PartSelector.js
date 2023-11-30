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


    const debug = true;
    const dispatch = useDispatch();

    log(debug, 'Component:PartSelector props', props)
    //Props
    const { sceneId, allocatedPartIds = [], onSelect, size = "md"} = props;

    //Redux
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId])
    const scenePartIds = scene?.partIds || []

    //Internal State
    const [openPartSelector, setOpenPartSelector] = useState(false);


    const partsArray = scenePartIds.map(id => allocatedPartIds.includes(id) ?  {id, allocated: true } : { id, allocated: false }) || []
    log(debug, 'Component:PartSelector partsArray', { scene: scene.text, scenePartIds, partsArray })
    //Event Handlers

    const handleSelect = (partIds) => {
            onSelect(partIds)
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
                            <Avatar onClick={(e) => toggleDropdown(e)} size={size} key={part.id} partId={part.id} avatar />
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
                partIds={scenePartIds}
                toggle={(e)=>toggleDropdown(e)}
                    onSelect={(partIds) => handleSelect(partIds)} />

            }
        </div >
    )

}

export default PartSelector;