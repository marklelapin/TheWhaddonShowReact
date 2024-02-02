//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

//Components
import {
    Button,
    Input
} from 'reactstrap';
import { useDropzone } from 'react-dropzone'
import MediaDisplay from './MediaDisplay';
import { Icon } from '../../components/Icons/Icons';

//data access
import { uploadFiles, fetchFiles } from '../../dataAccess/fileUtils';


//utils
import { log, MEDIA_DROPZONE as logType } from '../../dataAccess/logging';

//constants
import { MEDIA } from '../../dataAccess/storageContainerNames';

//css
import s from './Uploaders.module.scss';

function MediaDropzone(props) {

    const {
        singleFile = false
        , inputTags = true
        , existingMediaURLs = []
        , addMedia
        , removeMedia
        , showControls
        , autoLoad = false
        , width = null
        , height = 100
        , readOnly = false
    } = props;

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        onDrop: (selectedURLs) => handleDrop(selectedURLs),
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'audio/mpeg': ['.mp3'],
        },
    });;


    const [newMediaFiles, setNewMediaFiles] = useState([]);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [youTubeUrl, setYouTubeUrl] = useState('');

    useEffect(() => {
        log(logType, 'useEffect[]')
        refreshMediaFiles()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        log(logType, 'useEffect[existingMediaURLS,newMediaFiles]', { existingMediaURLs, newMediaFiles })
        refreshMediaFiles()
    }, [existingMediaURLs, newMediaFiles]) // eslint-disable-line react-hooks/exhaustive-deps

    const refreshMediaFiles = async () => {

        const youTubeURLs = existingMediaURLs.filter(url => url.includes('youtube.com')) || []
        const fileURLs = existingMediaURLs.filter(url => !youTubeURLs.includes(url)) || []

        const existingFiles = await fetchFiles(MEDIA, fileURLs) || []

        const newFiles = [...youTubeURLs, ...existingFiles, ...newMediaFiles]
        if (newFiles && newFiles.length > 0) { setMediaFiles(newFiles) }
        log(logType, 'refreshMediaFiles setMediaFiles:', newFiles)
    }

    const handleDrop = (selectedFiles) => {

        if (selectedFiles === undefined || selectedFiles === null) return null

        if (autoLoad === true) {

            uploadURLs(selectedFiles)

        } else {
            setNewMediaFiles([...newMediaFiles, ...selectedFiles])
        }

    }


    const uploadURLs = async (overrideURLs = null) => {

        let urls = overrideURLs || newMediaFiles

        if (!Array.isArray(urls)) { urls = [urls] }

        //split urls into youtube and file urls
        const youTubeURLs = urls.filter(url => {
            try {
                if (url.includes('youtube.com')) {
                    return true;
                } else {
                    return false;
                }
            }
            catch {
                return false;
            }
        })

        const fileURLs = urls.filter(url => !youTubeURLs.includes(url))

        //process file urls
        if (fileURLs.length > 0) {
            const result = await uploadFiles(fileURLs, MEDIA)
            if (result.blobNames) {
                addMedia(result.blobNames)
            }
        }


        //process youtube urls
        if (youTubeURLs.length > 0) {
            addMedia(youTubeURLs)
        }

        setNewMediaFiles([])
    }

    const handleClick = (e, type, value = null) => {

        switch (type) {
            case 'upload':
                e.preventDefault()
                uploadURLs()
                break;
            case 'clear':
                e.preventDefault()
                existingMediaURLs.forEach(media => removeMedia(media))
                setNewMediaFiles([])
                break;
            case 'remove':
                e.preventDefault()
                if (existingMediaURLs.includes(value.name || value)) {
                    removeMedia(value.name || value)
                }
                const updatedURLs = newMediaFiles.filter(media => media !== value && media !== value.name)
                setNewMediaFiles(updatedURLs)
                break;
            case 'submitYouTube':
                e.stopPropagation()
                e.preventDefault()
                if (autoLoad === true) {
                    uploadURLs(value)
                } else {
                    setNewMediaFiles([...newMediaFiles, value])
                }
                setYouTubeUrl('')
                break;
            default: return;
        }
    }

    const handleYouTubeInputChange = (e) => {
        e.preventDefault()
        setYouTubeUrl(e.target.value)
    }

    const isYouTube = (url) => {
        try {
            if (url.includes('youtube.com')) {
                return true;
            } else {
                return false;
            }
        }
        catch {
            return false;
        }
    }



    const dropZoneText = (mediaFiles.length > 0)
        ? 'drag or click to add more media...'
        : 'This dropzone accepts images, audio files, video files or youTube urls. Try dropping some here, or click to select files to upload.'

    log(logType, 'mediaFiles', mediaFiles)

    return (


        <div className={`${s['media-dropzone']} ${showControls ? s['show-controls'] : s['hide-controls']} ${(mediaFiles.length > 0) ? 'populated' : ''}`}>

            <div {...getRootProps({ className: s.dropzone })}>
                <input {...getInputProps()} />
                <>
                    <div className={s['media-dropzone-items']}>
                        {mediaFiles.map((media, idx) => (
                            <div key={idx} className={s['media-dropzone-item']}>
                                <div className={s['media-dropzone-item-display']}>
                                    <MediaDisplay
                                        file={isYouTube(media) ? null : media}
                                        youTubeUrl={isYouTube(media) ? media : null}
                                        key={`drop-id-${idx}`}

                                        width={width}
                                        height={height}
                                    />
                                    {!readOnly &&
                                        <div className={s['remove-media-icon']}>
                                            <Icon key={idx} icon="remove" onClick={(e) => handleClick(e, 'remove', media)} toolTip="Delete" />
                                        </div>
                                    }
                                </div>

                            </div>

                        ))}
                    </div>
                    {!readOnly &&
                        <div className={s['controls']}>
                            <p>{dropZoneText}</p>
                            <div className={s['youtube-input']}>
                                <Input
                                    type="text"
                                    label="youTubeUrl"
                                    name="youTubeUrl"
                                    id="youTubeUrl"
                                    placeholder="or enter YouTube URL"
                                    value={youTubeUrl}
                                    onChange={(e) => handleYouTubeInputChange(e)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Button onClick={(e) => handleClick(e, 'submitYouTube', youTubeUrl)}
                                    color="primary"
                                    disabled={youTubeUrl.length === 0}
                                >Submit</Button>
                            </div>

                        </div>
                    }
                </>


                <div className={s['controls']}>
                    {(autoLoad === false) &&
                        <Button
                            type="button"
                            color="primary"
                            onClick={(e) => handleClick(e, 'upload')}
                            disabled={newMediaFiles.length === 0}>Upload New Media</Button>
                    }
                    <Button
                        type="button"
                        color="secondary"
                        onClick={(e) => handleClick(e, 'clear')}
                        disabled={newMediaFiles.length === 0 && existingMediaURLs.length === 0}>Clear</Button>

                </div>



            </div >


        </div>
    )


}
export default MediaDropzone;
