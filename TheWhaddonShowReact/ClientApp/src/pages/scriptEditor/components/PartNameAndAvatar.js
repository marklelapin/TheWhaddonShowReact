import React from 'react';
import { useSelector } from 'react-redux';

import { getLatest, } from '../../../dataAccess/localServerUtils';
import Avatar from '../../../components/Avatar/Avatar';
import {  Input } from 'reactstrap';

import { addPersonInfo } from '../scripts/part'

import { log } from '../../../helper';
import s from '../ScriptItem.module.scss';

function PartNameAndAvatar(props) {

    const debug = false;

    const { part, onNameChange, onAvatarClick, onClick, onKeyDown, onBlur, onFocus, avatar, partName, personName, size = "md" ,selected = false} = props;


    log(debug, 'PartNameAndAvatar Props', props)

    const storedPersons = useSelector(state => state.localServer.persons.history)


  





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
        e.stopPropagation();
        if (props.onAvatarClick) {
            onAvatarClick(e);
        } else if (props.onClick) {
            onClick(e);
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

        <div className={`${s['part-avatar-name']} ${onClick ? 'clickable' : ''} ${(selected)? s['selected'] : ''}` } onClick={onClick} >

            {(avatar) &&
                <div className={s["part-avatar"]}>
                    < Avatar
                        size={size}
                        avatarInitials={partPerson.avatarInitials}
                        person={partPerson}
                        onClick={(e) => handleAvatarClick(e)} />
                </div>
            }


            {(partName) &&
                <div className={s["part-name"]}>
                    {(onNameChange) &&
                     
                        <Input
                        type="text"
                        key={part.id}
                        placeholder="enter name"
                        value={part.name || ''}
                        onKeyDown={onKeyDown}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        className="text-input"
                            />               
               
                    }

                    {(!onNameChange) && 
                       

                        <p>{part.name}</p>
                      
                        }
                    
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