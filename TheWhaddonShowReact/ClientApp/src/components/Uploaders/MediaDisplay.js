import React from 'react';


function MediaDisplay(props) {

    const { file = null, youTubeUrl = null, width = null, height = null, alt, title } = props

    const youTubeVideoId = getVideoIdFromURL(youTubeUrl);



    const videoObjectURL = file?.type.startsWith('video/') ? URL.createObjectURL(file) : null;
    const audioObjectURL = file?.type.startsWith('audio/') ? URL.createObjectURL(file) : null;
    const imageObjectURL = file?.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    const youTubeEmbedUrl = (youTubeVideoId) ? `https://www.youtube.com/embed/${youTubeVideoId}` : null;

    const aspectRatio = () => {
        if (audioObjectURL) {
            return
        }
        if (imageObjectURL) {
            const mediaElement = new Image()
            return aspectRatioFromObject(mediaElement, imageObjectURL)
        }
        if (videoObjectURL) {
            const mediaElement = document.createElement('video')
            return aspectRatioFromObject(mediaElement, videoObjectURL)
        }
    }

    const aspectRatioFromObject = (mediaElement, objectURL) => {
        mediaElement.src = objectURL
        mediaElement.onLoad = function () {
            const fileWidth = mediaElement.width;
            const fileHeight = mediaElement.height;
            return fileWidth / fileHeight
        }

        objectURL.revokeObjectURL(objectURL)
    }

    const finalWidth = width || (height) ? Math.floor(height * aspectRatio()) : '100%'
    const finalHeight = height || (width) ? Math.floor(width / aspectRatio()) : null


    if (videoObjectURL) {

        return (
            <div classaName="media-display video" >
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

                <img src={imageObjectURL} className="img-fluid" alt={alt || ''} />
            </div>
        )
    }

    if (youTubeEmbedUrl) {

        return (
            <div className="media-display youtube">
                <iframe
                    title={title || youTubeUrl}
                    width={finalWidth || 560} height={finalHeight || 315}
                    src={youTubeEmbedUrl}
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    >
                </iframe>
            </div>

        )
    }
    return (
        <div className="media-display unsupported">
            <p>{`Unsupported media type - ${file.type}`}</p>
        </div>
    )
}

export default MediaDisplay;



function getVideoIdFromURL(url) {

    if (!url || !url.includes('youtube.com')) { return null; }

    const videoIdMatch = url.match(/[?&]v=([^?&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
        return videoIdMatch[1];
    }
    return null;
}