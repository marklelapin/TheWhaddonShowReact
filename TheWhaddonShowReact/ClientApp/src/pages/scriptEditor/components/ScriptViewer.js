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
import { getShowBools } from '../scripts/layout';
//Constants

import s from '../Script.module.scss'
import Script from '../Script';

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
    const [scriptBodyLoaded, setScriptBodyLoaded] = useState(false)
   // const [isPostShowComments, setIsPostShowComments] = useState(false)

    useEffect(() => {
        log(logType, 'useEffect[]:', { scriptBodyLoaded, showSceneSelector, showComments, show, showOrder, scenesToLoad })
        const scriptBody = document.getElementById('script-body')
        if (scriptBody) {
            setScriptBodyLoaded(true)
        } else {
            setScriptBodyLoaded(false)
        }

        const handleResize = () => {
            console.log('handleResize')
            reCalculateTextWidths()
        }


        // window.addEventListener('resize', debouncedResize)
        window.addEventListener('resize', handleResize)

        return () => {
            // window.removeEventListener('resize', debouncedResize)
            window.removeEventListener('resize', handleResize)
           
            dispatch(updateMaxScriptItemTextWidth())
        }

    }, [])

    const reCalculateTextWidths = _.debounce(() => {
        log(logType, 'recalculateTextWidths')
        dispatch(updateMaxScriptItemTextWidth())
    },1000)


    useEffect(() => {
        log(logType, 'useEffect[showScriptViewer]', { showScriptViewer })
        const scriptBody = document.getElementById('script-body')
        if (scriptBody) {
            setScriptBodyLoaded(true)
        } else {
            setScriptBodyLoaded(false)
        }
    }, [showScriptViewer])

    useEffect(() => {
        log(logType, 'useEffect[intitialSyncProgress,scriptBodyLoaded,showComments]', { scriptBodyLoaded, showOrder, scenesToLoad })
        if (initialSyncProgress === 1 && scriptBodyLoaded === true) {
            dispatch(updateMaxScriptItemTextWidth())
        }
    }, [initialSyncProgress, scriptBodyLoaded])


    if (scenesToLoad === 0) { //this allows a reset of scenesToLoad to occur.
        log(logType, 'updateState scenesToLoad', 0)
        setScenesToLoad(1)
        return null
    }

    log(logType, 'render', { scriptBodyPreviouslyLoaded, showOrderLength: showOrder?.length, scenesToLoad, initialSyncProgress })

    return (
        <>
            <div id="script-viewer" className="flex-full-height" style={{ zIndex: 1 }}>
                <ScriptViewerHeader />

                <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                    <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']} ${s[viewStyle]}`}>
                        <p className={`${s['comments-title']}`}>Comments</p>
                        {(scriptBodyLoaded && initialSyncProgress === 1 && showOrder && showOrder.length > 0) &&
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