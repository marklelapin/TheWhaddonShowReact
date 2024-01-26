//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';


import { setShow, updateInitialSyncProgress, updateShowBools, updateScriptFilter } from '../../actions/scriptEditor';

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import ShowSelector from './components/ShowSelector';
import { Modal } from 'reactstrap';

//Utils
import { log, SCRIPT as logType } from '../../dataAccess/logging.js';
import { isScreenSmallerThan } from '../../core/screenHelper';
import { getShowBools } from './scripts/layout';
import s from './Script.module.scss';

function Script() {

    //constants
    const dispatch = useDispatch();

    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const showComments = useSelector((state) => state.scriptEditor.showComments)
    const modalSceneSelector = useSelector((state) => state.scriptEditor.modalSceneSelector)

    const show = useSelector((state) => state.scriptEditor.show)


    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id])

    const sceneLoaded = useSelector((state) => state.scriptEditor.sceneLoaded)

    const [scenesToLoad, setScenesToLoad] = useState(3)


    useEffect(() => {
        if (isScreenSmallerThan('lg')) {
            const firstScene = showOrder.find(scene => scene.sceneNumber === 1)
            if (firstScene) {
                dispatch(updateScriptFilter([firstScene.id]))
            } else {
                dispatch(updateScriptFilter([show.id]))
            }
        } else {
            dispatch(updateScriptFilter(null))
        }
    }, [])


    useEffect(() => {
        log(logType, 'handleSceneLoaded updateState', { scenesToLoad, showOrderLength: showOrder?.length })
        if (!showOrder || showOrder?.length === 0) {
            //do nothing
        }
        if (showOrder?.length > 0 && scenesToLoad !== null && scenesToLoad < showOrder?.length) {
            setScenesToLoad(scenesToLoad + 1)
        }
        if (showOrder?.length > 0 && scenesToLoad !== null && scenesToLoad >= showOrder?.length) {
            setScenesToLoad(null)
        }
        //if (showOrder.length > 0 && scenesToLoad === null) {
        //    dispatch(updateInitialProgress)
        //}
        //else do nothing
    }, [sceneLoaded, scenesToLoad, showOrder])


    const toggleSceneSelector = () => {
        const showBools = getShowBools(!showSceneSelector, showComments)
        dispatch(updateShowBools(showBools))
    }

    log(logType, 'Script: show', { scenesToLoad, show })
    //-----------------------------------------------------------------------
    return (
        <div id="script-page" className={`${s['script-page']}`}>
            {show &&
                <div id="script-page-content" className={s['script-page-content']}>
                    {(showSceneSelector && !modalSceneSelector) &&
                        <SceneSelector show={show} scenesToLoad={scenesToLoad} />
                    }
                    <ScriptViewer show={show}
                        scenesToLoad={scenesToLoad}
                        setScenesToLoad={(value) => setScenesToLoad(value)}
                    />
                </div>
            }
            {!show &&
                <ShowSelector onClick={(show) => dispatch(setShow(show))} />
            }
            <Modal isOpen={showSceneSelector && modalSceneSelector} toggle={() => toggleSceneSelector()}>
                <SceneSelector show={show} scenesToLoad={scenesToLoad} isModal={true} />
            </Modal>
        </div>
    )


}

export default Script
