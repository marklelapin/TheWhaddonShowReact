import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import Avatar from 'components/Avatar/Avatar';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';

import { log } from 'helper'
import PartNameAndAvatar from './PartNameAndAvatar';

function PartSelector(props) {


    const debug = false;

    log(debug, 'PartSelectorProps', props)
    //Props
    const { scene, allocatedPartIds = [], onChange, size = "md" } = props;

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
    }, [sceneParts, allocatedPartIds])

    log(debug, 'PartSelector partsArray:', partsArray)




    //Event Handlers

    const handlePartSelectorClick = (event, partId) => {

        if (partId === null) {

            onChange([])
            setOpenPartSelector(false)
            return;
        }

        if (event.ctrlKey) {

            const updatedPartsArray = partsArray.map(part => {
                if (part.id === partId) {
                    return { ...part, selected: !part.selected }
                }
                else {
                    return part
                }
            })

            setPartsArray(updatedPartsArray)

        } else {

            onChange([partId])
            setOpenPartSelector(false)

        }

    }

    const handleConfirm = () => {

        const newPartIds = partsArray.filter(part => part.selected).map(part => part.id)

        onChange(newPartIds)
        setOpenPartSelector(false)

    }

    const isMultiSelect = () => {

        return partsArray.some(part => part.selected === true)
    }

    const toggleDropdown = () => {
        setOpenPartSelector(!openPartSelector)
    }



    return (
        <div className="part-selector" >
            <div className="part-selector-avatars" onClick={()=>toggleDropdown()}>

                {partsArray.filter(part => part.allocated === true).map(part => {
                    return (<PartNameAndAvatar size={size} key={part.id} part={part} avatar />
                    )
                })}
                {(partsArray.some(part => part.allocated === true)) === false &&
                    < Avatar person={{ id: 0, firstName: 'empty' }} size={size} avatarInitials="?" />
                }
            </div>
            <div  className={`part-selector-dropdown ${openPartSelector ? 'show' : 'hide'}`} >

                {(partsArray.length === 0) &&
                    <h3 onClick={() => toggleDropdown()} >No parts setup for this scene</h3>}

                {(partsArray.length > 0) &&
                    < PartNameAndAvatar part={{ id: 0, name: 'Clear all parts', personId: null }} onClick={(e) => handlePartSelectorClick(e,null)} avatar partName />
                }

                {partsArray.map(part => {

                    return (
                        <PartNameAndAvatar
                            part={part}
                            onClick={(event) => handlePartSelectorClick(event, part.id)}
                            selected={part.selected}
                            avatar
                            partName />
                    )

                })}
                {isMultiSelect() &&
                        <Button color="danger" sixe='sm' type="submit" onClick={() => handleConfirm()}>Confirm</Button>
                }
                {!isMultiSelect() &&
                        <small>(use Ctrl to multi-select)</small>
                }
            </div>

        </div>

    )

}

export default PartSelector;