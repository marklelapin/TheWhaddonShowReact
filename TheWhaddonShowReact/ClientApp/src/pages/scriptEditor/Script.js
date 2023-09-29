import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { store } from 'index.js';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { ScriptItemUpdate, Synopsis, Staging, Dialogue, ScriptItem } from 'dataAccess/localServerModels';
import { prepareUpdates, sortLatestScriptItems } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import Scene from 'pages/scriptEditor/components/Scene';
import log from 'helper.js';
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
    const [testAct,setTestAct] = useState({})

    useEffect(() => {
        log(debug, 'refreshTrigger useEffect',refreshTrigger)
     
        if (refreshTrigger.type === 'ScriptItem' && refreshTrigger.ids.length > 0) {

            const storedScenes = storedScenesSelector(store.getState())
            log(debug, 'storedScenes', storedScenes)
            const sortedScenes = sortLatestScriptItems(testAct,storedScenes)
            log(debug, 'sortedScenes', sortedScenes)
            setStoredScenes(sortedScenes)
        }
    }, [refreshTrigger])
   





    useEffect(() => {
        const testShow = new ScriptItemUpdate('Show', 'The Whaddon Show')
        const testAct = new ScriptItemUpdate('Act', 'Act 1')
        const testScene = new ScriptItemUpdate('Scene', 'New Scene Title')
        const testSynopsis = new ScriptItemUpdate(Synopsis, 'A test scene to check that the system is working')
        const testInitialStaging = new ScriptItemUpdate('InitialStaging', 'Curtains open and two chairs set opposite each other on a table')
        const testDialogue1 = new ScriptItemUpdate(Dialogue, 'Hello World')
        const testDialogue2 = new ScriptItemUpdate(Dialogue, 'Hello World Again')

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


    log(debug,'Script Re-Rendering',storedScenes)
        return (
        <>
                {(storedScenes && storedScenes.length > 0) && storedScenes.map(scene => {

                    if (scene.type === 'Show') {
                        return <h1>{scene.text}</h1>
                    }
                    else if (scene.type === 'Act') {
                        return <h2>{scene.text}</h2>
                    }
                    else {
                        return <Scene key={scene.id} scene={scene} />
                    }
                }

            )}

        </>



    )


}

export default Script


            //Old Chat Code
    //render() {
    //  const { mobileState } = this.props;
    //  return (
    //    <div className={`chat-page-wrapper ${s.chatPage} ${mobileState === MobileChatStates.LIST ? 'list-state' : ''} ${mobileState === MobileChatStates.CHAT ? 'chat-state' : ''} ${mobileState === MobileChatStates.INFO ? 'info-state' : ''}`}>
    //      <ChatList />
    //      <ChatDialog />
    //      <ChatInfo />
    //    </div>
    //  )
    //}