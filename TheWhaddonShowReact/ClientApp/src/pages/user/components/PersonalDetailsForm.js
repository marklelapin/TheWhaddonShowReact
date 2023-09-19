import React from 'react';
import InputText from 'components/Forms/InputText';
import Avatar from 'components/Avatar/Avatar';
import '../User.module.css'
import '../Users.module.scss'


function PersonalDetailsForm(props) {

    const {person, onFirstNameChange, onLastNameChange, onEmailChange} = props

 
    return (
        <div id="personal-details" className="draft-border">
            <div className="avatar">
                <Avatar person={person} />"
            </div>
            <div id="full-name-email">
                <div id="full-name">
                    <InputText id="first-name" placeholder="Enter first name" value={person.firstName} onChange={onFirstNameChange} />
                    <InputText id="last-name" placeholder="Enter last name" value={person.lastName} onChange={onLastNameChange} />
                </div>
                <div id="email">
                    <InputText id="email" placeholder="Enter email" value={person.email} onChange={onEmailChange} />
                </div>
            </div>
        </div>
    )

}

export default PersonalDetailsForm;