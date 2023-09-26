import React from 'react';
import s from './Avatar.module.scss'; // eslint-disable-line css-modules/no-unused-class
import adminDefault from 'images/chat/chat2.png';
import { uploadFiles } from 'dataAccess/generalUtils.js';
import {uploads_avatars} from 'dataAccess/uploadLocations'; 

//interface Props {
//    person: {};
//}

export function Avatar(props) {

    const { person, onClick, onChange = null, avatarInitials = null } = props

    const {firstName=null,email=null,pictureRef = null }=person;

    const firstUserLetter = (person && firstName) ? firstName[0].toUpperCase() : '?'

    const avatarText = avatarInitials ? avatarInitials : firstUserLetter

    const avatarTitle = person && (firstName || email)

    const inputId = `avatar-image-upload-${person.id}`

    const avatarImage = () => {
        if (pictureRef !== null) return `${uploads_avatars}/${person.pictureRef}` 
        if (person && person.role === 'admin') return adminDefault // TODO used to bring back default photo when testing. remove when live
        return false
    }

    const handleImageClick = (event) => {

        if (person.id !== null) {
        const imageInput = document.getElementById(inputId)

        if (imageInput) imageInput.click(); //trigger click event on hidden file upload element

        }
    }

    const handleImageChange = async (event) => {

        let pictureRef;

        const files = event.target.files
        if (files.length > 1) {
            alert('Please only select 1 file.')
        }

        if (files.length === 1) {
            uploadFiles(files, uploads_avatars, { showSuccessAlerts: false })
                .then(response => {
                    console.log(response)
                    console.log(response.pictureRefs[0].toString())
                    pictureRef = response.pictureRefs[0]
                    return pictureRef
                })
                .then(pictureRef => {
                    console.log('picture ref within promises: ' + pictureRef)
                    return pictureRef
                }
                    )
                .then(pictureRef => onChange(pictureRef))
 
        }

        //otherwise do nothing.
    }




    const imageJSX = () => {
        return (

            <span className={`${s.avatar} rounded-circle float-start me-3 avatar`} onClick={handleImageClick}>
                {
                    avatarImage() ?
                        <img src={avatarImage()} onError={e => e.target.src = adminDefault} alt="..." title={avatarTitle} onClick={(onClick) ? onClick : handleImageClick} />
                        :
                        < span title={avatarTitle} > {avatarText} </span>
                }
            </span>
        )

    }


    return (

        (onClick || onChange) ?
            //hidden image file upload element
            <div style={{ cursor: 'pointer' } }>
                <input
                    accept="image/*" onChange={handleImageChange}
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