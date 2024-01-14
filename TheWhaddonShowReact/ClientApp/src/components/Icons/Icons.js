import React, { useState } from 'react';

import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCloud,
    faPlus,
    faCheck,
    faTimes,
    faExclamation,
    faRotateLeft,
    faRotateRight,
    faBars,
    faArrowLeft,
    faComments,
    faAlignCenter,
    faEdit,
    faComment,
    faPrint,
    faFileAudio,
    faFileVideo,
    faPlay,
    faPaperclip,
    faLink,
    faCircleO,
    faCircle,
    faSearch,
    faTags,
    faTrash,
    faArrowsV,
    faVolumeUp,
    faLightbulb,
    faMale,
    faChild,
    faHome,
    faFileLines,
    faPersonMilitaryToPerson,
    faPanorama
} from '@fortawesome/free-solid-svg-icons' 

import s from './Icons.module.scss'; 

export function TickOrCross(value) {

    if (value) return Icon({ icon: "tick", strapColor: "success" })

    return Icon({ icon: "tick", strapColor: "success" })
}


//export function NotificationAlert(props) {

//    let finalValue = props.value
//    if (props.value === 'tick') { finalValue = '✔' }
//    if (props.value === 'cross') { finalValue = '✘' }

//    return (
//        <span className={`m-1 circle bg-${props.color} text-white fw-semi-bold style={size: '10px'}`}>{finalValue}</span>
//    )
//}


export function Icon(props) {

    const { style = null, strapColor, strapBackgroundColor, onClick, id = null, toolTip, toolTipPlacement = 'top',className } = props

    let { icon } = props
    if (icon === null) { icon = props }

    const [toolTipOpen, setToolTipOpen] = useState(null);



    const dictionary = {
        "sync": faCloud,
        "add": faPlus,
        "tick": faCheck,
        "cross": faTimes,
        "remove": faTimes,
        "warning": faExclamation,
        "undo": faRotateLeft,
        "redo": faRotateRight,
        "menu": faBars,
        "arrow-left": faArrowLeft,
        "chat-mode": faComments,
        "classic-mode": faAlignCenter,
        "edit": faEdit,
        "comment-o": faComment,
        "comment": faComment,
        "print": faPrint,
        "audio-file": faFileAudio,
        "video-file": faFileVideo,
        "play": faPlay,
        "attach": faPaperclip,
        "attachment": faPaperclip,
        "link":faLink,
        "circle-o": faCircle,
        "circle": faCircle,
        "search": faSearch,
        "tags": faTags,
        "trash": faTrash,
        "move-up-down": faArrowsV,
        "arrows-v": faArrowsV,
        "sound": faVolumeUp,
        "lightbulb": faLightbulb,
        "man": faMale,
        "child": faChild,
        "home": faHome,
        "script": faFileLines,
"gallery": faPanorama,
"casting": faPersonMilitaryToPerson,
    };

    if (dictionary.hasOwnProperty(icon.toLowerCase())) {
        icon = dictionary[icon.toLowerCase()];
    }

    const toolTipDelay = { show: 300, hide: 250 };


    const toggleToolTip = (id) => {
        setToolTipOpen(toolTipOpen === id ? null : id)
    }

    if (id === null) {
        return <FontAwesomeIcon
        icon={icon}
            className={`m-1 ${s['icon']} ${(strapColor) ? 'text-' + strapColor : ''}  ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''}   ${(onClick) ? 'clickable' : ''} ${className}`}
            style={style}
            onClick={onClick} />
    }
    if (id !== null) {
        return <>
            <FontAwesomeIcon
                icon={icon}
                id={id}
                className={`m-1 ${s['icon']} ${(strapColor) ? 'text-' + strapColor : ''}  ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''} ${(onClick) ? 'clickable' : ''} ${className}`}
                style={style}
                onClick={onClick} />

            {toolTip && <Tooltip placement={toolTipPlacement} isOpen={toolTipOpen === id} toggle={() => toggleToolTip(id)} target={id} delay={toolTipDelay}>{toolTip}</Tooltip>}
        </>

    }

}



//caret className = { s.headerSvgFlipColor }
//