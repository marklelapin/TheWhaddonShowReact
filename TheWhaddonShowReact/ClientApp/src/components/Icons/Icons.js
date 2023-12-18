import React, { useState } from 'react';

import { Tooltip } from 'reactstrap';

import s from './Icons.module.scss'; // eslint-disable-line css-modules/no-unused-class'

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
        "sync": "fa fa-cloud",
        "add": "fa fa-plus",
        "tick": "fa fa-check",
        "cross": "fa fa-times",
        "remove": "fa fa-times",
        "warning": "fa fa-exclamation",
        "undo": "fa fa-history",
        "redo": "fa fa-history reverse-icon",
        "menu": "fa fa-navicon",
        "arrow-left": "fa fa-arrow-left",
        "chat-mode": "fa fa-comments-o",
        "classic-mode": "fa fa-align-center",
        "edit": "fa fa-edit",
        "comment-o": "fa fa-comment-o",
        "comment": "fa fa-comment",
        "print": "fa fa-print",
        "audio-file": "fa fa-file-audio-o",
        "video-file": "fa fa-file-video-o",
        "play": "fa fa-play",
        "attach": "fa fa-paperclip",
        "attachment": "fa fa-paperclip",
        "link": "fa fa-link",
        "circle-o": "fa fa-circle-o",
        "circle": "fa fa-circle",
        "search": "fa fa-search",
        "tags": "fa fa-tags",
        "trash": "fa fa-trash-o",
        "move-up-down": "fa fa-arrows-v",
        "arrows-v": "fa fa-arrows-v",
        "sound": "fa fa-volume-up",
        "lightbulb": "fa fa-lightbulb-o",
    };

    if (dictionary.hasOwnProperty(icon.toLowerCase())) {
        icon = dictionary[icon.toLowerCase()];
    }

    const toolTipDelay = { show: 300, hide: 250 };


    const toggleToolTip = (id) => {
        setToolTipOpen(toolTipOpen === id ? null : id)
    }



    if (id === null) {
        return <i className={`m-1 ${icon} ${(strapColor) ? 'text-' + strapColor : ''}  ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''}   ${(onClick) ? 'clickable' : ''} ${className}`}
            style={style}
            onClick={onClick} />
    }
    if (id !== null) {
        return <>
            <i id={id}
                className={`m-1 ${icon}  ${(strapColor) ? 'text-' + strapColor : ''}  ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''} ${(onClick) ? 'clickable' : ''} ${className}`}
                style={style}
                onClick={onClick} />

            {toolTip && <Tooltip placement={toolTipPlacement} isOpen={toolTipOpen === id} toggle={() => toggleToolTip(id)} target={id} delay={toolTipDelay}>{toolTip}</Tooltip>}
        </>

    }

}



//caret className = { s.headerSvgFlipColor }
//