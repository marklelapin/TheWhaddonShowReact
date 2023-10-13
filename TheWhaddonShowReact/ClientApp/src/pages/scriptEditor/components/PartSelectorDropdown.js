//React and Redux
import React from 'react';
import {useEffect } from 'react';

//Components
import { Button } from 'reactstrap';
import { log } from 'helper'
import PartNameAndAvatar from './PartNameAndAvatar';



function PartSelectorDropdown(props) {

    const debug = false;

    log(debug, 'PartSelectorProps', props)
    //Props
    const { partsArray, onClick } = props;



    useEffect(() => {

        const toggleIfOutsideDropdown = (e) => {
            const isInsideDropdown = e.target.closest('.part-selector-dropdown')

            if (!isInsideDropdown) {
                onClick('toggle')
            }
}

        document.addEventListener('click', (e) => toggleIfOutsideDropdown(e))
        

        return () => {
            document.removeEventListener('click', (e) => toggleIfOutsideDropdown(e))
        }

    },[])


    const handlePartSelectorClick = (event, partId) => {
        //event.stopPropagation();
        //event.preventDefault();
        
        if (partId === null) {

            onClick('partIds', [])
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

            onClick('partsArray', updatedPartsArray)

        } else {

            onClick('partIds', [partId])

        }

    }

    const isMultiSelect = () => {
        return partsArray.some(part => part.selected === true)
    }


    return (
        <>

            {(partsArray.length === 0) &&
                <h3 onClick={() => onClick('toggle')} >No parts setup for this scene</h3>}

            {(partsArray.length > 0) &&
                < PartNameAndAvatar part={{ id: 0, name: 'Clear all parts', personId: null }} onClick={(e) => handlePartSelectorClick(e, null)} avatar partName />
            }

            {partsArray.map(part => {

                return (
                    <PartNameAndAvatar
                        key={part.id}
                        part={part}
                        onClick={(event) => handlePartSelectorClick(event, part.id)}
                        selected={part.selected}
                        avatar
                        partName />
                )

            })}
            {isMultiSelect() &&
                <Button color="danger" size='sm' type="submit" onClick={() => onClick('confirm')}>Confirm</Button>
            }
            {!isMultiSelect() &&
                <small>(use Ctrl to multi-select)</small>
            }

        </>

    )

}

export default PartSelectorDropdown;