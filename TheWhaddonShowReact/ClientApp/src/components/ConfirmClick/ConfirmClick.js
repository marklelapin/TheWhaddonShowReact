import React, { useState } from 'react';
import classnames from 'classnames';
import { log, CONFIRM_CLICK as logType } from '../../dataAccess/logging';
import s from './ConfirmClick.module.scss';

const ConfirmClick = (props) => {

    const { onClick = null, type = 'circle', children, style = {} } = props;

    log(logType, 'props', { onClick, type, style })

    const [clicked, setClicked] = useState(false)

    const handleClick = (e) => {
        setClicked(true)
        setTimeout(() => {
            setClicked(false)
        }, 500)
        onClick(e)
    }

    if (onClick === null) return children;


    return (

        <>
            {children}
            <div className={classnames(s[type], 'clickable', (clicked) ? s.clicked : null)} onClick={(e)=>handleClick(e)} style={style}>

            </div>
        </>

    )

}

export default ConfirmClick;