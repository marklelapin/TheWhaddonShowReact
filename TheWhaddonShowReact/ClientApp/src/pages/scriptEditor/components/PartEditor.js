//React and Redux
import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addUpdates } from '../../../actions/localServer';
import { trigger } from '../../../actions/scriptEditor';
//Components

import PersonSelector from './PersonSelector';
import PartEditorRow from './PartEditorRow';
import CurtainBackground from './CurtainBackground';
//Utilities
import { getLatest, prepareUpdate } from '../../../dataAccess/localServerUtils';
import { PartUpdate } from '../../../dataAccess/localServerModels';
import { log } from '../../../helper'
import { moveFocusToId } from '../scripts/utility';
import { UP, DOWN, START, END, ABOVE, BELOW } from '../scripts/utility';
import { CONFIRM_UNDO } from '../../../actions/scriptEditor';


//styling
import s from '../ScriptItem.module.scss'

//script editor processing actions
import { UPDATE_SCENE_PART_IDS, SWAP_PART} from '../../../actions/scriptEditor';

//ChangeTypes to be referenced in part selector
export const NAME = 'name';

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
    const {
        sceneId = null,
        previousFocusId,
        nextFocusId,
        curtainOpen,
        zIndex,
    } = props;

    log(debug, 'Component:PartEditor props', props)

    if (sceneId === null) {
        throw new Error('Component:PartEditor: sceneId prop is null')
    }


    //Redux
    const sceneParts = useSelector(state => state.scriptEditor.scenePartPersons[sceneId])
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)


    //copy them to internal state that then gets edited before saving on blur
    const [modalPersons, setModalPersons] = useState(null); //if populated opens up selectperson modal


    log(debug, 'Component:PartEditor sceneParts', sceneParts)

    const previousPart = (part) => {

        const partIndex = sceneParts.partIds.findIndex(id => id === part.id)
        return sceneParts.partPersons[partIndex - 1] || null
    }

    const nextPart = (part) => {

        const partIndex = sceneParts.partIds.findIndex(id => id === part.id)
        return sceneParts.partPersons[partIndex + 1] || null
    }




    //EVent Handlers

    const handleMoveFocus = (direction, position, part) => {

        const currentPartIndex = sceneParts.partPersons.findIndex(item => item.id === part.id && item.isActive)

        const nextPart = sceneParts.partPersons[currentPartIndex + 1]
        const previousPart = sceneParts.partPersons[currentPartIndex - 1]

        if (direction === UP) { moveFocusToId(previousPart?.id || previousFocusId || part.id, position || END); return }

        if (direction === DOWN) { moveFocusToId(nextPart?.id || nextFocusId || part.id, position || END); return }

    }


    //CRUD
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
            const partBeforeIndex = (direction === BELOW) ? partIndex : partIndex - 1


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


            if (direction === UP && previousPart(partToDelete)) {
                newFocusId = previousPart(partToDelete).id
                newFocusPosition = END
            } else if (direction === UP && !previousPart(partToDelete)) {
                newFocusId = previousFocusId;
                newFocusPosition = END
            } else if (direction === DOWN && nextPart(partToDelete)) {
                newFocusId = nextPart(partToDelete).id
                newFocusPosition = START
            } else if (direction === DOWN && !nextPart(partToDelete)) {
                newFocusId = nextFocusId;
                newFocusPosition = START
            }


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
            case SWAP_PART:
                dispatch(trigger(SWAP_PART, { sceneId , oldPartId: partId, newPartId: value }))
                break;
            default: return;
        }


        log(debug, 'PartPersons: dispatch', partUpdates)

        dispatch(addUpdates(partUpdates, 'Part'))

        if (newPartIds.length > 0) {
            dispatch(trigger(UPDATE_SCENE_PART_IDS, { sceneId, partIds: newPartIds }))
        }

        if (newFocusId) {
            moveFocusToId(newFocusId, newFocusPosition)
        }

        setModalPersons(null)

        return
    }







    const handleClick = (action, value, part) => {
        if (undoDateTime) { dispatch(trigger(CONFIRM_UNDO)) }

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


    const totalItems = activeSceneParts().length

    return (

        <>

            <div className={s[`part-editor`]} style={{ zIndex: zIndex }}>

                <p>Parts:</p>
                {activeSceneParts().map((part, idx) => {

                    return (

                        <PartEditorRow
                            key={part.id}
                            part={part}
                            nextPart={nextPart}
                            isFirst={sceneParts.partIds.length === 1}
                            sceneId={sceneId}
                            onChange={(type, value) => handleChange(type, value, part)}
                            onClick={(action, value) => handleClick(action, value, part)}
                            undoDateTime={undoDateTime}
                            zIndex={totalItems - idx + 1} //+1 to get them above the curtain.
                            moveFocus={(direction, position) => handleMoveFocus(direction, position, part)}
                        />


                    )
                })}

                <CurtainBackground curtainOpen={curtainOpen} />
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