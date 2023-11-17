
//React and Redux
import React from 'react';

//styling
import s from '../ScriptItem.module.scss';

function CurtainBackground(props) {

    //props
    const {curtainOpen } = props

    return (
        <>
        <div className={`${s['left']} ${s['stage-curtain']} ${(curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
            <div className={`${s['right']} ${s['stage-curtain']} ${(curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
        </>

            
    )
}

export default CurtainBackground;