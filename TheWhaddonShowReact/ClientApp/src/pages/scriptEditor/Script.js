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
import { log } from '../../logging.js';
import isScreen from '../../core/screenHelper';


function Script() {

    //constants
    const debug = true;
    const dispatch = useDispatch();

    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const show = useSelector((state) => state.scriptEditor.show)
    //Internal State
    const [isLargerScreen, setIsLargerScreen] = useState(null)


    //UseEffect Hooks
    useEffect(() => {

        let timeoutId;
        const handleResizeDebounce = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handleScriptScreenResize(), 1000);
        }

        handleScriptScreenResize()

        window.addEventListener('resize', handleResizeDebounce);

        return () => { window.removeEventListener('resize', handleResizeDebounce); }
    }, []);

    //eventHandlers
    const handleScriptScreenResize = () => {
        if (isSmallerScreen()) {
            dispatch(updateShowComments(false))
            setIsLargerScreen(false)
        } else {
            dispatch(updateShowComments(true))
            setIsLargerScreen(true)
        }
    }
    const isSmallerScreen = () => {
        return (isScreen('xs') || isScreen('sm') || isScreen('md') || isScreen('lg'))
    }



    log(debug, 'Script: show', show)
    //-----------------------------------------------------------------------
    return (

        <div id="script-page" className="flex-full-height">

            {(isLargerScreen) && !show &&
                <div className="page-top">
                    <h1 className="page-title">Script - <span className="fw-semi-bold">{(show) ? show.text : 'Editor'}</span></h1>
                </div>
            }

            {show &&
                <div id="script-page-content" className="page-content flex-full-width">
                    {(showSceneSelector || isLargerScreen) &&
                        <SceneSelector show={show} />
                    }

                    {(!showSceneSelector || isLargerScreen) &&
                        <ScriptViewer show={show} />
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
