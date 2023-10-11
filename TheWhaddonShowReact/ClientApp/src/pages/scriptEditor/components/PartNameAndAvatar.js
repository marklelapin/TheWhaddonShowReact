import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getLatest, } from 'dataAccess/localServerUtils';
import Avatar from 'components/Avatar/Avatar';
import { Col, Row, Input } from 'reactstrap';

import { addPersonInfo } from '../scripts/PartScripts'

import { log } from 'helper';
import { changeFocus } from 'actions/navigation'

function PartNameAndAvatar(props) {

    const debug = false;
    const dispatch = useDispatch()

    const { part, onNameChange, onAvatarClick, onKeyDown, onBlur, avatar, partName, personName, size = "md" } = props;


    log(debug, 'PartNameAndAvatar Props', props)

    const storedPersons = useSelector(state => state.localServer.persons.history)


    //useEffect(() => {
    //    if (focus) {
    //        moveFocusToId(part.id, focus.position)
    //        dispatch(changeFocus(null))
    //    }
    //}, [focus])






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

    const handleFocus = (part) => {

        dispatch(changeFocus(part))
    }

    const partPerson = createPartPerson()

    log(debug, 'PartNameAndAvatar partPerson', partPerson)
    //RENDERING

    return (

        <div className="part-avatar-name">

            {(avatar) &&
                <div className="part-avatar">
                    < Avatar
                        size={size}
                        avatarInitials={partPerson.avatarInitials}
                        person={partPerson}
                        onClick={(e) => handleAvatarClick(e)} />
                </div>
            }


            {(partName) &&
                <div className="part-name">

                    <Input
                        type="text"
                        key={part.id}
                        placeholder="enter name"
                        value={part.name || ''}
                        onKeyDown={onKeyDown}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={onBlur}
                        onFocus={() => handleFocus(part)}
                        readOnly={(onNameChange) ? false : true}
                        className="text-input" />
                </div>
            }


            {/*{(personName) &&*/}
            {/*    <Row>*/}
            {/*        < small >{(part.personName) && `(${part.personName})`}</small>*/}
            {/*    </Row>*/}
            {/*}*/}
              
            


        </div >

    )

}

export default PartNameAndAvatar;