//React and Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import Avatar from '../../../components/Avatar/Avatar';
import PartSelectorDropdown from './PartSelectorDropdown';

//styles
import s from '../ScriptItem.module.scss';
//Utilities

import { log } from '../../../helper'


function PartSelector(props) {


    const debug = false;

    log(debug, 'PartSelectorProps', props)
    //Props
    const { scene = {}, allocatedPartIds = [], onChange, size = "md", undoDateTime, onClick } = props;

    //REdux
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scene.id])

    //Internal State
    const [partsArray, setPartsArray] = useState([])
    const [openPartSelector, setOpenPartSelector] = useState(false);


    const sceneParts = scenePartPersons?.partPersons

    //UseEffectHooks

    useEffect(() => {

        //setup partsArray
        const newPartsArray = sceneParts?.map(part => allocatedPartIds.includes(part.id) ? { ...part, allocated: true } : { ...part, allocated: false }) || []

        setPartsArray(newPartsArray)

        //add click event listener to document to close dropdown
        //TODOD
    }, [scene, sceneParts, allocatedPartIds])

    log(debug, 'PartSelector partsArray:', partsArray)




    //Event Handlers

    const handleSelectorClick = (action, value) => {

        switch (action) {
            case 'partIds':
                onChange(value)
                setOpenPartSelector(false)
                break;
            case 'togglePartSelectorDropdown':
                setOpenPartSelector(!openPartSelector)
                break;
            case 'confirm':
                const newPartIds = partsArray.filter(part => part.selected).map(part => part.id)
                onChange(newPartIds)
                setOpenPartSelector(false)
                break;
            case 'partsArray':
                setPartsArray(value)
                break;

            default: return;
        }
    }




    const toggleDropdown = (e) => {
        if (undoDateTime) { onClick('confirmUndo') }
        e.stopPropagation();
        setOpenPartSelector(!openPartSelector)

    }


    log(debug, 'PartSelector openPartSelector:', openPartSelector)
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
                    partsArray={partsArray}
                    onClick={(action, value) => handleSelectorClick(action, value)} />

            }


        </div >

    )

}

export default PartSelector;