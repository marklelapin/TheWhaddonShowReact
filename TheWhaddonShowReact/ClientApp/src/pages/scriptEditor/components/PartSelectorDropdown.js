//React and Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Button } from 'reactstrap';
import { log, PART_SELECTOR_DROPDOWN as logType } from '../../../dataAccess/logging'
import PartNameAndAvatar from './PartNameAndAvatar';

//styles
import s from '../ScriptItem.module.scss';

function PartSelectorDropdown(props) {


    log(logType, 'Component:PartSelectorDropdown Props', props)
    //Props
    const { partIds = null, onSelect, toggle, allowMultiSelect = true, allowClear = true, centered } = props;

    //redux
    const currentPartPersons = useSelector(state => state.scriptEditor.currentPartPersons)



    //internal
    const [partsArray, setPartsArray] = useState([])


    useEffect(() => {

        log(logType, 'Component:PartSelectorDropdown useEffect')
        //add eventlistener to close dropdown if user clicks outside of it
        const toggleIfOutsideDropdown = (e) => {
            const isInsideDropdown = e.target.closest('.part-selector-dropdown')

            if (!isInsideDropdown) {
                toggle(e)
            }
        }

        document.addEventListener('click', (e) => toggleIfOutsideDropdown(e))

        //populate partsArray
        setupPartsArray()


        //remove eventListener onn unmount
        return () => {
            document.removeEventListener('click', (e) => toggleIfOutsideDropdown(e))
        }


    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const setupPartsArray = () => {

        const partPersons = Object.keys(currentPartPersons).map(sceneId => ({
            sceneId,
            ...currentPartPersons[sceneId]
        }));

        const activePartIds = partPersons.filter(partPerson => partPerson.isActive === true).map(partPerson => partPerson.id)

        const finalPartIds = partIds || activePartIds

        const sortedPartIds = finalPartIds.sort((a, b) => {
            const aPartPerson = partPersons.find(partPerson => partPerson.id === a)
            const bPartPerson = partPersons.find(partPerson => partPerson.id === b)

            const aName = aPartPerson?.name || 'zzzzzzz'
            const bName = bPartPerson?.name || 'zzzzzzz'

            return aName.localeCompare(bName)
        })



        setPartsArray(sortedPartIds.map(partId => ({ id: partId, selected: false })))


    }



    const handleClickPart = (event, partId) => {
        event.stopPropagation();
        //event.preventDefault();
        log(logType, 'Component:PartSelectorDropdown handlePartSelectorClick')

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

        partsArray.length  && (
            
        < div className={`${s['part-selector-dropdown']} ${(centered) ? s['centered'] : ''}`} >

            {(partsArray.length === 0) &&
                <h3 onClick={(e) => toggle(e)} >No parts setup for this scene</h3>}

            {(partsArray.length > 0 && allowClear) &&
                <>
                    < PartNameAndAvatar partPerson={{ id: 0, name: 'Clear all parts', personId: null }} onClick={(e) => handleClickPart(e, null)} avatar partName />
                    <div className="dropdown-divider"></div>
                </>

            }
            <div className={s['parts-container']}>
                {partsArray.map(part => {

                    return (
                        <PartNameAndAvatar
                            key={part.id}
                            partId={part.id}
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
    )

}

export default PartSelectorDropdown;