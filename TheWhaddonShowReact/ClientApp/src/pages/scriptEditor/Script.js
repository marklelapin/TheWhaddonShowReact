//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';


import { setShow, updateShowComments } from '../../actions/scriptEditor';

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import ShowSelector from './components/ShowSelector';

//Utils
import { log, SCRIPT as logType } from '../../logging.js';
import isScreen from '../../core/screenHelper';
import { getShowBools } from './scripts/layout';

function Script() {

    //constants
    const debug = true;
    const dispatch = useDispatch();

    //Redux State
    const defaultShowSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const show = useSelector((state) => state.scriptEditor.show)
    const sceneOrders = useSelector((state) => state.scriptEditor.sceneOrders)
   
    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id]) || []
    const sceneLoaded = useSelector((state) => state.scriptEditor.sceneLoaded)

    const { showSceneSelector, showScriptViewer } = getShowBools(defaultShowSceneSelector, defaultShowComments)

    const [scenesToLoad, setScenesToLoad] = useState(3)


    useEffect(() => {
        log(logType, 'handleSceneLoaded updateState', { scenesToLoad, showOrderLength: showOrder.length })
        if (scenesToLoad !== showOrder.length && scenesToLoad !==null) setScenesToLoad(scenesToLoad + 3)
        if (scenesToLoad >= showOrder.length && scenesToLoad !== null) {
            setScenesToLoad(null)
        }
    }, [sceneLoaded,scenesToLoad,showOrder])




    log(logType, 'Script: show', { scenesToLoad,show })
    //-----------------------------------------------------------------------
    return (

        <div id="script-page" className="flex-full-height">

            {/*{(isLargerScreen) && !show &&*/}
            {/*    <div className="page-top">*/}
            {/*        <h1 className="page-title">Script - <span className="fw-semi-bold">{(show) ? show.text : 'Editor'}</span></h1>*/}
            {/*    </div>*/}
            {/*}*/}

            {show &&
                <div id="script-page-content" className="page-content flex-full-width">
                    {(showSceneSelector) &&
                        <SceneSelector show={show} scenesToLoad={scenesToLoad} />
                    }

                    {(showScriptViewer) &&
                        <ScriptViewer show={show}
                            scenesToLoad={scenesToLoad}
                            setScenesToLoad={(value) => setScenesToLoad(value)}
                             />
                    }

                </div>
            }

            {!show &&

                <ShowSelector onClick={(show) => dispatch(setShow(show))} />

            }


        </div>
    )


}

export default Script
