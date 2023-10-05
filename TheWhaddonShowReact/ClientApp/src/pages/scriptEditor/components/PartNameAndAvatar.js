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
import { addPersonInfo } from '../scripts/PartScripts'
import PersonSelector from './PersonSelector';
import { store } from 'index.js';
import { moveFocusToId } from '../scripts/utilityScripts';
import { log } from 'helper';
import { changeFocus } from 'actions/navigation'

function PartNameAndAvatar(props) {

    const debug = false;
    const dispatch = useDispatch()

    const { part, onNameChange, onAvatarClick, onKeyDown, onBlur, focus, avatar, partName, personName, size="sm" } = props;


    log(debug, 'PartNameAndAvatar Props', props)

    const storedPersons = useSelector(state => state.localServer.persons.history)


    useEffect(() => {
        if (focus) {
            moveFocusToId(part.id, focus.position)
            dispatch(changeFocus(null))
        }
    }, [focus])






    const createPartPerson = () => {

        if (part) {
            const person = getLatest([...storedPersons].filter(person => person.id === part.personId))[0]

            const partPerson = addPersonInfo(part, person)

            return partPerson
        }

        return part

    }





    //EVENT HANDLERS
    const handleAvatarClick = (e) => {
        if (props.onAvatarClick) {

            onAvatarClick(e)
        }

    }

    const handleNameChange = (text) => {

        if (props.onNameChange) {
            onNameChange(text)
        }
    }

    const partPerson = createPartPerson()

    log(debug, 'PartNameAndAvatar partPerson', partPerson)
    //RENDERING

    return (

        <Row className="part-name-and-avatar">

            {(avatar) &&
                <Col  xs="auto" className="part-avatar-col">
                    < Avatar
                        size={size}
                        avatarInitials={partPerson.avatarInitials}
                        person={partPerson}
                        onClick={(e) => handleAvatarClick(e)} />
                </Col>
            }


            {(partName) &&
                <Col>
                    <Row>
                        <Input
                            type="text"
                            key={part.id}
                            placeholder="enter name"
                            value={part.name || ''}
                            onKeyDown={onKeyDown}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={onBlur}
                            readOnly={(onNameChange) ? false : true}
                            className="text-input" />

                    </Row>
                    {(personName) &&
                        <Row>
                            < small >{(part.personName) && `(${part.personName})`}</small>
                        </Row>
                    }
                </Col>
            }


        </Row >

    )

}

export default PartNameAndAvatar;