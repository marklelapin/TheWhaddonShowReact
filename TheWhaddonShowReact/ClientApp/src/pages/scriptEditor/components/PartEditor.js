//React and Redux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';


//Components

import PartEditorRow from './PartEditorRow';
import CurtainBackground from './CurtainBackground';
//Utilities

import { log } from '../../../helper'



//styling
import s from '../ScriptItem.module.scss'

function PartEditor(props) {

    //utility consts
    const debug = true;

    const zIndex = 1000000 - (2 * 1000)  //assumes starting zIndex of 1000000 for scene scriptItem followed by -1000 for synopsis and -1000 for part editor

    //props
    const {
        sceneId = null,
        curtainOpen,
        previousFocusId,
        nextFocusId,
    } = props;

    log(debug, 'Component:PartEditor props', props)

    if (sceneId === null) {
        throw new Error('Component:PartEditor: sceneId prop is null')
    }

    //Redux
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId])
    const scenePartIds = scene.partIds


    log(debug, 'Component:PartEditor scenePartIds', scenePartIds)

    return (

        <div className={s[`part-editor`]} style={{ zIndex: zIndex }}>
            <p>Parts:</p>
            {scenePartIds.map((partId, idx) => {

                return (

                    <PartEditorRow
                        key={partId}
                        partId={partId}
                        isFirst={scenePartIds.length === 1}
                        sceneId={sceneId}
                        previousFocusId={previousFocusId}
                        nextFocusId={nextFocusId}
                    />

                )
            })}
            <CurtainBackground curtainOpen={curtainOpen} />
        </div >

    )


}

export default PartEditor;