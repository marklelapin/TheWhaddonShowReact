//React and redux
import React from 'react';


//Components
import Dropzone from 'react-dropzone'
import TextareaAutosize from 'react-textarea-autosize';


//utils
import { getFileTextContents } from '../../dataAccess/fileUtils.js';
import { log } from '../../logging.js';

//css
import s from './Uploaders.module.scss';

function TextDropzone(props) {

    const debug = true;

    const {
        dropzoneText = 'This Dropzone accepts single .txt .doc & .docx files and converts them to plain text. Drag and drop your file here or click to select file to upload',
        fileText,
        onChange
    } = props;

    log(debug, 'TextDropzone props', props)
    const handleDrop = async (selectedFiles) => {

        if (selectedFiles === undefined || selectedFiles === null) return null

        if (selectedFiles.length !== 1) {
            alert('Please only select one file')
            return null
        }
    

        const textContents = await getFileTextContents(selectedFiles)
        log(debug, 'TextDropzone textContents', textContents)
        onChange(textContents[0])
    }


    return (

        <div className={`${s['text-dropzone']}`}>

            <Dropzone
                onDrop={(selectedFiles) => handleDrop(selectedFiles)}
                accept="text/*, .doc, .docx"
                className={`${s.dropzone}`}
                multiple={false}
            >

                {fileText &&
                    <div className={s['text-dropzone-item']}>

                        <TextareaAutosize
                            className={s[`text-dropzone-input`]}
                            value={fileText}
                        />

                    </div>

                }
                {!fileText &&
                    <p>{dropzoneText}</p>
                }


            </Dropzone>

        </div>


    );

}
export default TextDropzone;
