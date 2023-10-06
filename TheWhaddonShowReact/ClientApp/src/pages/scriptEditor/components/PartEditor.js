import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import Avatar from 'components/Avatar/Avatar';
import { InputGroup, Input, Button, FormGroup, Container, Col, Row } from 'reactstrap';
import { PartUpdate } from 'dataAccess/localServerModels';
import Update from 'components/Forms/Update';
import { addUpdates } from 'actions/localServer';
import TagsInput from '../../../components/Forms/TagsInput';
import { setupParts, addNewPart, addPersonInfo } from '../scripts/PartScripts'
import PersonSelector from './PersonSelector';

import { store } from 'index.js';
import { log } from 'helper'
import PartNameAndAvatar from './PartNameAndAvatar';
import { moveFocusToId } from '../scripts/utilityScripts';
import { setWith } from 'lodash';
import { changeFocus } from 'actions/navigation';

function PartEditor(props) {

    //utility consts
    const debug = true
    const dispatch = useDispatch();
    const up = 'up';
    const down = 'down';

    //props
    const { scene = null, onChange, previousFocus, nextFocus } = props;

    log(debug, 'PartEditorProps', props)

    if (scene === null) {
        throw new Error('PartEditor: scene prop is null')
    }
   

    //Get persons and parts data from REdux Store
    //const storedPartPersons = useSelector(state => state.scriptEditor.partPersons)
    const storedSceneParts = useSelector(state => state.scriptEditor.scenePartPersons[scene.id]) 
    const storedPersons = useSelector(state => state.localServer.persons.history)

    log(debug, 'storedSceneParts', storedSceneParts)

    const focus = useSelector(state => state.navigation.focus)

    //copy them to internal state that then gets edited before saving on blur
    const [sceneParts, setSceneParts] = useState([])

    useEffect(() => {
        setSceneParts(storedSceneParts?.partPersons || [])
    }, [])

    useEffect(() => {
        setSceneParts(storedSceneParts?.partPersons || [])
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

        dispatch(changeFocus({ ...newFocus, position: 'end' }))

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
                    dispatch(changeFocus({ ...previousPart, position: end }))
                } else {
                    dispatch(changeFocus({ ...previousFocus, position: end }))
                }

            } else if (direction === down) {

                if (nextPart) {
                    dispatch(changeFocus({ ...nextPart, position: start }))
                } else {
                    dispatch(changeFocus({ ...nextFocus, position: start }))
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



    const handleNameChange = (text, part) => {

        const partId = part.id

        const updatedParts = sceneParts.map(part => {

            if (part.id === partId) {

                let updatedPart = { ...part, name: text.trimStart(), changed: true }

                return updatedPart
            }
            return part;
        })

        setSceneParts(updatedParts);
    }


    const handleAvatarClick = (part) => {


        const activeParts = sceneParts.filter(item => item.isActive === true)

        const allocatedPersonIds = activeParts.filter(part => part.personId !== null).map(part => part.personId)

        const unAllocatedPersons = getLatest(storedPersons).filter(person => !allocatedPersonIds.includes(person.id))

        setModalPersons({ unAllocatedPersons: unAllocatedPersons, part: part })

    }




    const handleClickDelete = (part) => { //tODDO check part is passed back
        deletePart(part)
    }

    const handleClickAdd = (part) => { //TODO checke part is passed back  
        createPart(part)//will create a new part after (part)

    }



    const handleBlur = () => {

        updateIfChanged()

    }




    const handleClickSearch = () => {
        //TODO

    }







    const handleAddTag = (tag, part) => {

        const partId = part.id

        const updateParts = sceneParts.map(part => {

            if (part.id === partId) {

                return { ...part, tags: [...part.tags, tag], changed: true }
            }
            return part;

        })

        setSceneParts(updateParts)
        dispatch(changeFocus({ ...part, position: 'end' }))

    }

    const handleRemoveTag = (tag, part) => {

        const partId = part.id

        const updateParts = sceneParts.map(part => {
            if (part.id === partId) {

                return { ...part, tags: part.tags.filter(partTag => partTag !== tag), changed: true }
            }
            return part;
        })
        setSceneParts(updateParts)
        dispatch(changeFocus({ ...part, position: 'end' }))
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
        dispatch(changeFocus({ ...part, position: 'end' }))
    }



    const closeModalPersons = () => {

        dispatch(changeFocus({ ...modalPersons.part, position: 'end' }))
        setModalPersons(null);

    }



    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']

    const activeSceneParts = () => {

        return sceneParts?.filter(part => part.isActive === true) || []

    }
    log(debug, 'Active Scene Parts', activeSceneParts())
    log(debug, 'ModalPersons', modalPersons)


    return (

        <>
            <Row className="part-editor draft-border">
                <Col>
                    <h5>Parts:</h5>
                    {activeSceneParts().map(part => {

                        return (

                            <Row key={part.id}>
                                <Col>
                                    <div id={part.id} className="part">

                                        <PartNameAndAvatar avatar partName personName

                                            avatarInitials={part.avatarInitials}
                                            part={part}
                                            onAvatarClick={(e, linkId) => handleAvatarClick(part)}
                                            onNameChange={(text) => handleNameChange(text, part)}
                                            onKeyDown={(e) => handleKeyDown(e, part)}
                                            onBlur={(e) => handleBlur(e, part)}
                                            focus={(focus?.id === part.id) ? focus : null}
                                        />
                                    </div>
                                </Col>
                                <Col xs="auto">

                                    {(activeSceneParts().length > 1) &&
                                        <Button color="danger" size="xs" onClick={(e) => handleClickDelete(part)}><i className="fa fa-remove" /></Button>
                                    }
                                    <Button color="warning" size="xs" onClick={(e) => handleClickSearch(part)}><i className="fa fa-search" /></Button>
                                </Col>
                                <Col xs="12" md="7">
                                    <TagsInput
                                        strapColor="primary"
                                        tags={part.tags}
                                        tagOptions={tagOptions}
                                        onClickAdd={(tag) => handleAddTag(tag, part)}
                                        onClickRemove={(tag) => handleRemoveTag(tag, part)} />
                                </Col>
                            </Row>


                        )
                    })}

                    <Button color="success" size="xs" onClick={(e) => handleClickAdd(e, sceneParts[sceneParts.length-1])}><i className="fa fa-plus" /></Button>
                </Col >

            </Row >


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