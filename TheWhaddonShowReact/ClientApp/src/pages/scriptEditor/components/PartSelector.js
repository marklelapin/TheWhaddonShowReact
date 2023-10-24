//React and Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import Avatar from 'components/Avatar/Avatar';
import PartNameAndAvatar from './PartNameAndAvatar';
import PartSelectorDropdown  from './PartSelectorDropdown';

//Utilities

import { log } from 'helper'


function PartSelector(props) {


    const debug = false;

    log(debug, 'PartSelectorProps', props)
    //Props
    const { scene = {}, allocatedPartIds = [], onChange, size = "md" ,undoDateTime,onClick} = props;

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
    }, [scene,sceneParts, allocatedPartIds])

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
        <div className="part-selector" >
            <div className="part-selector-avatars clickable" onClick={(e) => toggleDropdown(e)}>

                {partsArray.filter(part => part.allocated === true).map(part => {
                    return (<Avatar size={size} key={part.id} person={part} avatar />
                    )
                })}
                {(partsArray.some(part => part.allocated === true)) === false &&
                    < Avatar person={{ id: 0, firstName: 'empty' }} size={size} avatarInitials="?" />
                }
            </div>
            {(openPartSelector) &&
                < div className="part-selector-dropdown" >

                    <PartSelectorDropdown
                        partsArray={partsArray}
                        onClick={(action, value) => handleSelectorClick(action, value)} />
                </div>
            }


        </div >

    )

}

export default PartSelector;