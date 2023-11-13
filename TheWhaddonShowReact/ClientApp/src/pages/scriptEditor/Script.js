//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import {FormGroup, Input, Button} from 'reactstrap';
//localServerModels
import { ScriptItemUpdate, SCRIPT_ITEM } from '../../dataAccess/localServerModels';
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN, DIALOGUE } from '../../dataAccess/scriptItemTypes';
import { prepareUpdates, getLatest } from '../../dataAccess/localServerUtils';
import { sortLatestScriptItems, newScriptItemsForCreateShow } from './scripts/scriptItem';
import { addUpdates } from '../../actions/localServer';

//Utils
import { log } from '../../helper.js';
import isScreen from '../../core/screenHelper';


function Script() {

    //constants
    const [testAct, setTestAct] = useState(null)
    const debug = true;
    const dispatch = useDispatch();


    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const sceneHistory = useSelector((state) => state.scriptEditor.sceneHistory)
    //Internal State
    const [isLargerScreen, setIsLargerScreen] = useState(null)
    const [show, setShow] = useState(null)
    const [newShowName, setNewShowName] = useState('')

    log(debug, 'Script: sceneHistory', sceneHistory)

  
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

        return (isScreen('xs') || isScreen('sm'))

    }

    const createNewShow = () => {

        if (newShowName.length === 0) {
            alert('Please enter a show name')
        } else {
            const scriptItems = newScriptItemsForCreateShow(newShowName)
            const preparedUpdates = prepareUpdates(scriptItems)
            dispatch(addUpdates(preparedUpdates, SCRIPT_ITEM))
            setNewShowName('')

        }
        

    }

    const handleScriptViewerClick = (action) => {
        switch (action) {
            case 'clearScript': setShow(null); break;
            default: return;
        }


    }

    const shows = getLatest(sceneHistory.filter((scene) => scene.type === SHOW))

    const scenes = (show) ? sortLatestScriptItems(show, sceneHistory) : []

    log(debug, 'Scipt Rendering Scene', scenes)

    //-----------------------------------------------------------------------
    return (

        <div id="script-page" className="draft-border">

            {(isLargerScreen) && <h1 className="page-title">Script - <span className="fw-semi-bold">{(show) ? show.text : 'Editor'}</span></h1>}

            {show &&
                <div id="script-page-content">
                    {(showSceneSelector || isLargerScreen) &&
                        <div id="script-selector" >
                            <SceneSelector scenes={scenes} />
                        </div>
                    }

                    {(!showSceneSelector || isLargerScreen) &&
                        <div id="script-viewer">
                            <ScriptViewer scenes={scenes} onClick={(action) => handleScriptViewerClick(action)} />

                        </div>
                    }

                </div>
            }

            {!show &&
                <>
                    <h2>Choose a show...</h2>
                    <div id="show-selector">
                        {shows.map((show) => {
                            return (
                                <Button key={show.id} onClick={() => setShow(show)}>{show.text}</Button>
                            )
                        })}
                    <FormGroup>
                        <Input type="text" name="newShow" id="newShow" value={newShowName}  placeholder="New Show Name" onChange={((e) => setNewShowName(e.target.value))} />
                        <Button type = "submit" key={"createNew"} onClick={() => createNewShow()}>Create New Show!</Button>
                        </FormGroup>


                        
                    </div>
                </>
            }
                          
           
        </div>



    )


}

export default Script
