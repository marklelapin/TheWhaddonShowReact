import React from 'react';
import { useSelector } from 'react-redux';
import s from './Avatar.module.scss'; // eslint-disable-line css-modules/no-unused-class
import adminDefault from 'images/chat/chat2.png';


//interface Props {
//    person: {};
//}

function Avatar(props) {

    const { person } = props

    const avatar = person && person.avatar && person.avatar.length && person.avatar[0].publicUrl;

    const firstUserLetter = person && (person.firstName || person.email)[0].toUpperCase();

    return (
        <span className={`${s.avatar} rounded-circle float-start me-3`}>
            {
                avatar ? (
                    <img src={avatar} onError={e => e.target.src = adminDefault} alt="..." title={person && (person.firstName || person.email)} />
                )
                    : person && person.role === 'admin' ? (
                        <img src={adminDefault} onError={e => e.target.src = adminDefault} alt="..." title={person && (person.firstName || person.email)} />
                    ) : <span title={person && (person.firstName || person.email)}>{firstUserLetter}</span>
            }
        </span>
    )

}

export default Avatar