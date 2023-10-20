﻿//React and Redux
import React from 'react';
import { useEffect } from 'react';
import {useSelector } from 'react-redux';

//Components
import { Button } from 'reactstrap';
import { log } from 'helper'
import PartNameAndAvatar from './PartNameAndAvatar';



function PartSelectorDropdown(props) {

    const debug = true;

    log(debug, 'PartSelectorDropdown Props', props)
    //Props
    const { partsArray = null, onClick, allowMultiSelect = true, allowClear = true } = props;

    //redux
    const partPersons = useSelector(state => state.scriptEditor.partPersons)

    const finalPartsArray = partsArray || [...partPersons]

 

    useEffect(() => {

        log(debug, 'PartSelectorDropdown useEffect')
        const toggleIfOutsideDropdown = (e) => {
            const isInsideDropdown = e.target.closest('.part-selector-dropdown')

            if (!isInsideDropdown) {
                onClick('togglePartSelectorDropdown')
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
        log(debug, 'PartSelectorDropdown handlePartSelectorClick')

        if (partId === null) {

            onClick('partIds', [])
            return;
        }

        if (event.ctrlKey && allowMultiSelect) {

            const updatedPartsArray = finalPartsArray.map(part => {
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

        log(debug, 'PartSelectorDropdown isMultiSelect')
        return finalPartsArray.some(part => part.selected === true)
    }


    return (
        <>


            {(finalPartsArray.length === 0) &&
                <h3 onClick={() => onClick('togglePartSelectorDropdown')} >No parts setup for this scene</h3>}

          {(finalPartsArray.length > 0 && allowClear) &&
                < PartNameAndAvatar part={{ id: 0, name: 'Clear all parts', personId: null }} onClick={(e) => handlePartSelectorClick(e, null)} avatar partName />
            }

            {finalPartsArray.map(part => {

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
            {!isMultiSelect() && allowMultiSelect &&
                <small>(use Ctrl to multi-select)</small>
            }

        </>

    )

}

export default PartSelectorDropdown;