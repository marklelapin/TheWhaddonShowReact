//React and Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Button } from 'reactstrap';
import { log } from '../../../helper'
import PartNameAndAvatar from './PartNameAndAvatar';

//styles
import s from '../ScriptItem.module.scss';

function PartSelectorDropdown(props) {

    const debug = true;

    log(debug, 'Component:PartSelectorDropdown Props', props)
    //Props
    const { parts = null, onSelect, toggle, allowMultiSelect = true, allowClear = true, centered } = props;

    //redux
    const partPersons = useSelector(state => state.scriptEditor.partPersons)

   

    //internal
    const [partsArray, setPartsArray] = useState([])


    useEffect(() => {

        log(debug, 'Component:PartSelectorDropdown useEffect')
        const toggleIfOutsideDropdown = (e) => {
            const isInsideDropdown = e.target.closest('.part-selector-dropdown')

            if (!isInsideDropdown) {
                toggle(e)
            }
        }

        document.addEventListener('click', (e) => toggleIfOutsideDropdown(e))

        return () => {
            document.removeEventListener('click', (e) => toggleIfOutsideDropdown(e))
        }

    }, [])

    useEffect(() => {

        const unsortedParts = parts || [...partPersons]

        const finalParts = unsortedParts.sort((a, b) => a.name.localeCompare(b.name))

        setPartsArray(finalParts)

    }     , [parts,partPersons])
   


    const handleClickPart = (event, partId) => {
        event.stopPropagation();
        //event.preventDefault();
        log(debug, 'Component:PartSelectorDropdown handlePartSelectorClick')

        if (partId === null) {

            onSelect([])
            return;
        }

        if (event.ctrlKey && allowMultiSelect) {

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

            onSelect([partId])

        }

    }

    const handleClickConfirm = (e) => {
        e.stopPropagation();

        onSelect(partsArray.filter(part => part.selected).map(part => part.id))
    }


    const isMultiSelect = () => {

        return partsArray.some(part => part.selected === true)
    }


    return (
        < div className={`${s['part-selector-dropdown']} ${(centered) ? s['centered'] : ''}`} >

            {(partsArray.length === 0) &&
                <h3 onClick={(e) => toggle(e)} >No parts setup for this scene</h3>}

            {(partsArray.length > 0 && allowClear) &&
                <>
                    < PartNameAndAvatar part={{ id: 0, name: 'Clear all parts', personId: null }} onClick={(e) => handleClickPart(e, null)} avatar partName />
                    <div className="dropdown-divider"></div>
                </>

            }
            <div className={s['parts-container']}>
                {partsArray.map(part => {

                    return (
                        <PartNameAndAvatar
                            key={part.id}
                            part={part}
                            onClick={(e) => handleClickPart(e, part.id)}
                            selected={part.selected}
                            avatar
                            partName />
                    )

                })}

                {isMultiSelect() &&
                    <Button color="danger" size='sm' type="submit" onClick={(e) => handleClickConfirm(e)}>Confirm</Button>
                }
                {!isMultiSelect() && allowMultiSelect &&
                    <small>(use Ctrl to multi-select)</small>
                }
            </div>

        </div>

    )

}

export default PartSelectorDropdown;