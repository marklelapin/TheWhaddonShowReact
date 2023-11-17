//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import ShowSelector from './components/ShowSelector';

//Utils
import { log } from '../../helper.js';
import isScreen from '../../core/screenHelper';


function Script() {

    //constants
    const debug = true;


    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)

    //Internal State
    const [isLargerScreen, setIsLargerScreen] = useState(null)
    const [show, setShow] = useState(null)


    //UseEffect Hooks
    useEffect(() => {
        window.addEventListener('resize', handleScriptScreenResize);

        return () => { window.removeEventListener('resize', handleScriptScreenResize); }
    }, []);


    useEffect(() => {
        handleScriptScreenResize()
    }, [])


    //eventHandlers
    const handleScriptScreenResize = () => {
        //console.log(`hadnle resize static: ${sidebarStatic} opened: ${sidebarOpened}`)
        if (isSmallerScreen()) {
            setIsLargerScreen(false)

        } else
            setIsLargerScreen(true)
    }

    const isSmallerScreen = () => {

        return (isScreen('xs') || isScreen('sm') || isScreen('md'))

    }


    const handleScriptViewerClick = (action) => {
        switch (action) {
            case 'clearScript': setShow(null); break;
            default: return;
        }


    }


    log(debug, 'Script: show', show)
    //-----------------------------------------------------------------------
    return (

        <div id="script-page" className="flex-full-height">

            {(isLargerScreen) &&
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
                            <ScriptViewer show={show} onClick={(action) => handleScriptViewerClick(action)} />
                    }

                </div>
            }

            {!show &&
       
                <ShowSelector onClick={(show) => setShow(show)} />            
   
            }


        </div>



    )


}

export default Script
