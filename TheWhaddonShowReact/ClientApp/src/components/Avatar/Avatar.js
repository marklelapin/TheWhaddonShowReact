﻿import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components

import { uploadFiles } from '../../dataAccess/fileUtils.js';

//Constants
import { addToCache } from '../../actions/cache';
import { AVATARS } from '../../dataAccess/storageContainerNames';

//utils
import { log, AVATAR as logType } from '../../dataAccess/logging';
import classnames from 'classnames';
import s from './Avatar.module.scss';


export function Avatar(props) {

    const dispatch = useDispatch();

    const { person: draftPerson, partId = null, onClick = null, onChange = null, avatarInitials = null, linkId = null, size = 'md',color = null } = props

    //establish person object
    const partPersonFromId = useSelector(state => state.scriptEditor.currentPartPersons[partId]) || null
    const person = draftPerson || partPersonFromId || {}
    const { email = null, pictureRef = null } = person;

    const firstName = (person.personName) ? person.personName.split(' ')[0] : person.firstName

    //get storedObjectUrl of create one.
    const storedObjectURL = useSelector(state => state.cache[AVATARS][pictureRef])

    log(logType, 'props', { storedObjectURL })
    //if (storedObjectURL === undefined && pictureRef) {
    //    createAvatarObjectURL(pictureRef, dispatch)
    //}
    //log(logType, 'Component:Avatar props', props)
    //log(logType, 'Component:Avatar person', { person, draftPerson, partPersonFromId })

    const firstUserLetters = (person && firstName) ? `${firstName[0].toUpperCase()}${(firstName[1]) ? firstName[1].toLowerCase() : ''}` : '?'

    const avatarText = avatarInitials ? avatarInitials : firstUserLetters

    const avatarTitle = person && (firstName || email)

    const inputId = `avatar-image-upload-${person.id}`

    const avatarImageObjectURL = (storedObjectURL) || null


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
        event.preventDefault();
        const files = event.target.files
        if (files.length > 1) {
            alert('Please only select 1 file.')
        }

        log(logType, 'handleImageChange files', files)

        if (files.length === 1) {
            const response = await uploadFiles(files, AVATARS, { showSuccessAlerts: false, width: 60, height: 60, compressionQuality: 50 })

            const pictureRef = response.blobNames[0]?.toString()

            const imageObjectURL = await createObjectURL(files[0])

            dispatch(addToCache(AVATARS, pictureRef, imageObjectURL))

            log(logType, 'handleImageChange pictureRef', pictureRef)
            onChange(pictureRef)

        }

        //otherwise do nothing.
    }

    const imageJSX = () => {
        return (

            <span className={classnames(s.avatar,
                'rounded-circle',
                'float-start',
                'avatar',
                onClick ? 'clickable' : null,
                s[size],
                
            )}
                style={{ backgroundColor: color }}
                onClick={(e) => handleImageClick(e)} >
                {avatarImageObjectURL ?
                    <img src={avatarImageObjectURL} alt="..." title={avatarTitle} onClick={(e) => handleImageClick(e)} /> //={e => e.target.src = adminDefault} 
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
                    accept="image/*" onChange={(e) => handleImageChange(e)}

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


const createObjectURL = async (file) => {
    try {
        const imageObjectURL = URL.createObjectURL(file)
        return imageObjectURL
    }
    catch (error) {
        throw new Error(`Error creating object URL for ${AVATARS} files: ` + error.message)
    }
}