//React and Redux
import React, { memo } from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { trigger, ADD_SCENE, updateSceneLoaded, updateScriptFilter } from '../../../actions/scriptEditor'

//Components
import ScriptItem from '../../../pages/scriptEditor/components/ScriptItem.js';
import PartEditor from '../../../pages/scriptEditor/components/PartEditor.js';
import Hammer from 'rc-hammerjs';
import { Icon } from '../../../components/Icons/Icons';
import { Button } from 'reactstrap';
//Utilities
import { log, SCENE as logType } from '../../../dataAccess/logging'
import { partEditorRowId } from '../scripts/part';
import classnames from 'classnames';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';
import { moveFocusToId } from '../scripts/utility';
//styling
import s from '../Script.module.scss'

//Constants
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';



const Scene = memo((props) => {
    Scene.displayName = 'Scene';

    //utility constants
    const dispatch = useDispatch();

    //props
    const { id, sceneNumber, zIndex } = props;
    log(logType, 'props:', props)

    //Redux state
    const sceneOrder = useSelector(state => state.scriptEditor.sceneOrders[id]) || []
    const previousCurtainOpen = useSelector(state => state.scriptEditor.previousCurtainOpen[id])
    const sceneScriptItem = useSelector(state => state.scriptEditor.currentScriptItems[id]) || {}
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const currentUser = useSelector(state => state.user.currentUser)
    const readOnly = isScriptReadOnly(currentUser)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)

    const scene = (sceneScriptItem.type === ACT) ? { ...sceneScriptItem, nextSceneId: sceneScriptItem.nextId } : { ...sceneOrder.find(item => [SHOW, ACT, SCENE].includes(item.type)) } || {}
    const synopsis = { ...sceneOrder.find(item => item.type === SYNOPSIS) } || {}
    const staging = { ...sceneOrder.find(item => item.type === INITIAL_STAGING) } || {}

    const bodyOrder = [...sceneOrder].filter(item => ([SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING].includes(item.type) === false)) || []//returns the body scriptItems



    const scriptFilter = useSelector(state => state.scriptEditor.scriptFilter)

    let sceneFilter
    if (scriptFilter === null || scriptFilter === undefined) {
        sceneFilter = isMobileDevice ? (sceneNumber === 1) : true
    } else {
        sceneFilter = scriptFilter.includes(scene.id)
    }



    useEffect(() => {
        log(logType, 'useEffect[] dispatching updateSceneLoaded', id)
        dispatch(updateSceneLoaded(id))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    log(logType, 'scene', scene)




    const handleSwipe = (e) => {
        if ('ontouchstart' in window) {
            if (e.direction === 4 && scene.nextId) {
                moveToNextScene; return;
            }

            if (e.direction === 2 && scene.previousId) {
                moveToPreviousScene; return;
            }
        }
    }


    const moveToNextScene = () => {
        if (scene.nextId) {
            dispatch(updateScriptFilter([scene.nextSceneId]));
            moveFocusToId(scene.nextSceneId);
        }
    }

    const moveToPreviousScene = () => {
        if (sceneNumber !== 1) {
            dispatch(updateScriptFilter([scene.previousId]));
            moveFocusToId(scene.id);
        }
    }


    log(logType,'scene',scene)
    return (
        <Hammer onSwipe={handleSwipe}>
            <>
                <div id={`scene-${scene.id}`} className={classnames(s[`scene-group`], s[scene.type.toLowerCase()], (sceneFilter) ? null : s['hide'])} style={{ zIndex: zIndex }}>
                    {(scriptFilter?.length === 1) &&
                        <>
                            {(sceneNumber !== 1) && <div className={classnames(s.previousSceneIcon,'clickable',previousCurtainOpen ? s.curtainOpen : s.curtainClosed,s[viewStyle])} > <Icon icon='arrow-left' onClick={moveToPreviousScene} /></div>
                            }
                        {(scene.nextSceneId !== null) && <div className={classnames(s.nextSceneIcon, 'clickable', previousCurtainOpen ? s.curtainOpen : s.curtainClosed,s[viewStyle])}  > <Icon icon='arrow-right' onClick={moveToNextScene} /></div>
                            }
                        </>
                    }


                    <div className={s[`scene-header`]}>
                        {(scene) &&
                            <ScriptItem
                                id={scene.id}
                                key={scene.id}
                                sceneId={scene.id}
                                zIndex={scene.zIndex}
                                curtainOpen={previousCurtainOpen}
                                previousFocusId={scene.previousFocusId}
                                nextFocusId={scene.nextFocusId}
                                sceneNumber={sceneNumber}
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
                                    isViewAsPartPerson={scriptItem.isViewAsPartPerson}
                                    previousFocusId={scriptItem.previousFocusId}
                                    nextFocusId={(idx === bodyOrder.length - 1) ? scene.nextSceneId : scriptItem.nextFocusId}
                                />
                            )
                        })
                        }
                    </div>



                </div>
                {scene.type !== SHOW &&
                    <div id={`scene-footer-${scene.id}`}
                        className={classnames(
                            s['scene-footer'],
                            (scriptFilter) ? s.scriptFilterOn : null,
                            sceneFilter ? null : s.hide
                        )}
                    >
                        {(!scriptFilter && !readOnly) &&
                            <div key={`add-scene-${scene.id}`} className={classnames(s['add-new-scene'], s[viewStyle], (readOnly) ? null : 'clickable')} onClick={() => dispatch(trigger(ADD_SCENE, { scriptItem: sceneScriptItem }))}>
                                (add new scene)
                            </div>
                        }
                        {(scriptFilter?.length === 1) &&
                            < div className={s['next-previous-scene-buttons']}>
                                {sceneNumber !== 1 && < Button onClick={moveToPreviousScene}>Previous Scene</Button>}
                                {sceneNumber === 1 && <p>Start</p>}
                                {(scene.nextSceneId) && <Button onClick={moveToNextScene}>Next Scene</Button>}
                                {(!scene.nextSceneId) && <p>End</p>}
                            </div>
                        }

                    </div >
                }

            </>
        </Hammer >
    )
}
)

export default Scene;