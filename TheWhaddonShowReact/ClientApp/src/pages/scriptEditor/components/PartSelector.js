﻿import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import Avatar from 'components/Avatar/Avatar';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';

import { log } from 'helper'
import PartNameAndAvatar from './PartNameAndAvatar';

function PartSelector(props) {


    const debug = true;

    log(debug,'PartSelectorProps',props)

    const { scenePartIds = [], allocatedPartIds = [],onChange } = props;


    const storedParts = useSelector(state => state.localServer.parts.history)

    const [partsArray, setPartsArray] = useState([])

    log(debug, 'PartsSelector scenePartIds', scenePartIds)
log(debug,'PartsSelector allocatedPartIds',allocatedPartIds)

    useEffect(() => {

        //setup partsArray
        const sceneParts = getLatest(storedParts).filter(part => scenePartIds.includes(part.id))

        const newPartsArray = sceneParts.map(part => allocatedPartIds.includes(part.id) ? { ...part, allocated: true } : { ...part, allocated: false })

        setPartsArray(newPartsArray)

        //add click event listener to document to close dropdown
        //TODOD


    },[storedParts,scenePartIds,allocatedPartIds])


    log(debug, 'PartSelector storedParts:', storedParts)
    log(debug, 'PartSelector partsArray:', partsArray)


    const [openPartSelector, setOpenPartSelector] = useState(false);


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
                        return (<PartNameAndAvatar size ="sm" key={part.id} part={part} avatar />
                        )
                    })}
                    {(partsArray.some(part => part.allocated === true)) === false &&
                        < Avatar person={{ id: 0, firstName: 'clear' }} size="sm" avatarInitials="?" />
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