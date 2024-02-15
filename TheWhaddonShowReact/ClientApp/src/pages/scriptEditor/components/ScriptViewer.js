//React and REdux
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateMaxScriptItemTextWidth, updateScriptItemTextWidth, updateShowBools, updateViewStyle } from '../../../actions/scriptEditor';

//Components
import Scene from './Scene'

import ScriptViewerHeader from './ScriptViewerHeader';
import Loader from '../../../components/Loader/Loader';

//utitilites
import { log, SCRIPT_VIEWER as logType } from '../../../dataAccess/logging';
import { getShowBools, CLASSIC, CHAT } from '../scripts/layout';
import _ from 'lodash';
//ConstantsdataAccess

import s from '../Script.module.scss'


function ScriptViewer(props) {


    //props
    const { show, scenesToLoad, setScenesToLoad } = props;

    //Redux 
    const dispatch = useDispatch();

    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const defaultShowSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const initialSyncProgress = useSelector(state => state.scriptEditor.initialSyncProgress)
    const initialSyncProgressTotal = initialSyncProgress.scriptItem * 70 + initialSyncProgress.person * 15 + initialSyncProgress.part * 15
    const maxWidthExists = useSelector(state => state.scriptEditor.maxWidthExists)

    const isMobileDevice = useSelector(state => state.device.isMobileDevice)


    //internal state
    const [scriptBodyLoaded, setScriptBodyLoaded] = useState(false) //for identifying width of script body to calculate textareawidth
    const [loading, setLoading] = useState('script') //for identifying when all scenes are loaded.

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

    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    }, [initialSyncProgress, scriptBodyLoaded]) // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        if (loading === 'script' && scenesToLoad >= showOrder?.length) {
            setLoading(false)
        }
    }, [scenesToLoad, showOrder]) //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if ([CLASSIC, CHAT].includes(loading)) {
            const newViewStyle = loading
            dispatch(updateViewStyle(newViewStyle))
        }
    }, [loading]) //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if ([CLASSIC,CHAT].includes(loading))
        setLoading(false)
    }, [viewStyle]) //eslint-disable-line react-hooks/exhaustive-deps



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
            <div id="script-viewer" className={s['script-viewer']} style={{ zIndex: 1 }}>
                <ScriptViewerHeader loading={loading} setLoading={setLoading} />

                <div id="script-viewer-main" className={`${s['script-viewer-main']}`}>
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
                    </div>


                </div>
                {(loading !== false) && !isMobileDevice &&
                    <div className={s.loader}>
                        {<Loader size={60} text={loading === 'script' ? "Loading..." : `Changing to ${loading} mode...`} />}
                    </div>
                }
            </div>

           



        </>


    )
}

export default ScriptViewer;