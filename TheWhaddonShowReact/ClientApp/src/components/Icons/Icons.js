import React, { useState } from 'react';

import { Tooltip } from 'reactstrap';
import ConfirmClick from '../../components/ConfirmClick/ConfirmClick';

import { isMouseAvailable } from '../../core/screenHelper';
import { log, ICONS as logType } from '../../dataAccess/logging.js';

import classnames from 'classnames';

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

    const { style = null, strapColor, strapBackgroundColor, onClick, id = null, toolTip, toolTipPlacement = 'top', className, noMargin } = props

    let { icon } = props
    if (icon === null) { icon = props }

    const [toolTipOpen, setToolTipOpen] = useState(null);

    const dictionary = {
        "sync": 'fa-solid fa-cloud',
        "add": 'fa-solid fa-plus',
        "tick": 'fa-solid fa-check',
        "cross": 'fa-solid fa-times',
        "remove": 'fa-solid fa-times',
        "warning": 'fa-solid fa-exclamation',
        "undo": 'fa-solid fa-rotate-left',
        "redo": 'fa-solid fa-rotate-right',
        "menu": 'fa-solid fa-bars',
        "arrow-left": 'fa-solid fa-arrow-left',
        "arrow-right": 'fa-solid fa-arrow-right',
        "chat-mode": 'fa-solid fa-comments',
        "classic-mode": 'fa-solid fa-align-center',
        "edit": 'fa-solid fa-edit',
        "comment-o": 'fa-regular fa-comment',
        "comment": 'fa-solid  fa-comment',
        "print": 'fa-solid fa-print',
        "audio-file": 'fa-solid fa-file-audio',
        "video-file": 'fa-solid fa-file-video',
        "play": 'fa-solid fa-play',
        "attach": 'fa-solid fa-paperclip',
        "attachment": 'fa-solid fa-paperclip',
        "link": 'fa-solid fa-link',
        "circle-o": 'fa-regular fa-circle',
        "circle": 'fa-solid fa-circle',
        "search": 'fa-solid fa-search',
        "tags": 'fa-solid fa-tags',
        "trash": 'fa-solid fa-trash',
        "move-up-down": 'fa-solid fa-arrows-v',
        "arrows-v": 'fa-solid fa-arrows-v',
        "sound": 'fa-solid fa-volume-up',
        "lightbulb": 'fa-solid fa-lightbulb',
        "man": 'fa-solid fa-male',
        "child": 'fa-solid fa-child',
        "home": 'fa-solid fa-house',
        "script": 'fa-solid fa-file-lines',
        "refresh": 'fa-solid fa-rotate',
        "user": 'fa-solid fa-user',
        "users": 'fa-solid fa-users',
        "caret": 'fa-solid fa-caret-down',
        "api": 'fa-solid fa-arrow-down-up-across-line',
        "summary": 'fa-solid fa-rectangle-list',
        "power-off": 'fa-solid fa-power-off',
        "gear": 'fa-solid fa-gear',
        "gallery": 'fa-solid fa-panorama',
        "casting": 'fa-solid fa-person-military-to-person',
        "glasses": 'fa-solid fa-glasses',
        "paper-plane": 'fa-solid fa-paper-plane',
    };


    if (Object.prototype.hasOwnProperty.call(dictionary, icon.toLowerCase())) {
        icon = dictionary[icon.toLowerCase()];
    }

    const toolTipDelay = { show: 300, hide: 250 };


    const toggleToolTip = (id) => {
        setToolTipOpen(toolTipOpen === id ? null : id)
    }
    log(logType, 'props', { props,onClick })

    if (id === null) {
        return (
            <div className={s.iconContainer,(noMargin) ? s.noMargin : null}>
                <ConfirmClick type='circle' onClick={onClick}>

                    <i
                        className={classnames(icon,
                            s.icon,
                            (strapColor) ? 'text-' + strapColor : '',
                            (strapBackgroundColor) ? 'bg-' + strapBackgroundColor : '',
                            (onClick) ? 'clickable' : '',
                            (noMargin) ? 'm-0' : null,
                            className
                        )}
                        style={style}
                    />
                </ConfirmClick>
            </div>
        )

    }
    if (id !== null) {

        return (
            <div className={s.iconContainer}>
                <ConfirmClick type='circle' onClick={onClick}>
                    <i
                        id={id}
                        className={`${icon} ${s['icon']} ${(strapColor) ? 'text-' + strapColor : ''}  ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''} ${(onClick) ? 'clickable' : ''} ${className}`}
                        style={style}
                    />

                    {toolTip && isMouseAvailable() && <Tooltip placement={toolTipPlacement} isOpen={toolTipOpen === id} toggle={() => toggleToolTip(id)} target={id} delay={toolTipDelay}>{toolTip}</Tooltip>}

                </ConfirmClick>
            </div>
        )

    }

}



//caret className = { s.headerSvgFlipColor }
//