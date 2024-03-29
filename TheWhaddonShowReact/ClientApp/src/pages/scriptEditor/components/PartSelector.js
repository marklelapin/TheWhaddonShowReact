﻿//React and Redux
import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

//Components
import Avatar from '../../../components/Avatar/Avatar';
import PartSelectorDropdown from './PartSelectorDropdown';

//styles
import s from '../ScriptItem.module.scss';
//Utilities
import { isScriptReadOnly } from '../../../dataAccess/userAccess';
import { log } from '../../../dataAccess/logging'
import QuickToolTip from '../../../components/Forms/QuickToolTip';


function PartSelector(props) {


    const debug = true;

    log(debug, 'Component:PartSelector props', props)
    //Props
    const { id, sceneId, allocatedPartIds = [], onSelect, size = "md" } = props;

    //Redux
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId])
    const scenePartIds = scene?.partIds || []
    const currentUser = useSelector(state => state.user.currentUser)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)
    const readOnly = isScriptReadOnly(currentUser,isMobileDevice)
    //Internal State
    const [openPartSelector, setOpenPartSelector] = useState(false);

    const partsArray = scenePartIds.map(id => allocatedPartIds.includes(id) ? { id, allocated: true } : { id, allocated: false }) || []
    log(debug, 'Component:PartSelector partsArray', { scene: scene.text, scenePartIds, partsArray })
    //Event Handlers

    const handleSelect = (partIds) => {
        onSelect(partIds)
        setOpenPartSelector(false)
    }

    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (!readOnly) {
            setOpenPartSelector(!openPartSelector)
        }
    }

    return (
        <div key={`${id}-part-selector`} className={s['part-selector']} >
            <div id={`${id}-avatar`} key={`${id}-avatar`} className={`${s['part-selector-avatars']} clickable`} onClick={(e) => toggleDropdown(e)}>

                {partsArray.filter(part => part.allocated === true).map(part => {
                    return (

                        <div className={s['avatar']} key={`${id}-${part.id}`}>
                            <Avatar onClick={(e) => toggleDropdown(e)} size={size} key={part.id} partId={part.id} avatar />
                        </div>



                    )
                })}
                {(partsArray.some(part => part.allocated === true)) === false &&
                    <div className={s['avatar']} key={`${id}-0`}>
                        < Avatar onClick={(e) => toggleDropdown(e)} person={{ id: 0, firstName: 'empty' }} size={size} avatarInitials="?" />

                    </div>
                }

            </div>
            {(!openPartSelector) && <QuickToolTip id={`${id}-avatar`} tip="Assign Part" />}

            {(openPartSelector) &&

                <PartSelectorDropdown
                    partIds={scenePartIds}
                    toggle={(e) => toggleDropdown(e)}
                    onSelect={(partIds) => handleSelect(partIds)} />

            }
        </div >
    )

}

export default PartSelector;