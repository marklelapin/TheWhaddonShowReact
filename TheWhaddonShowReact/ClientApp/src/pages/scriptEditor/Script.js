//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index'

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import { Container, Row, Col } from 'reactstrap';

//localServerModels
import { ScriptItemUpdate, ScriptItem } from 'dataAccess/localServerModels';
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, DIALOGUE } from 'dataAccess/scriptItemTypes';
import { prepareUpdates, sortLatestScriptItems } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';

//Utils
import { log } from 'helper.js';
import isScreen from 'core/screenHelper';


function Script() {

    //constants
    const [testAct, setTestAct] = useState(null)
    const debug = false;
    const dispatch = useDispatch();


    //Redux State
    const showSceneSelector = useSelector((state) => state.scriptEditor.showSceneSelector)
    const sceneHistory = useSelector((state) => state.scriptEditor.sceneHistory)
    //Internal State
    const [isLargerScreen, setIsLargerScreen] = useState(null)

    log(debug, 'Script: sceneHistory', sceneHistory)

    //REMOVE WHEN TESTING FINISHED 
    //-----------------------------------------------------------------------
    useEffect(() => {
        const testShow = new ScriptItemUpdate(SHOW, 'The Whaddon Show')
        const testAct = new ScriptItemUpdate(ACT, 'Act 1')
        const testScene = new ScriptItemUpdate(SCENE, 'New Scene Title')
        const testSynopsis = new ScriptItemUpdate(SYNOPSIS, 'A test scene to check that the system is working')
        const testInitialStaging = new ScriptItemUpdate(INITIAL_STAGING, 'Curtains open and two chairs set opposite each other on a table')
        const testDialogue1 = new ScriptItemUpdate(DIALOGUE, 'Hello World')
        const testDialogue2 = new ScriptItemUpdate(DIALOGUE, 'Hello World Again')

        testScene.previousId = testAct.id
        testScene.nextId = testSynopsis.id

        testSynopsis.previousId = testScene.id
        testSynopsis.nextId = testInitialStaging.id

        testInitialStaging.previousId = testSynopsis.id
        testInitialStaging.nextId = testDialogue1.id

        testDialogue1.previousId = testInitialStaging.id
        testDialogue1.nextId = testDialogue2.id

        testDialogue2.previousId = testDialogue1.id

        testScene.parentId = testAct.id
        testSynopsis.parentId = testScene.id
        testInitialStaging.parentId = testScene.id
        testDialogue1.parentId = testScene.id
        testDialogue2.parentId = testScene.id

        const preparedUpdates = prepareUpdates([testShow, testAct, testScene, testSynopsis, testInitialStaging, testDialogue1, testDialogue2])

        log(debug, 'Disptach Test Script', preparedUpdates)

        setTestAct(testAct)
        dispatch(addUpdates(preparedUpdates, ScriptItem))

    }, [])

    //UseEffect Hooks
    useEffect(() => {
        window.addEventListener('resize', handleScriptScreenResize);

        return () => { window.removeEventListener('resize', handleScriptScreenResize); }
    }, []);


    useEffect(() => {
        handleScriptScreenResize()
    }, [])


    //calculations

    const scenes = sortLatestScriptItems(testAct,sceneHistory) //TODO add undoDateTime later


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

    log(debug,'Scipt Rendering Scene',scenes)

    //-----------------------------------------------------------------------
    return (

        <div id="script-page" className="draft-border">

            {(isLargerScreen) && <h1 className="page-title">Script - <span className="fw-semi-bold">Editor</span></h1>}
            <Container fluid>
                <Row>
                    {(showSceneSelector || isLargerScreen) &&
                        <Col xs="12" md="3">
                            <SceneSelector scenes={scenes} />
                        </Col>
                    }

                    {(!showSceneSelector || isLargerScreen) &&
                        <Col xs="12" md="9">
                            <ScriptViewer scenes={scenes} />

                        </Col>
                    }

                </Row>

            </Container>


        </div>



    )


}

export default Script
