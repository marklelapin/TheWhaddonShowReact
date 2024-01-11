import React from 'react';
import { useEffect, useState } from 'react';
import {log, MEDIA_DISPLAY as logType} from '../../logging'

function MediaDisplay(props) {

    const { file = null, youTubeUrl = null, width = null, height = null, alt, title } = props

    const youTubeVideoId = getVideoIdFromURL(youTubeUrl);
    const videoObjectURL = file?.type.startsWith('video/') ? URL.createObjectURL(file) : null;
    const audioObjectURL = file?.type.startsWith('audio/') ? URL.createObjectURL(file) : null;
    const imageObjectURL = file?.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    const youTubeEmbedUrl = (youTubeVideoId) ? `https://www.youtube.com/embed/${youTubeVideoId}` : null;

    const [aspectRatio, setAspectRatio] = useState(null)

    useEffect(() => {
        log(logType,'UseEffect[]')
        const getAspectRatio = async () => {
            const result = await calculateAspectRatio() 
            setAspectRatio(result)
        }

        getAspectRatio()

    }, []) // eslint-disable-line react-hooks/exhaustive-deps





    const calculateAspectRatio = async () => {
        if (audioObjectURL) {
            return
        }
        if (imageObjectURL) {
            const mediaElement = new Image()
            return await aspectRatioFromObject(mediaElement, imageObjectURL)
        }
        if (videoObjectURL) {
            const mediaElement = document.createElement('video')
            return await aspectRatioFromObject(mediaElement, videoObjectURL)
        }

    }

    const loadImageDimensions = async (mediaElement, objectURL) => {

        return new Promise((resolve, reject) => {

            mediaElement.onload = function () {
                URL.revokeObjectURL(objectURL)
                resolve({ width: this.width, height: this.height })
            }

            mediaElement.onerror = function () {
                reject('Could not load image')
            }

            mediaElement.src = objectURL
        });
    }

    const aspectRatioFromObject = async (mediaElement, objectURL) => {

        const dimensions = await loadImageDimensions(mediaElement, objectURL)

        const fileWidth = dimensions.width;
        const fileHeight = dimensions.height;
        return fileWidth / fileHeight

    };


    const finalWidth = width || ((height && aspectRatio) ? Math.floor(height * aspectRatio) : '100%')
    const finalHeight = height || ((width && aspectRatio) ? Math.floor(width / aspectRatio) : null)


    if (videoObjectURL) {

        return (
            <div className="media-display video" >
                <video controls width={finalWidth} height={finalHeight}>
                    <source src={videoObjectURL} type={file.type} />
                    Your browser does not support the video tag.
                </video>
            </div>

        )
    }

    if (audioObjectURL) {

        return (
            <div className="media-display audio">
                <audio controls>
                    <source src={audioObjectURL} type={file.type} />
                    Your browser does not support the audio tag.
                </audio>
            </div>
        )
    }

    if (imageObjectURL) {

        return (
            <div className="media-display image">

                <img src={imageObjectURL} className="img-fluid" alt={alt || ''} width={finalWidth} height={finalHeight} />
            </div>
        )
    }

    if (youTubeEmbedUrl) {

        return (
            <div className="media-display youtube">
                <iframe
                    title={title || youTubeUrl}
                    src={youTubeEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                >
                </iframe>
            </div>

        )
    }
    return (
        <div className="media-display unsupported">
            <p>{`Unsupported media type - ${(file) ? file.type : 'unknown'}`}</p>
        </div>
    )
}

export default MediaDisplay;



function getVideoIdFromURL(url) {

    if (!url || !url.includes('youtube.com')) { return null; }
    if (url.includes('youtube.com/shorts/')) {
        const urlParts = url.split("/")
        const shortsIndex = urlParts.indexOf('shorts')

        const videoId = urlParts[shortsIndex + 1]

        return videoId
            ;
    }

    const videoIdMatch = url.match(/[?&]v=([^?&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
        return videoIdMatch[1];
    }
    return null;
}