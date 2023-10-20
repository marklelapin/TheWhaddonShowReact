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
import { moveFocusToId } from '../scripts/utility';
import {UP,DOWN,START,END,ABOVE,BELOW} from '../scripts/utility';


import { PART_IDS,PARTS }  from './Scene';
//ChangeTypes
export const NAME = 'name';

export const ADD_TAG = 'tags';
export const REMOVE_TAG = 'removeTag';
export const ADD_PART_ABOVE = 'addPartAbove';
export const ADD_PART_BELOW = 'addPartBelow'
export const DELETE_PART = 'deletePart';
export const DELETE_NEXT_PART = 'deleteNextPart';
export const ALLOCATE_PERSON = 'allocatePerson';
export const PART_ID = 'partId';

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


    log(debug,'PartPersons: sceneParts',sceneParts)

    log(debug,'PartEditor: sceneParts',sceneParts)
  
    const previousPart = (part) => {
       
        const partIndex = sceneParts.partIds.findIndex(id => id === part.id)
   return sceneParts.partPersons[partIndex - 1] || null
    }

    const nextPart = (part) => {
      
        const partIndex = sceneParts.partIds.findIndex(id =>id === part.id)
        return sceneParts.partPersons[partIndex + 1] || null
    }

    
    //CRUD
   



    //EVent Handlers

    const handleMoveFocus = (direction, position, part) => {

        const currentPartIndex = sceneParts.partPersons.findIndex(item => item.id === part.id && item.isActive)

        const nextPart = sceneParts.partPersons[currentPartIndex + 1]
        const previousPart = sceneParts.partPersons[currentPartIndex - 1]

        if (direction === UP) { moveFocusToId(previousPart?.id || previousFocus?.id || part.id, position || END); return }

        if (direction === DOWN) { moveFocusToId(nextPart?.id || nextFocus?.id || part.id, position || END); return }

    }



    const handleChange = (type, value, part) => {

        log(debug, 'PartPersons: handleChange', { type: type, value: value, part: part })

        const copySceneParts = { ...sceneParts }

        const partId = part.id
        let partToUpdate = copySceneParts.partPersons.find(part => part.id === partId)
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

            const partIndex = copySceneParts.partIds.findIndex(id => id === partId)
            const partBeforeIndex = (direction === BELOW) ? partIndex  : partIndex -1


            const startArray = copySceneParts.partIds.slice(0, partBeforeIndex + 1) || []
            const endArray = copySceneParts.partIds.slice(partBeforeIndex + 1) || []
            const newPart = prepareUpdate(new PartUpdate())
            const newPartArray = [newPart[0].id]

            partUpdates = [...partUpdates, ...newPart]

            newPartIds = [...startArray, ...newPartArray, ...endArray]
        }


        const deletePart = (partToDelete, direction) => {

            if (activeSceneParts().length === 1) {
                alert('cant delete last part')
                return
            }

            newPartIds = copySceneParts.partIds.filter(id => id !== partToDelete.id)

            let newFocus = (direction === UP)
                ? previousPart(partToDelete) || previousFocus
                : nextPart(partToDelete) || nextFocus
            newFocusId = newFocus.id
            newFocusPosition = (direction === UP) ? 'end' : 'start'
        }

        switch (type) {
            case NAME: partUpdates = prepareUpdate({ ...partToUpdate, name: value.trimStart() });
                newFocusId = null;
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
                deletePart(part, value);
                break;
            case DELETE_NEXT_PART:
                deletePart(nextPart, UP)
                break;
            case PART_ID:
                const selectedPartId = value

                if (scene.partIds.includes(selectedPartId)) {
                    alert('The part is already associated with this scene')
                    return;
                }

                newPartIds = newPartIds.map(id => (id === partId) ? value : id)
                onChange(PARTS, {oldPartId: partId, newPartId: value})

            default: return;
        }


        log(debug,'PartPersons: dispatch',partUpdates)

        dispatch(addUpdates(partUpdates, 'Part'))

        if (newPartIds.length > 0) {
            onChange(PART_IDS,newPartIds)
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


        const activeParts = sceneParts.partPersons.filter(item => item.isActive === true)

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
                            isFirst={sceneParts.partIds.length===1}
                            sceneId={scene.id}
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