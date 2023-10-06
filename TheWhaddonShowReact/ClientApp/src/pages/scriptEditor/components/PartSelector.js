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

    log(debug,'PartSelectorProps',props)
    //Props
    const { scene, allocatedPartIds = [],onChange, size = "md" } = props;

    //REdux
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scene.id] )

    //Internal State
    const [partsArray, setPartsArray] = useState([])
    const [openPartSelector, setOpenPartSelector] = useState(false);



    const sceneParts = scenePartPersons?.PartPersons

    //UseEffectHooks

    useEffect(() => {

        //setup partsArray
        const newPartsArray = sceneParts?.map(part => allocatedPartIds.includes(part.id) ? { ...part, allocated: true } : { ...part, allocated: false }) || []

        setPartsArray(newPartsArray)

        //add click event listener to document to close dropdown
        //TODOD
    },[sceneParts,allocatedPartIds])

    log(debug, 'PartSelector partsArray:', partsArray)


    

    //Event Handlers

    const handlePartSelectorClick = (event, partId) => {

        if (partId === null) {

            onChange('partIds', [])

        }

        if (event.shiftKey) {

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

    const togglePartSelector = () => {
        setOpenPartSelector(!openPartSelector)
    }



    return (
        <div className="part-selector">
        <Dropdown isOpen={openPartSelector} toggle={() => togglePartSelector()} >  {/*className={`${s.notificationsMenu}`}*/}
            <DropdownToggle nav >  {/*className={s.headerSvgFlipColor}*/}
                <>
                    {partsArray.filter(part => part.allocated === true).map(part => {
                        return (<PartNameAndAvatar size={size} key={part.id} part={part} avatar />
                        )
                    })}
                        {(partsArray.some(part => part.allocated === true)) === false &&
                            < Avatar person={{ id: 0, firstName: 'clear' }} size={size} avatarInitials="?" />
                    }
                </>

            </DropdownToggle>
            <DropdownMenu className={`super-colors`}>   {/*${s.headerDropdownLinks} */}
                {(partsArray.length > 0) &&
                    <>
                        < PartNameAndAvatar part={{ id: 0, name: 'Clear all parts',personId: null }} onClick={() => handlePartSelectorClick(null)} avatar partName/>
                        <DropdownItem divider />
                    </>
                }
                {(partsArray.length === 0) &&
                    <DropdownItem onClick={() => togglePartSelector()} >No parts setup for this scene</DropdownItem>}
                {partsArray.map(part => {

                    return (
                        <DropdownItem key={part.id} onClick={(event) => handlePartSelectorClick(event, part.id)} className={(part.selected === true) ? 'selected' : ''}>
                            <PartNameAndAvatar part={part} avatar partName />
                        </DropdownItem>
                    )

                })}
                {isMultiSelect() &&
                    <>
                        <DropdownItem divider />
                        <Button color="danger" sixe='xs' type="submit" onClick={() => handleConfirm()}>Confirm</Button>
                    </>

                }
            </DropdownMenu>
            </Dropdown>
        </div>

   )
  
}

export default PartSelector;