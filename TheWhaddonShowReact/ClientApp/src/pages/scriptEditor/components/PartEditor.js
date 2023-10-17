//React and Redux
import React from 'react';
import { useState, useEffect, } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addUpdates } from 'actions/localServer';
//Components

import PersonSelector from './PersonSelector';

import PartEditorRow from './PartEditorRow';
//Utilities
import { getLatest, prepareUpdate } from 'dataAccess/localServerUtils';
import {PartUpdate } from 'dataAccess/localServerModels';
import { log } from 'helper'
import { moveFocusToId } from '../scripts/utilityScripts';
import {UP,DOWN,START,END,ABOVE,BELOW} from '../scripts/utilityScripts';



//ChangeTypes
export const NAME = 'name';
export const PART_IDS = 'partIds';
export const ADD_TAG = 'tags';
export const REMOVE_TAG = 'removeTag';
export const ADD_PART_ABOVE = 'addPartAbove';
export const ADD_PART_BELOW = 'addPartBelow'
export const DELETE_PART = 'deletePart';
export const DELETE_NEXT_PART = 'deleteNextPart';
export const ALLOCATE_PERSON = 'allocatePerson';

function PartEditor(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch();

    //props
    const { scene = null, onChange, previousFocus, nextFocus } = props;

    log(debug, 'PartEditorProps', props)

    if (scene === null) {
        throw new Error('PartEditor: scene prop is null')
    }

  
    //Redux
    const sceneParts = useSelector(state => state.scriptEditor.scenePartPersons[scene.id])
    const storedPersons = useSelector(state => state.localServer.persons.history)



    //copy them to internal state that then gets edited before saving on blur
    const [modalPersons, setModalPersons] = useState(null); //if populated opens up selectperson modal


    
   

    log(debug,'PartEditor: sceneParts',sceneParts)
  
    const previousPart = (part) => {
        const partIndex = sceneParts.findIndex(item => item.id === part.id)
return sceneParts[partIndex - 1] || null
    }

    const nextPart = (part) => {
        const partIndex = sceneParts.findIndex(item => item.id === part.id)
        return sceneParts[partIndex + 1] || null
    }

    
    //CRUD
   



    //EVent Handlers

    const handleMoveFocus = (direction, position, part) => {

        const currentPartIndex = sceneParts.findIndex(item => item.id === part.id && item.isActive)

        const nextPart = sceneParts[currentPartIndex + 1]
        const previousPart = sceneParts[currentPartIndex - 1]

        if (direction === UP) { moveFocusToId(previousPart?.id || previousFocus?.id || part.id, position || END); return }

        if (direction === DOWN) { moveFocusToId(nextPart?.id || nextFocus?.id || part.id, position || END); return }

    }



    const handleChange = (type, value, part) => {

        const partId = part.id
        let partToUpdate = [...sceneParts.find(part => part.id === partId)]
        let partUpdates = [];
        let newPartIds = [];
        let newFocusId = part.id //varied with switch statement if needed.
        let newFocusPosition = 'end'


        const addPart = (direction) => {

            let partWithTempText = { ...partToUpdate }

            const tempText = value
            if (tempText) {
                partWithTempText.name = tempText
                partUpdates = prepareUpdate(partWithTempText)
            }

            const partBeforeIndex = sceneParts.findIndex(part => part.id === partId) - ((direction === ABOVE) ? 1 : 0) || 0

            const startArray = partUpdates.slice(0, partBeforeIndex + 1)
            const endArray = partUpdates.slice(partBeforeIndex + 1)
            const newPart = new PartUpdate()
            partUpdates = prepareUpdate(newPart)

            newPartIds = [startArray.map(part => part.id), newPart.id, endArray.map(part => part.id)]
        }


        const deletePart = (partToDelete, direction) => {

            if (activeSceneParts().length === 1) {
                alert('cant delete last part')
                return
            }

            partUpdates = prepareUpdate({ ...partToDelete, isActive: false })
            newPartIds = sceneParts.filter(part => part.id !== partToDelete.id).map(part => part.id)

            let newFocus = (direction === UP)
                ? previousPart() || previousFocus
                : nextPart() || nextFocus
            newFocusId = newFocus.id
            newFocusPosition = (direction === UP) ? 'end' : 'start'
        }

        switch (type) {
            case NAME: partUpdates = prepareUpdate({ ...partToUpdate, name: value.trimStart() });
                break;
            case PART_IDS:
                break;
            case ADD_TAG: partUpdates = prepareUpdate({ ...partToUpdate, tags: [...part.tags, value] });
                break;
            case REMOVE_TAG: partUpdates = prepareUpdate({ ...partToUpdate, tags: part.tags.filter(tag => tag !== value) });
                break;
            case ALLOCATE_PERSON: partUpdates = prepareUpdate({ ...partToUpdate, personId: value.id });
                break;
            case ADD_PART_ABOVE:
                addPart(ABOVE)
                newFocusId = null
                break;
            case ADD_PART_BELOW:
                addPart(BELOW)
                newFocusId = null
                break;
            case DELETE_PART:
                deletePart(part, DOWN);
                break;
            case DELETE_NEXT_PART:
                deletePart(nextPart, UP)
                break;
            default: return;
        }

        

        dispatch(addUpdates(partUpdates, 'Part'))

        if (newPartIds.length > 0) {
            onChange('partIds',newPartIds)
        }

        if (newFocusId) {
            moveFocusToId(newFocusId,newFocusPosition)
        }

        setModalPersons(null)

        return
    }







    const handleClick = (action, value, part) => {

        switch (action) {
            case 'avatar': handleClickAvatar(part); break;
            case 'search': handleClickSearch(); break;
            default: return;
        }
    }

    const handleClickAvatar = (part) => {


        const activeParts = sceneParts.filter(item => item.isActive === true)

        const allocatedPersonIds = activeParts.filter(part => part.personId !== null).map(part => part.personId)

        const unAllocatedPersons = getLatest(storedPersons).filter(person => !allocatedPersonIds.includes(person.id))

        setModalPersons({ unAllocatedPersons: unAllocatedPersons, part: part })

    }

    const handleClickSearch = () => {
        alert('Search Clicked') //TODO add in search functionality
    }



    const closeModalPersons = () => {

        moveFocusToId(...modalPersons.part.id, END)
        setModalPersons(null);

    }

    const activeSceneParts = () => {

        return sceneParts?.partPersons.filter(part => part.isActive === true) || []

    }
    log(debug, 'Active Scene Parts', activeSceneParts())
    log(debug, 'ModalPersons', modalPersons)


    return (

        <>

            <div className={`part-editor  draft-border`}>

                <h5>Parts:</h5>
                {activeSceneParts().map(part => {

                    return (

                        <PartEditorRow
                            key={part.id}
                            part={part}
                            nextPart={nextPart}
                            onChange={(type, value) => handleChange(type, value, part)}
                            onClick={(action,value) => handleClick(action,value,part)}
                            moveFocus={(direction, position) => handleMoveFocus(direction, position, part) }
                        />


                    )
                })}
            </div >

            {(modalPersons) &&
                <PersonSelector
                    persons={modalPersons.unAllocatedPersons}
                    tags={modalPersons.part.tags}
                    closeModal={() => closeModalPersons()}
                    onClick={(person) => handleChange(ALLOCATE_PERSON, person, modalPersons.part)} />
            }

        </>



    )


}

export default PartEditor;