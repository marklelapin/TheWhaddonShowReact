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
import { setupParts, addNewPart, updatePersonInfo } from '../scripts/PartScripts'
import PersonSelector from './PersonSelector';
import { store } from 'index.js';
function PartEditor(props) {


    const debug = false;

    debug && console.log('PartEditorProps')
    debug && console.log(props)

    const { partIds = [], onChange} = props;

    const dispatch = useDispatch();


    const getStoredPersons = (state) => state.localServer.persons.history
    const getStoredParts = (state) => state.localServer.parts.history

    const storedPersonsSelector = createSelector(
        [getStoredPersons],
        (item) => getLatest(item))
    const storedPartsSelector = createSelector(
        [getStoredParts],
        (item) => getLatest(item))
    const storedPersons = storedPersonsSelector(store.getState())
    const storedParts = storedPartsSelector(store.getState())



    debug && console.log('storedParts from PartEditor.js')
    debug && console.log(storedParts)
    debug && console.log('storedPersons from PartEditor.js')
    debug && console.log(storedPersons)

    //Refs
    const addButtonRef = useRef();
    const newInputRef = useRef();




    const resetParts = () => {

        const storedPartsArray = [...storedParts]
        const storedPersonsArray = [...storedPersons]

        const allParts = setupParts(storedPartsArray, storedPersonsArray)

        const currentParts = allParts.filter(part => partIds.includes(part.id))
        const newSceneParts = addNewPart(currentParts)

        const newOtherParts = allParts.filter(part => !partIds.includes(part.id))

        setSceneParts(newSceneParts)
        setOtherParts(newOtherParts)
    }


    const [toggleReset, setToggleReset] = useState(false);
    const [modalPersons, setModalPersons] = useState(null); //if populated opens up selectperson modal

    const [sceneParts, setSceneParts] = useState([])
    const [otherParts, setOtherParts] = useState([])


    useEffect(() => {
        resetParts()
    }, [])
    //useEffect(() => {
    //    resetParts()
    //}, [toggleReset,storedParts])



    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && addButtonRef) {
            addButtonRef.current.click();
        }
    }
    const handleNameChange = (event, partId) => {

        const updatedParts = sceneParts.map(part => {

            if (part.id === partId) {

                let updatedPart = { ...part, name: event.target.value, changed: true }
                updatedPart = updatePersonInfo(updatedPart,storedPersons)

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

        //update parts
        dispatch(addUpdates(preparedUpdates, 'Part'))

        //updates scene by sending back data

        const newScenePartIds = activeSceneParts().map(item=>item.id)
        onChange(newScenePartIds);

    }

    const handleCancel = () => {
        setToggleReset(!toggleReset)
    }



    const handleAvatarClick = (part) => {

        const allocatedPersonIds = sceneParts.filter(part => part.personId !== null).map(part => part.personId)

        const unAllocatedPersons = storedPersons.filter(person => !allocatedPersonIds.includes(person.id))

        


        setModalPersons({ unAllocatedPersons: unAllocatedPersons, part: part })

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

    const handleRemoveTag = (tag, partId) => {

        const updateParts = sceneParts.map(part => {
            if (part.id === partId) {

                return { ...part, tags: part.tags.filter(partTag => partTag !== tag) }
            }
            return part;
        })
        setSceneParts(updateParts)
    }


    const handleSelectPerson = (personId, partId) => {

        const updatedParts = sceneParts.map(part => {
            if (part.id === partId) {

                let partUpdate = { ...part, personId: personId, changed: true }
                partUpdate = updatePersonInfo(partUpdate, storedPersons)
                
                return partUpdate
            }

            return part;
        }
        )
        setModalPersons(null);
        setSceneParts(updatedParts);
    }


    const closeModalPersons = () => {

        setModalPersons(null);
    }




    const tagOptions = ['male', 'female', 'kid', 'teacher', 'adult']

    const activeSceneParts = () => { return sceneParts.filter(part => part.isActive === true) }
    debug && console.log('Active Scene Parts')
    debug && console.log(activeSceneParts())
    debug && console.log('ModalPersons')
    debug && console.log(modalPersons)

    return (

        <>
            <div className="part-editor draft-border">

                {activeSceneParts().map(part => {

                    return (

                        <Container className="allocated-parts" key={part.id}>

                            <Row>
                                <Col>

                                    < Avatar avatarInitials={part.avatarInitials} person={part} onClick={() => handleAvatarClick(part)} />

                                    {(part.new) ?
                                        <Input type="text" key={part.id} placeholder="enter name" value={part.name || ''} onKeyPress={(e)=>handleKeyPress(e)} onChange={(e) => handleNameChange(e, part.id)} ref={newInputRef} />
                                        : <Input type="text" key={part.id} placeholder="enter name" value={part.name || ''} onKeyPress={(e)=>handleKeyPress(e)} onChange={(e) => handleNameChange(e, part.id)} />
                                    }


                                    {(part.new) ?
                                        <>
                                            <Button color="success" size="xs" onClick={(e) => handleAdd(e, part.id)}><i className="fa fa-plus" ref={addButtonRef} /></Button>
                                            <Button color="warning" size="xs" onClick={(e) => handleSearch(part.id)}><i className="fa fa-search" /></Button>
                                        </>

                                        : <Button color="danger" size="xs" onClick={(e) => handleDelete(part.id)}><i className="fa fa-remove" /></Button>}

                                </Col>

                                <Col xs={6}>
                                    <TagsInput strapColor="primary" tags={part.tags} tagOptions={tagOptions} onClickAdd={(tag) => handleAddTag(tag, part.id)} onClickRemove={(tag) => handleRemoveTag(tag, part.id)} />
                                </Col>

                            </Row>

                        </Container>
                    )
                })}
                <FormGroup>
                    <Update id="save" hasChanged={hasChanged()} onClickUpdate={()=>handleUpdate()} onClickCancel={() => handleCancel()} isNew={false} ></Update >

                </FormGroup>
            </div>


            {(modalPersons) &&
                <PersonSelector persons={modalPersons.unAllocatedPersons} tags={modalPersons.part.tags} closeModal={()=>closeModalPersons()} onClick={(personId) => handleSelectPerson(personId, modalPersons.part.id)} />
            }

        </>



    )


}

export default PartEditor;