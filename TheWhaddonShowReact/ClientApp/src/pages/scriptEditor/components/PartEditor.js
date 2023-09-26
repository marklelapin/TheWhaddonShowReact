import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import Avatar from 'components/Avatar/Avatar';
import { InputGroup, Input, Button, FormGroup } from 'reactstrap';
import { PartUpdate } from 'dataAccess/localServerModels';
import Update from 'components/Forms/Update';
import { addUpdates } from 'actions/localServer';

function PartEditor(props) {

    const { partIds } = props;

    const dispatch = useDispatch();

    const persons = useSelector((state) => getLatest(state.localServer.persons.history) || [])
    const parts = useSelector((state) => getLatest(state.localServer.parts.history.filter(part => partIds.includes(part.id)) || []))



    // functions for useState hook for allocatedParts
    const addNewPart = (existingParts) => {

        const parts = [...existingParts]

        const newPart = new PartUpdate()
        newPart.new = true
        parts.push(newPart)

        return parts

    }

    const joinPersonsToParts = (parts, persons) => {

        let partsArray = parts
        const personsArray = persons

        //joins on person to get person information
        partsArray.map(part => part.allocation = personsArray.find(person => person.id === part.personId) || null)

        //also adds in new part with no allocation to enable adding new parts
        partsArray = addNewPart(partsArray)

        return partsArray

    }

    const [allocatedParts, setAllocatedParts] = useState(joinPersonsToParts(parts, persons))

    useEffect(() => {
        console.log('use effect in PartEditor')
        setAllocatedParts(joinPersonsToParts(parts, persons))
    }, [parts, persons]) //eslint-disable-line react-hooks/exhaustive-deps













    const handleNameChange = (event, partId) => {

        const updatedParts = allocatedParts.map(part => {

            if (part.id === partId) {
                return { ...part, name: event.target.value, changed: true }
            }



            return part;
        })

        setAllocatedParts(updatedParts);
    }

    const handleDelete = (partId) => {
        const updatedParts = allocatedParts.map(part => {
            if (part.id === partId) {
                return { ...part, isActive: false, changed: true }
            }
            return part;
        })

        setAllocatedParts(updatedParts);

    }

    const handleAdd = (event, partId) => {

        const updatedParts = allocatedParts.map(part => {
            if (part.id === partId) {
                return { ...part, changed: true, new: false }
            }
            return part;
        })

        setAllocatedParts(addNewPart(updatedParts))
    }

    const hasChanged = () => {

        return allocatedParts.some(part => part.changed === true)

    }
    const handleUpdate = () => {
      
        const changesMade = allocatedParts.filter(part => part.changed === true)

        changesMade.forEach(part => {
            delete part.changed
            delete part.new

        })

        const preparedUpdates = prepareUpdates(changesMade)

        dispatch(addUpdates(preparedUpdates, 'Part'))

    }

    const handleCancel = () => {
        setAllocatedParts(joinPersonsToParts(parts, persons))
    }




    return (

        <div className="part-editor draft-border">

            {allocatedParts.map(part => {

                part.firstName = part.name || '';

                (part.name) ? part.initials = part.name.split(' ').map(word => word[0]).join('')
                    : part.initials = '?';

                return (
                    <div className="allocated-parts">

                        <FormGroup>
                            <InputGroup>
                                < Avatar avatarInitials={part.initials} person={part} />

                                {(part.new) ? (<Input type="text" placeholder="enter new part name" />)
                                    : (<Input type="text" key={part.id} placeholder="enter name" value={part.name || ''} onChange={(e) => handleNameChange(e, part.id)} />)}

                                {(part.new) ? <Button color="success"  onClick={(e) => handleAdd(e, part)}><i className="fa fa-plus" /></Button>
                                    : <Button color="danger" onClick={(e) => handleDelete(part.id)}><i className="fa fa-remove" /></Button>}

                            </InputGroup>
                        </FormGroup>



                    </div>
                )
            })}
            <FormGroup>
                <Update id="save" hasChanged={hasChanged()} onClickUpdate={handleUpdate} onClickCancel={handleCancel} isNew={false} ></Update >

            </FormGroup>
        </div>

    )


}

export default PartEditor;