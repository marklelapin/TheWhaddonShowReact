//React and Redux
import React from 'react';
import { useState, useEffect, } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addUpdates } from 'actions/localServer';
//Components

import PersonSelector from './PersonSelector';

import PartEditorRow from './PartEditorRow';
//Utilities
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import { PartUpdate } from 'dataAccess/localServerModels';
import { addPersonInfo } from '../scripts/PartScripts'
import { log } from 'helper'
import { moveFocusToId } from '../scripts/utilityScripts';
import { changeFocus } from 'actions/navigation';


function PartEditor(props) {

    //utility consts
    const debug = false;
    const dispatch = useDispatch();
    const up = 'up';
    const down = 'down';
    const end = 'end';
    const start = 'start';


    //props
    const { scene = null, onChange, previousFocus, nextFocus } = props;

    log(debug, 'PartEditorProps', props)

    if (scene === null) {
        throw new Error('PartEditor: scene prop is null')
    }

    //Redux
    const storedSceneParts = useSelector(state => state.scriptEditor.scenePartPersons[scene.id])
    const storedPersons = useSelector(state => state.localServer.persons.history)

    log(debug, 'storedSceneParts', storedSceneParts)



    //copy them to internal state that then gets edited before saving on blur
    const [sceneParts, setSceneParts] = useState([])

    useEffect(() => {
        setSceneParts(storedSceneParts?.partPersons || [])
    }, [])

    useEffect(() => {

        const storedScenePartPersons = storedSceneParts?.partPersons || []

        const storedScenePartIds = storedScenePartPersons.map(part => part.id)

        const newSceneParts = sceneParts.filter(part => !storedScenePartIds.includes(part.id))

        setSceneParts([...storedScenePartPersons, ...newSceneParts])
    }, [storedSceneParts])


    //const resetSceneParts = () => {

    //    const scenePartPerson
    //    //const newStoredParts = getLatest([...storedParts].filter(part => partIds.includes(part.id)))

    //    //const newSceneParts = activeSceneParts().map(item => newStoredParts.find(storedPart => storedPart.id === item.id) || item)

    //    //const newPartIds = partIds.filter(id => ![...storedParts].map(item => item.id).includes(id)) //identifies partIds that have never been part of storedParts. (these are the new parts given to each script in its constructor)

    //    //const newParts = newPartIds.map(id => ({ ...new PartUpdate(), id: id }))

    //    setSceneParts([...newSceneParts, ...newParts])

    //}


    const [modalPersons, setModalPersons] = useState(null); //if populated opens up selectperson modal

    //CRUD
    const deletePart = (deletePart, direction = up) => {

        if (activeSceneParts().length === 1) {
            alert('cant delete last part')
            return
        }

        const partIndex = sceneParts.findIndex(part => part.id === deletePart.id)
        const previousPart = sceneParts[partIndex - 1] || null
        const nextPart = sceneParts[partIndex + 1] || null

        const updatedParts = [...sceneParts].map(part => {
            if (part.id === deletePart.id) {
                return { ...part, isActive: false, changed: true }
            }
            return part;
        })

        const newFocus = (direction === up) ? previousPart || previousFocus : nextPart || previousPart



        setSceneParts(updatedParts);

        //dispatch(changeFocus({ ...newFocus, position: 'end' }))
        moveFocusToId(newFocus.id, 'end')

        updateIfChanged()
    }

    const createPart = (partBefore = {}) => {


        const updatedParts = [...sceneParts]

        const partBeforeIndex = updatedParts.findIndex(part => part.id === partBefore.id) || 0

        const startArray = updatedParts.slice(0, partBeforeIndex + 1)
        const endArray = updatedParts.slice(partBeforeIndex + 1)

        const newPart = new PartUpdate()

        const newParts = [...startArray, newPart, ...endArray]


        setSceneParts(newParts)
        dispatch(changeFocus({ ...newPart, position: 'end' }))
    }

    const updateIfChanged = () => {

        const changesMade = [...sceneParts].filter(part => part.changed === true)

        if (changesMade.length > 0) {

            const preparedUpdates = prepareUpdates(changesMade)

            //update parts
            dispatch(addUpdates(preparedUpdates, 'Part'))

        }

        //Update partIds in scene scriptItem (only if list of active partIds has changed)
        let changeToPartIds = false

        const activeSceneParts = sceneParts.filter(item => item.name !== null & item.name !== '' & item.isActive === true)

        if (activeSceneParts.length !== scene.partIds.length) { changeToPartIds = true }

        for (let i = 0; i < activeSceneParts.length; i++) {
            if (activeSceneParts[i].id !== scene.partIds[i]) {
                changeToPartIds = true;
            }
        }

        if (changeToPartIds && activeSceneParts.length > 0) {
            //sends activeSceneParts to parent
            onChange(activeSceneParts.map(item => item.id));
        }

        ////Finally clear up newSceneParts so that parts made inActive and never got through to scriptItem don't reappear.

        //const newSceneParts = sceneParts.filter(item => item.isActive === true)

        //setSceneParts(newSceneParts)
    }







    //EVent Handlers

    const handleKeyDown = (e, part) => {

        const end = 'end'
        const start = 'start'

        const moveFocus = (direction) => {

            const currentPartIndex = sceneParts.findIndex(item => item.id === part.id)

            const nextPart = sceneParts[currentPartIndex + 1]
            const previousPart = sceneParts[currentPartIndex - 1]

            if (direction === up) {

                if (previousPart) {
                    moveFocusToId(previousPart.id, end)
                    //dispatch(changeFocus({ ...previousPart, position: end }))
                } else {
                    moveFocusToId(previousFocus.id, end)
                    //dispatch(changeFocus({ ...previousFocus, position: end }))
                }

            } else if (direction === down) {

                if (nextPart) {
                    moveFocusToId(nextPart.id, start)
                    // dispatch(changeFocus({ ...nextPart, position: start }))
                } else {
                    moveFocusToId(nextFocus.id, start)
                    //dispatch(changeFocus({ ...nextFocus, position: start }))
                }

            }


        }


        if (e.key === 'Enter') {
            createPart(part);//will create a new part after (part)
            return
        }

        if (e.key === 'Backspace') {

            if (!part.name || part.name === null || part.name === '') {
                e.preventDefault()
                deletePart(part)
                return
            }

            if (e.target.selectionEnd === 0) {
                e.preventDefault()
                moveFocus(up)
                return
            }

        }

        if (e.key === 'Delete') {

            if (e.target.selectionStart === e.target.value.length) {

                //find the partid below
                const currentPartIndex = sceneParts.findIndex(item => item.id === part.id)
                const nextPart = sceneParts[currentPartIndex + 1]

                //if it is empty then delete
                if (nextPart && (nextPart.name || '') === '') {
                    deletePart(nextPart)
                    return
                }

                if (nextPart && nextPart.name.length > 0) {
                    moveFocus(down)
                    return
                }

                if ((part.name || '') === '') {
                    deletePart(part)
                    return
                }
            }


        }

        if (e.key === 'ArrowUp' && e.target.selectionEnd === 0) {
            e.preventDefault()
            moveFocus(up)
            return
        }

        if (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length) {
            e.preventDefault()
            moveFocus(down)
            return
        }


    }



    const handleChange = (type, value, part) => {

        switch (type) {
            case 'text':
                const text = value;

                const partId = part.id

                const updatedParts = sceneParts.map(part => {

                    if (part.id === partId) {

                        let updatedPart = { ...part, name: text.trimStart(), changed: true }

                        return updatedPart
                    }
                    return part;
                })

                setSceneParts(updatedParts);
                break;
           default : return;
        }
    }


    const handleAvatarClick = (part) => {


        const activeParts = sceneParts.filter(item => item.isActive === true)

        const allocatedPersonIds = activeParts.filter(part => part.personId !== null).map(part => part.personId)

        const unAllocatedPersons = getLatest(storedPersons).filter(person => !allocatedPersonIds.includes(person.id))

        setModalPersons({ unAllocatedPersons: unAllocatedPersons, part: part })

    }


    const handleBlur = () => {

        updateIfChanged()

    }

    const handleClick = (action, value, part) => {

        switch (action) {
            case 'avatar': handleAvatarClick(part); break;
            case 'addTag': addTag(value, part); break;
            case 'removeTag': removeTag(value, part); break;
            case 'delete': deletePart(part); break;
            case 'add': createPart(part); break;
            case 'confirm': updateIfChanged(); break;
            case 'search': handleClickSearch(); break;
            default: return;
        }
    }


    const handleClickSearch = () => {
        alert('Search Clicked') //TODO add in search functionality
    }


    const addTag = (tag, part) => {

        const partId = part.id

        const updateParts = sceneParts.map(part => {

            if (part.id === partId) {

                return { ...part, tags: [...part.tags, tag], changed: true }
            }
            return part;

        })

        setSceneParts(updateParts)
        moveFocusToId(...part.id, end)
        //dispatch(changeFocus({ ...part, position: 'end' }))

    }

    const removeTag = (tag, part) => {

        const partId = part.id

        const updateParts = sceneParts.map(part => {
            if (part.id === partId) {

                return { ...part, tags: part.tags.filter(partTag => partTag !== tag), changed: true }
            }
            return part;
        })
        setSceneParts(updateParts)
        moveFocusToId(...part.id, end)
    }


    const handleSelectPerson = (person, part) => {

        const partId = part.id

        const updatedParts = sceneParts.map(part => {
            if (part.id === partId) {

                let partUpdate = { ...part, personId: person.id, changed: true }

                partUpdate = addPersonInfo(partUpdate, person[0])

                return partUpdate
            }

            return part;
        }
        )


        setModalPersons(null);
        setSceneParts(updatedParts);
        moveFocusToId(...part.id, end)
    }



    const closeModalPersons = () => {

        moveFocusToId(...modalPersons.part.id, end)
        setModalPersons(null);

    }

    const activeSceneParts = () => {

        return sceneParts?.filter(part => part.isActive === true) || []

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
                            onChange={(type, value) => handleChange(type, value, part)}
                            onBlur={() => handleBlur()}
                            onClick={(action, value) => handleClick(action, value, part)}
                            onKeyDown={(e, part) => handleKeyDown(e, part)}
                        />


                    )
                })}
            </div >

            {(modalPersons) &&
                <PersonSelector
                    persons={modalPersons.unAllocatedPersons}
                    tags={modalPersons.part.tags}
                    closeModal={() => closeModalPersons()}
                    onClick={(person) => handleSelectPerson(person, modalPersons.part)} />
            }

        </>



    )


}

export default PartEditor;