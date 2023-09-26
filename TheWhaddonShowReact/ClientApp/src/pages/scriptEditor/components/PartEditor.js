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

function PartEditor(props) {

    const { partIds } = props;

    const dispatch = useDispatch();

    const storedPersons = useSelector((state) => state.localServer.persons.history || [])

    const storedParts = useSelector((state) => state.localServer.parts.history || [])


    //Refs
    const addButtonRef = useRef();
    const newInputRef = useRef();

    //SETUP SCENE AND OTHER PARTS STATE
    const joinPersonsToParts = (parts, persons) => {

        let partsArray = [...parts]
        const personsArray = [...persons]
        //joins on person to get person information
        partsArray = partsArray.map(part => part.allocation = personsArray.find(person => person.id === part.personId) || null)
        return partsArray
    }



    const updateAvatarInfo = (part) => {

        if (!part) return null
        const updatedPart = {
            ...part, firstName: part.name
            , avatarInitials: (part.name) ? part.name.split(' ').map(word => word[0]).join('') : '?'
            , pictureRef: (part.allocation) ? part.allocation.pictureRef : null
        }

        return updatedPart

    }


    const addAvatarInfo = (parts) => {

        let partsArray = [...parts]
        partsArray = partsArray.map(part => updateAvatarInfo(part))

        return partsArray
    }

    const setupParts = (parts, persons) => {

        const addPersons = joinPersonsToParts(parts, persons)

        const partsWithAvatarInfo = addAvatarInfo(addPersons)

        const sortedParts = partsWithAvatarInfo.sort((a, b) => a.name.localeCompare(b.name))

        return sortedParts;
    }
    // functions for useState hook for allocatedParts
    const addNewPart = (existingParts) => {

        const parts = [...existingParts]

        const newPart = new PartUpdate()
        newPart.new = true
        parts.push(newPart)

        return parts

    }
    const resetParts = () => {
        const allParts = setupParts(storedParts, storedPersons)

        const currentParts = allParts.filter(part => partIds.includes(part.id))
        const sceneParts = addNewPart(currentParts)

        const otherParts = allParts.filter(part => !partIds.includes(part.id))

        setSceneParts(sceneParts)
        setOtherParts(otherParts)
    }


    const [toggleReset, setToggleReset] = useState(false);
    const [sceneParts, setSceneParts] = useState([])
    const [otherParts, setOtherParts] = useState([])
    useEffect(() => {
        resetParts()
    }, [])
    useEffect(() => {
        resetParts()
    }, [partIds, storedParts, storedPersons, toggleReset])








    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && addButtonRef) {
            addButtonRef.current.click();
        }
    }
    const handleNameChange = (event, partId) => {

        const updatedParts = sceneParts.map(part => {

            if (part.id === partId) {

                let updatedPart = { ...part, name: event.target.value, changed: true }
                updatedPart = updateAvatarInfo(updatedPart)

                return updatedPart
            }
            return part;
        })

        setSceneParts(updatedParts);
    }

    const handleDelete = (partId) => {
        const updatedParts = sceneParts.map(part => {
            if (part.id === partId) {
                return { ...part, isActive: false, changed: true }
            }
            return part;
        })

        setSceneParts(updatedParts);

    }

    const handleAdd = (event, partId) => {

        const updatedParts = sceneParts.map(part => {
            if (part.id === partId) {

                const partUpdate = { ...part }

                delete partUpdate.new
                part.changed = true

                return partUpdate
            }
            return part;
        })

        setSceneParts(addNewPart(updatedParts))

    }

    const hasChanged = () => {

        return sceneParts.some(part => part.changed === true)

    }

    const handleSearch = (partId) => {


    }
    const handleUpdate = () => {

        const changesMade = sceneParts.filter(part => part.changed === true)

        changesMade.forEach(part => {
            delete part.changed
            delete part.new
        })

        const preparedUpdates = prepareUpdates(changesMade)

        dispatch(addUpdates(preparedUpdates, 'Part'))

    }

    const handleCancel = () => {
        setToggleReset(!toggleReset)
    }



    const handleAvatarClick = (person) => {

        console.log("hello")

    }



    const handleAddTag = (tag, partId) => {

        const updateParts = sceneParts.map(part => {

            if (part.id === partId) {

                return { ...part, tags: [...part.tags, tag] }
            }
            return part;

        })

        setSceneParts(updateParts)

    }

    const handleRemoveTag = (tag,partId) => {

        const updateParts = sceneParts.map(part => {
            if (part.id === partId) {

                return { ...part, tags: part.tags.filter(partTag => partTag !== tag) }
            }
            return part;
        })
        setSceneParts(updateParts)
    }


    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']

    const activeSceneParts = () => { return sceneParts.filter(part => part.isActive === true) }


    return (

        <>
            <div className="part-editor draft-border">

                {activeSceneParts().map(part => {



                    return (
                        <Container className="allocated-parts" key={part.id}>

                            <Row>
                                <Col>

                                    < Avatar avatarInitials={part.avatarInitials} person={part} onClick={handleAvatarClick()} />

                                    {(part.new) ?
                                        <Input type="text" key={part.id} placeholder="enter name" value={part.name || ''} onKeyPress={handleKeyPress} onChange={(e) => handleNameChange(e, part.id)} ref={newInputRef} />
                                        : <Input type="text" key={part.id} placeholder="enter name" value={part.name || ''} onKeyPress={handleKeyPress} onChange={(e) => handleNameChange(e, part.id)} />

                                    }


                                    {(part.new) ?
                                        <>
                                            <Button color="success" size="xs" onClick={(e) => handleAdd(e, part.id)}><i className="fa fa-plus" ref={addButtonRef} /></Button>
                                            <Button color="warning" size="xs" onClick={(e) => handleSearch(part.id)}><i className="fa fa-search" /></Button>
                                        </>

                                        : <Button color="danger" sixe="xs" onClick={(e) => handleDelete(part.id)}><i className="fa fa-remove" /></Button>}


                                </Col>

                                <Col xs={6}>
                                    <TagsInput strapColor="primary" tags={part.tags} tagOptions={tagOptions} onClickAdd={(tag) => handleAddTag(tag, part.id)} onClickRemove={(tag) => handleRemoveTag(tag, part.id)} />
                                </Col>

                            </Row>





                        </Container>
                    )
                })}
                <FormGroup>
                    <Update id="save" hasChanged={hasChanged()} onClickUpdate={handleUpdate} onClickCancel={handleCancel} isNew={false} ></Update >

                </FormGroup>
            </div>




        </>



    )


}

export default PartEditor;