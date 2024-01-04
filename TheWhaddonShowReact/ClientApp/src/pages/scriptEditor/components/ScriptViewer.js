//React and REdux
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateMaxScriptItemTextWidth, updateScriptItemTextWidth, updateShowBools } from '../../../actions/scriptEditor';

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
    const { show, scenesToLoad, setScenesToLoad } = props;
    const _ = require('lodash');
    //Redux 
    const dispatch = useDispatch();

    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const defaultShowSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const isPersonSelectorOpen = (personSelectorConfig !== null)
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const initialSyncProgress = useSelector(state => state.scriptEditor.initialSyncProgress)
    const initialSyncProgressTotal = initialSyncProgress.scriptItem * 70 + initialSyncProgress.person * 15 + initialSyncProgress.part * 15
    const maxWidthExists = useSelector(state => state.scriptEditor.maxWidthExists)

    //internal state
    const [scriptBodyLoaded, setScriptBodyLoaded] = useState(false)

    // const [isPostShowComments, setIsPostShowComments] = useState(false)



    useEffect(() => {
        log(logType, 'useEffect[]:', { scriptBodyLoaded, show, showOrder, scenesToLoad })
        const scriptBody = document.getElementById('script-body')
        if (scriptBody) {
            setScriptBodyLoaded(true)
        } else {
            setScriptBodyLoaded(false)
        }

        setShowBools()

        const handleResize = () => {
            setShowBools()
            log(logType, 'handleResize')
            reCalculateTextWidthsInView()
        }


        // window.addEventListener('resize', debouncedResize)
        window.addEventListener('resize', handleResize)

        return () => {
            // window.removeEventListener('resize', debouncedResize)
            window.removeEventListener('resize', handleResize)
            dispatch(updateMaxScriptItemTextWidth())
        }

    }, [])

    const reCalculateTextWidthsInView = _.debounce(() => {
        if (scenesToLoad === null) {
            log(logType, 'recalculateTextWidths')
            document.querySelectorAll('.inView').forEach((el) => {

                const scriptItemId = el.id.substring(23)
                log(logType, 'id:', scriptItemId)
                dispatch(updateScriptItemTextWidth(scriptItemId))
            })
        }
    }, 500)


    useEffect(() => {
        log(logType, 'useEffect[intitialSyncProgress,scriptBodyLoaded,showComments]', { scriptBodyLoaded, showOrder, scenesToLoad })

        if (initialSyncProgressTotal === 100 && scriptBodyLoaded === true) {
            dispatch(updateMaxScriptItemTextWidth())
        }
    }, [initialSyncProgress, scriptBodyLoaded])


    if (scenesToLoad === 0) { //this allows a reset of scenesToLoad to occur.
        log(logType, 'updateState scenesToLoad', 0)
        setScenesToLoad(1)
        return null
    }

    const setShowBools = () => {
        const showBools = getShowBools(defaultShowSceneSelector, defaultShowComments)
        dispatch(updateShowBools(showBools))
    }


    log(logType, 'render', { showOrderLength: showOrder?.length, scenesToLoad, initialSyncProgress, initialSyncProgressTotal, maxWidthExists })



    return (
        <>
            <div id="script-viewer" className="flex-full-height" style={{ zIndex: 1 }}>
                <ScriptViewerHeader />

                <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                    <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']} ${s[viewStyle]}`}>
                        <p className={`${s['comments-title']}`}>Comments</p>
                        {(maxWidthExists && showOrder && showOrder.length > 0) &&
                            showOrder.map((scene, idx) => {

                                return ((idx < scenesToLoad) || scenesToLoad === null) &&
                                    <Scene key={scene.id}
                                        id={scene.id}
                                        sceneNumber={scene.sceneNumber}
                                        zIndex={scene.zIndex}
                                    />
                            }

                            )}
                        {(!showOrder || showOrder.length === 0) &&

                            <div className={`${s['loading-message']}`}>
                                <p className={`${s['loading-message-text']}`}>Loading script...</p>
                                <Progress className="mb-sm" value={initialSyncProgressTotal} />
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