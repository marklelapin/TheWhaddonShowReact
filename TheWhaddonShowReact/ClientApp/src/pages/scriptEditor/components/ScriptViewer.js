//React and REdux
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateMaxScriptItemTextWidth } from '../../../actions/scriptEditor';

//Components
import Scene from './Scene'
import PersonSelector from './PersonSelector'
import ScriptViewerHeader from './ScriptViewerHeader';
import { Progress } from 'reactstrap';
//utitilites
import { log, SCRIPT_VIEWER as logType } from '../../../logging';
import { getShowBools, getMaxScriptItemTextWidth } from '../scripts/layout';
//Constants

import s from '../Script.module.scss'

function ScriptViewer(props) {

    //props
    const { show, scenesToLoad, setScenesToLoad, onSceneLoaded } = props;
    const _ = require('lodash');
    //Redux 
    const dispatch = useDispatch();

    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const defaultShowSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const isPersonSelectorOpen = (personSelectorConfig !== null)
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const scriptBodyPreviouslyLoaded = useSelector(state => state.scriptEditor.scriptBodyPreviouslyLoaded)
    const { showSceneSelector, showScriptViewer, showComments } = getShowBools(defaultShowSceneSelector, defaultShowComments)
    const initialSyncProgress = useSelector(state => state.scriptEditor.initialSyncProgress)

    //internal state

    useEffect(() => {
        log(logType, 'useEffect[]:', { scriptBodyPreviouslyLoaded, showSceneSelector, showComments, show, showOrder, scenesToLoad })
        const maxWidth = getMaxScriptItemTextWidth(showSceneSelector, showComments)
        log(logType, 'useEffect[]: new maxScriptItemWidth', maxWidth)
        dispatch(updateMaxScriptItemTextWidth(maxWidth))

        const debouncedResize = () => {
            log(logType, 'debouncedResize')
            _.debounce(handleScriptBodyResize, 500)
        }
        const scriptBody = document.getElementById('script-body')

       // window.addEventListener('resize', debouncedResize)
        window.addEventListener('resize', handleScriptBodyResize)

        return () => {
          // window.removeEventListener('resize', debouncedResize)
            window.addEventListener('resize', handleScriptBodyResize)
            dispatch(updateMaxScriptItemTextWidth(null))
        }

    }, [])

    useEffect(() => {
        log(logType, 'useEffect[showComments]', { showComments })
        handleScriptBodyResize()
    }, [showComments])

    const handleScriptBodyResize = () => {
        log(logType, 'handleScriptViewerResize')
        const newMaxTextWidth = getMaxScriptItemTextWidth(showSceneSelector, showComments)
        dispatch(updateMaxScriptItemTextWidth(newMaxTextWidth))
    }


    //const handleSceneLoaded = (idx) => {
    //    log(logType, 'sceneLoaded:', idx + 1)
    //    onScenesLoaded()
    //}

    if (scenesToLoad === 0) { //this allows a reset of scenesToLoad to occur.
        log(logType, 'updateState scenesToLoad', 0)
        setScenesToLoad(1)
        return null
    }

    log(logType, 'render', { scriptBodyPreviouslyLoaded, showOrderLength: showOrder?.length, scenesToLoad })

    return (
        <>
            <div id="script-viewer" className="flex-full-height" style={{ zIndex: 1 }}>
                <ScriptViewerHeader />

                <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                    <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']} ${s[viewStyle]}`}>
                        <p className={`${s['comments-title']}`}>Comments</p>
                        {(scriptBodyPreviouslyLoaded && showOrder && showOrder.length > 0) &&
                            showOrder.map((scene, idx) => {

                                return ((idx < scenesToLoad) || scenesToLoad === null) &&
                                    <Scene key={scene.id}
                                        id={scene.id}
                                        sceneNumber={scene.sceneNumber}
                                        zIndex={scene.zIndex}
                                        onLoaded={onSceneLoaded}
                                    />
                            }

                            )}
                        {(!showOrder || showOrder.length === 0) &&

                            <div className={`${s['loading-message']}`}>
                                <p className={`${s['loading-message-text']}`}>Loading script...</p>
                                <Progress className="mb-sm" value={initialSyncProgress * 100} />
                            </div>

                        }
                    </div>

                </div>
            </div>

            {(isPersonSelectorOpen) &&
                <PersonSelector viewAs />
            }

        </>


    )
}

export default ScriptViewer;