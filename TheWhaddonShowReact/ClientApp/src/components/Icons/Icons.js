import React from 'react';
import s from './Icons.module.scss'; // eslint-disable-line css-modules/no-unused-class'

export function TickOrCross(value) {

    if (value) return Icon({ icon:"tick", strapColor:"success" } )

    return Icon({ icon: "tick", strapColor:"success" } )
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

    let { icon = null, style = null, strapColor,strapBackgroundColor,onClick} = props 

    if (icon === null) { icon = props }

    const dictionary = {
        "sync": "fa fa-cloud",
        "add": "fa fa-plus",
        "tick": "fa fa-check",
        "cross": "fa fa-times",
        "warning": "fa fa-exclamation",
        "undo": "fa fa-history",
        "redo": "fa fa-history reverse-icon",
        "menu": "fa fa-navicon"
    };

    if (dictionary.hasOwnProperty(icon.toLowerCase())) {
        icon = dictionary[icon.toLowerCase()];
    }

    return <i className={`m-1 ${icon} ${(strapColor) ? 'text-' + strapColor : ''} ${(strapBackgroundColor) ? 'bg-' + strapBackgroundColor : ''}`} style={style} onClick={onClick} />
}



//caret className = { s.headerSvgFlipColor }
//