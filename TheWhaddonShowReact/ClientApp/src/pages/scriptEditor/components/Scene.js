//React and Redux
import React, { memo } from 'react';
import { useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { trigger, ADD_SCENE, updateSceneLoaded } from '../../../actions/scriptEditor'

//Components
import ScriptItem from '../../../pages/scriptEditor/components/ScriptItem.js';
import PartEditor from '../../../pages/scriptEditor/components/PartEditor.js';
import CurtainBackground from './CurtainBackground.js';

//Utilities
import { log, SCENE as logType } from '../../../logging'
import { partEditorRowId } from '../scripts/part';
//styling
import s from '../Script.module.scss'

//Constants
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';



const Scene = memo((props) => {

    //utility constants
    const dispatch = useDispatch();

    //props
    const { id, sceneNumber, zIndex, onLoaded } = props;
    log(logType, 'props:', props)

    //Redux state
    const sceneOrder = useSelector(state => state.scriptEditor.sceneOrders[id]) || []
    const previousCurtainOpen = useSelector(state => state.scriptEditor.previousCurtainOpen[id])
    const sceneScriptItem = useSelector(state => state.scriptEditor.currentScriptItems[id]) || {}
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)

    const scene = (sceneScriptItem.type === ACT) ? sceneScriptItem : { ...sceneOrder.find(item => [SHOW, ACT, SCENE].includes(item.type)) } || {}
    const synopsis = { ...sceneOrder.find(item => item.type === SYNOPSIS) } || {}
    const staging = { ...sceneOrder.find(item => item.type === INITIAL_STAGING) } || {}

    const bodyOrder = [...sceneOrder].filter(item => ([SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING].includes(item.type) === false)) || []//returns the body scriptItems

    const finalScriptItem = bodyOrder[bodyOrder.length - 1] || {}

    useLayoutEffect(() => {
        log(logType,'useEffect[] dispatching updateSceneLoaded',id)
       dispatch(updateSceneLoaded(id))
    }, [])


    log(logType, 'scene', scene)
    return (
        <>
            <div id={`scene-${scene.id}`} className={s[`scene-group`]} style={{ zIndex: zIndex }}>
                <div className={s[`scene-header`]}>

                    {(scene) &&
                        <ScriptItem
                            id={scene.id}
                            key={scene.id}
                            sceneId={scene.id}
                            sceneNumber={sceneNumber}
                            zIndex={scene.zIndex}
                            curtainOpen={previousCurtainOpen}
                            previousFocusId={scene.previousFocusId}
                            nextFocusId={scene.nextFocusId}
                        />

                    }
                    {scene.type === SCENE && synopsis &&
                        <ScriptItem
                            id={synopsis.id}
                            key={synopsis.id}
                            sceneId={scene.id}
                            zIndex={synopsis.zIndex}
                            curtainOpen={previousCurtainOpen}
                            previousFocusId={synopsis.previousFocusId}
                            nextFocusId={partEditorRowId(synopsis.nextFocusId, scene.id)}
                        />
                    }
                    {(scene.type === SCENE) &&
                        <PartEditor
                            sceneId={scene.id}
                            zIndex={synopsis.zIndex - 1}
                            curtainOpen={previousCurtainOpen}
                            previousFocusId={synopsis.id} //override the default focus ids
                            nextFocusId={staging.id}

                        />
                    }
                    {scene.type === SCENE && staging &&
                        <>
                            <ScriptItem
                                id={staging.id}
                                key={staging.id}
                                sceneId={scene.id}
                                zIndex={staging.zIndex}
                                curtainOpen={previousCurtainOpen}
                                previousFocusId={partEditorRowId(staging.previousFocusId, scene.id)}
                                nextFocusId={staging.nextFocusId}
                            />
                        </>

                    }

                </div>



                <div className={s['scene-body']}>
                    {bodyOrder.map((scriptItem, idx) => {
                        return (
                            <ScriptItem
                                id={scriptItem.id}
                                key={scriptItem.id}
                                sceneId={scene.id}
                                zIndex={scriptItem.zIndex}
                                previousCurtainOpen={bodyOrder[idx - 1]?.curtainOpen || previousCurtainOpen}
                                curtainOpen={scriptItem.curtainOpen}
                                alignRight={scriptItem.alignRight}
                                previousFocusId={scriptItem.previousFocusId}
                                nextFocusId={scriptItem.nextFocusId}
                            />
                        )
                    })
                    }
                </div>



            </div>
            {scene.type !== SHOW &&
                <div id={`scene-footer-${scene.id}`}
                    className={`${s['scene-footer']} ${finalScriptItem.curtainOpen ? s['curtain-open'] : s['curtain-closed']}`}
                >
                    <div key={`add-scene-${scene.id}`} className={`${s['add-new-scene']} ${s[viewStyle]} clickable`} onClick={() => dispatch(trigger(ADD_SCENE, { scriptItem: sceneScriptItem }))}>
                        (add new scene)
                    </div>
                    <CurtainBackground curtainOpen={finalScriptItem.curtainOpen} />
                </div>
            }
        </>
    )
}
)

export default Scene;