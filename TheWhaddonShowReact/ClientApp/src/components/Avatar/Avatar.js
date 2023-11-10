import React from 'react';
import { useEffect, useState } from 'react';
import s from './Avatar.module.scss'; // eslint-disable-line css-modules/no-unused-class
import adminDefault from '../../images/chat/chat2.png';
import { uploadFiles, fetchFiles } from '../../dataAccess/generalUtils.js';
import { AVATARS, MEDIA } from '../../dataAccess/storageContainerNames';
import { log } from '../../helper';
//interface Props {
//    person: {};
//}

export function Avatar(props) {

    const debug = true;

    const { person: draftPerson, onClick = null, onChange = null, avatarInitials = null, linkId = null, size = 'md' } = props

    const person = draftPerson || {}


    const { firstName = null, email = null, pictureRef = null } = person;

    const firstUserLetter = (person && firstName) ? firstName[0].toUpperCase() : '?'

    const avatarText = avatarInitials ? avatarInitials : firstUserLetter

    const avatarTitle = person && (firstName || email)

    const inputId = `avatar-image-upload-${person.id}`

    const [avatarURL, setAvatarURL] = useState(null);

    log(debug, 'Avatar person', person)

    useEffect(() => {
        log(debug,'Avatar useEffect pictureRef', pictureRef)
        const getAvatarURL = async () => {
            const response = await avatarImageObjectURL(pictureRef)
            log(debug,'Avatar useEffect response', JSON.stringify(response))
            setAvatarURL(response)
        }

        getAvatarURL()

    }, [person])

    const avatarImageObjectURL = async (pictureRef) => {

        let files = []
        let imageObjectURL;
        try {

            log(debug, 'avatarImageObjectURL pictureRef', pictureRef)
            files = await fetchFiles(AVATARS, pictureRef)
        }
        catch (error) {
            log(debug, 'avatarImageObjectURL error', error.message)
        }

        if (files && files.length > 0) {
            try {
                imageObjectURL = URL.createObjectURL(files[0])
            }
            catch (error) {
                throw new Error(`Error creating object URL for ${AVATARS} files: ` + error.message)
            }

        } else {
            if (person && person.role === 'admin') {
                imageObjectURL = adminDefault
            }
        }

        return imageObjectURL
        
    }

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

            <span className={`${s.avatar} rounded-circle float-start avatar`} onClick={(e) => handleImageClick(e)} style={avatarSize()}>
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