//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';


import { setShow, updateShowBools, updateScriptFilter, updateViewMode, SINGLE } from '../../actions/scriptEditor';

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import ShowSelector from './components/ShowSelector';
import { Modal } from 'reactstrap';
import CowboyAlert from '../../components/CowboyAlert/CowboyAlert';
import { Icon } from '../../components/Icons/Icons';
//Utils
import { log, SCRIPT as logType } from '../../dataAccess/logging.js';
//import { isScreenSmallerThan } from '../../core/screenHelper';
import { getShowBools } from './scripts/layout';
import s from './Script.module.scss';


function Script() {

    //constants
    const dispatch = useDispatch();

    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const showComments = useSelector((state) => state.scriptEditor.showComments)
    const modalSceneSelector = useSelector((state) => state.scriptEditor.modalSceneSelector)
    const isMobileDevice = useSelector((state) => state.device.isMobileDevice)

    const show = useSelector((state) => state.scriptEditor.show)


    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id])

    const sceneLoaded = useSelector((state) => state.scriptEditor.sceneLoaded)

    const [scenesToLoad, setScenesToLoad] = useState(3)


    useEffect(() => {
        //set initial state to only show the first scene.
        dispatch(updateViewMode(SINGLE))

        const firstScene = showOrder?.find(scene => scene.sceneNumber === 1)
        if (firstScene) {
            dispatch(updateScriptFilter([firstScene.id]))
        } else {
            dispatch(updateScriptFilter([show.id]))
        }

    }, []) //eslint-disable-line react-hooks/exhaustive-deps


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
            <div className={s.cowboyAlertContainer}>

                <CowboyAlert demoOnly={true}>
                    {isMobileDevice &&
                        <div className={s.alert}>
                            <div>On mobiles this is primarily used for rehearsals so is readonly. On desktops you can edit it like a word document.</div>
                            <div className={s.searchText}>
                                <div>Use</div><Icon icon='search' /><div>to search for scenes.</div>
                            </div>
                            <div>Checkout <strong>Classic Mode</strong> if you prefer things a little less funky!</div>
                            <div>Use <strong>View As</strong> to change the person highlighted in scene.</div>
                        </div>
                    }

                    {!isMobileDevice &&
                        <div className={s.alert}>
                            <div>This script editor is used by a team of 4 to collaboratively write the script.</div>
                            <div>Give it a go!...</div>
                            <ul>
                                <li>Open or close the curtain</li>
                                <li>Change <strong>View As</strong> to highlight a different part</li>
                                <li>Edit or add some dialogue. You can just use keys like a word document</li>
                                <li>Allocate people to parts and parts to dialogue</li>
                                <li>Check out <strong>Classic Mode</strong></li>
                            </ul>


                            <div>{`Don't worry you're changes are only being made and won't sync back to the actual script!`}</div>
                        </div>
                    }

                </CowboyAlert>
            </div>

        </div>
    )


}

export default Script
