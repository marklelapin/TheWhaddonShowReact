
//React and Redux
import React from 'react';
import { useSelector } from 'react-redux';


//Constants
import { CHAT } from '../scripts/layout';

//styling
import s from '../ScriptItem.module.scss';

function CurtainBackground(props) {

    //props
    const { curtainOpen } = props

    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)

    if (viewStyle === CHAT) {
        return (
            <>
                <div className={`${s['left']} ${s['stage-curtain']} ${(curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
                <div className={`${s['right']} ${s['stage-curtain']} ${(curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
            </>

        )
    }

    return null;

}

export default CurtainBackground;