import React from 'react';
import {  useSelector } from 'react-redux';

//Components

import { uploadFiles } from '../../dataAccess/fileUtils.js';

//Constants
import { AVATARS } from '../../dataAccess/storageContainerNames';
import adminDefault from '../../images/chat/chat2.png';

//utils
import { log } from '../../logging';

import s from './Avatar.module.scss'; 


export function Avatar(props) {

    const debug = true;

    const { person: draftPerson, partId = null, onClick = null, onChange = null, avatarInitials = null, linkId = null, size = 'md' } = props

    const partPersonFromId = useSelector(state => state.scriptEditor.currentPartPersons[partId]) || null

    const person = draftPerson || partPersonFromId || {}

    log(debug, 'Component:Avatar props', props)
    log(debug, 'Component:Avatar person', {person,draftPerson,partPersonFromId})

    const { firstName = null, email = null, pictureRef = null } = person;

    const firstUserLetter = (person && firstName) ? firstName[0].toUpperCase() : '?'

    const avatarText = avatarInitials ? avatarInitials : firstUserLetter

    const avatarTitle = person && (firstName || email)

    const inputId = `avatar-image-upload-${person.id}`

    const avatarImageObjectURL = useSelector(state => state.cache[AVATARS][pictureRef])

    const avatarURL = avatarImageObjectURL ? avatarImageObjectURL : pictureRef 

    log(debug, 'Avatar person', person)



    //Event Handlers
    const handleImageClick = (event) => {
        event.stopPropagation();
        if (onClick) {
            onClick(event, linkId)
        } else {
            if (person?.id !== null) {
                const imageInput = document.getElementById(inputId)
                if (imageInput) imageInput.click(); //trigger click event on hidden file upload element
            }
        }
    }

    const handleImageChange = async (event) => {

        const files = event.target.files
        if (files.length > 1) {
            alert('Please only select 1 file.')
        }

        if (files.length === 1) {
            const response = await uploadFiles(files, AVATARS, { showSuccessAlerts: false })

            const pictureRef = response.blobNames[0].toString()

            log(debug, 'handleImageChange pictureRef', pictureRef)
            onChange(pictureRef)

        }

        //otherwise do nothing.
    }

    const avatarSize = () => {

        switch (size) {
            case "md": return { height: '40px', width: '40px' }
            case "sm": return { height: '30px', width: '30px' }
            case "xs": return { height: '20px', width: '20px' }
            default: return { height: '40px', width: '40px' }
        }
    }



    const imageJSX = () => {
        return (

            <span className={`${s.avatar} rounded-circle float-start avatar ${(onClick) ? 'clickable' : ''}`} onClick={(e) => handleImageClick(e)} style={avatarSize()}>
                {avatarURL ?
                    <img src={avatarURL} onError={e => e.target.src = adminDefault} alt="..." title={avatarTitle} onClick={(e) => handleImageClick(e)} />
                    :
                    < span title={avatarTitle} > {avatarText} </span>
                }
            </span>
        )

    }


    return (

        (!onClick && onChange) ?
            //hidden image file upload element
            <div style={{ cursor: 'pointer' }}>
                <input
                    accept="image/*" onChange={(e)=>handleImageChange(e)}
                   
                    className="avatar-image-upload"
                    id={inputId}
                    type="file" name="file" />

                {imageJSX()}

            </div>
            : //if no onClick or onChange then just return the image
            imageJSX()
    )

}

export default Avatar