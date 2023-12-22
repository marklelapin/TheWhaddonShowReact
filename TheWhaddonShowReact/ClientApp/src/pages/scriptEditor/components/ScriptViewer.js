//React and REdux
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateMaxScriptItemTextWidth } from '../../../actions/scriptEditor';

//Components
import Scene from './Scene'
import PersonSelector from './PersonSelector'
import ScriptViewerHeader from './ScriptViewerHeader';
//utitilites
import { log, SCRIPT_VIEWER as logType } from '../../../logging';
import { getShowBools, getMaxScriptItemTextWidth } from '../scripts/layout';
//Constants

import s from '../Script.module.scss'


function ScriptViewer(props) {

    //props
    const { show, scenesToLoad, setScenesToLoad,onSceneLoaded } = props;

    //Redux 
    const dispatch = useDispatch();

    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const defaultShowSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const isPersonSelectorOpen = (personSelectorConfig !== null)
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)

    const { showSceneSelector, showScriptViewer, showComments } = getShowBools(defaultShowSceneSelector, defaultShowComments)

    //internal state
    const [renderScenes, setRenderScenes] = useState(false) //delays the rendering of scenes until the script-body element has been mounted as this is required for the calculation of the maxScriptItemTextWidth

    useEffect(() => {
        setRenderScenes(true)
    },[])



    //useEffect(() => {

    //    handleScriptViewerResize()

    //}, [defaultShowSceneSelector, defaultShowComments])

    
    //useEffect(() => {
    //    log(logType,'scenesLoaded: ',{scenesToLoad})
       
    //},[])


    const handleScriptViewerResize = () => {
        log(logType, 'handleScriptViewerResize updateState')

        const maxScriptItemTextWidth = getMaxScriptItemTextWidth(showSceneSelector, showScriptViewer, showComments)

        if (maxScriptItemTextWidth !== null) {
            dispatch(updateMaxScriptItemTextWidth(maxScriptItemTextWidth))
            setScenesToLoad(0)
        }
    }

    //const handleSceneLoaded = (idx) => {
    //    log(logType, 'sceneLoaded:', idx + 1)
    //    onScenesLoaded()
    //}

    if (scenesToLoad === 0) { //this allows a reset of scenesToLoad to occur.
        log(logType,'updateState scenesToLoad',0)
        setScenesToLoad(1)
        return null
    }

    log(logType, 'render', { scenesToLoad })

    return (
        <>
            <div id="script-viewer" className="flex-full-height" style={{ zIndex: 1 }}>
                <ScriptViewerHeader />

                <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                    <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']} ${s[viewStyle]}`}>
                        <p className={`${s['comments-title']}`}>Comments</p>
                        {(renderScenes && showOrder && showOrder.length > 0) &&
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