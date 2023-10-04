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

function Script() {


    const debug = false;
    const dispatch = useDispatch();

    //createSelector used for compled state selection to avoid unecessary rerenders
    const getScriptItems = (state) => state.localServer.scriptItems.history
    const storedScenesSelector = createSelector(
        [getScriptItems],
        (items) => {
            log(debug, 'Script Selector')
            return items.filter(item => item.type === 'Scene' || item.type === 'Act' || item.type === 'Show')
        }
    );

    const refreshTrigger = useSelector((state) => state.localServer.refresh)
    const [storedScenes, setStoredScenes] = useState([])


    const [testAct,setTestAct] = useState(null)

    useEffect(() => {
        log(debug, 'refreshTrigger useEffect', refreshTrigger)

        if (refreshTrigger.type === 'ScriptItem' && refreshTrigger.ids.length > 0) {

            const storedScenes = storedScenesSelector(store.getState())
            log(debug, 'storedScenes', storedScenes)
            const sortedScenes = sortLatestScriptItems(testAct, storedScenes)
            log(debug, 'sortedScenes', sortedScenes)
            setStoredScenes(sortedScenes)
        }
    }, [refreshTrigger])



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

    //-----------------------------------------------------------------------
    return (


               

        <div id="script-page" className="draft-border">
            <Container fluid>
                <h2>The Whaddon Show 2023</h2>
                <Row>
                    <Col md={3}>
                        <SceneSelector scenes={storedScenes} />
                    </Col>
                    <Col md={9}>
                        <ScriptViewer scenes={storedScenes} />

                    </Col>

                </Row>

            </Container>
            
           
            

        </div>



    )


}

export default Script
