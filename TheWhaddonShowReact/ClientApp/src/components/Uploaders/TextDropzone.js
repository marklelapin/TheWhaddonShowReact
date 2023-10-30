//React and redux
import React from 'react';
import { useState, useEffect } from 'react';


//Components
import {
  
    Button,
    Input,
    Container
} from 'reactstrap';
import Widget from 'components/Widget'
import Dropzone from 'react-dropzone'
import MediaDisplay from './MediaDisplay';
import { Icon } from 'components/Icons/Icons';

//data access
import { uploadFiles, fetchMediaFiles } from 'dataAccess/generalUtils';


//utils
import { log } from 'helper';
import {textract} from 'textract';

//css
import s from './Uploaders.module.css';

function TextDropzone(props) {

    const debug = true;

    const {
        dropzoneText = 'This Dropzone accepts .txt .doc & .docx files and converts it to plain text. Drag and drop your file here or click to select file to upload',
        fileText,
        setFileText
    } = props;


    const handleDrop = (selectedFiles) => {

        if (selectedFiles === undefined || selectedFiles === null) return null

        if (selectedFiles.length !== 1) {
           alert('Please only select one file')
            return null
        }

        const fileString = getStringFromFile(selectedFiles[0])

        setFileText(fileString)

    }


    const getStringFromFile = (file) => {

        textract.fromBufferWithPath(file.path, { preserveLineBreaks: true }, (error, text) => {
            if (error) {
                console.error(`Error extracting text`, error)
            } 

            return (error) ? "Failed to processes text from file." : text;
        })

    }

    return (

        <div className={`${s['text-dropzone']}`}>

            <Dropzone
                onDrop={(selectedFiles) => handleDrop(selectedFiles)}
                accept="text/*, .doc, .docx"
                className={`${s.dropzone}`}
                maxFiles={1}
            >

                ({fileText &&
                    <div className={s['text-dropzone-item']}>

                        {fileText}

                    </div>

                })
                ({!fileText &&
                <p>{dropzoneText}</p>    
                })


            </Dropzone>

        </div>


    );

}
export default TextDropzone;
