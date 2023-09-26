import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import {store} from 'index.js'; 
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import { ScriptItemUpdate, Synopsis, Staging, Dialogue, ScriptItem } from 'dataAccess/localServerModels';
import { prepareUpdates } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import Scene from 'pages/scriptEditor/components/Scene';
function Script() {


    const debug = true;
    const dispatch = useDispatch();

    //createSelector used for compled state selection to avoid unecessary rerenders
    const getScriptItems = (state) => state.localServer.scriptItems.history
    const storedScenesSelector = createSelector(
        [getScriptItems],
        (items) => items.filter(item => item.type === 'Scene' || item.type === 'Act' || item.type === 'Show')
    );
    const storedScenes = storedScenesSelector(store.getState())

     useEffect(() => {

         const testScene = new ScriptItemUpdate('Scene', 'New Scene Title')
         const testSynopsis = new ScriptItemUpdate(Synopsis, 'A test scene to check that the system is working')
         const testStaging = new ScriptItemUpdate(Staging, 'Curtains open and two chairs set opposite each other on a table')
         const testDialogue1 = new ScriptItemUpdate(Dialogue, 'Hello World')
         const testDialogue2 = new ScriptItemUpdate(Dialogue, 'Hello World Again')

         testScene.nextId = testSynopsis.id
         testSynopsis.nextId = testStaging.id
         testStaging.nextId = testDialogue1.id
         testDialogue1.nextId = testDialogue2.id

         testScene.parentId = testScene.id
         testSynopsis.parentId = testScene.id
         testStaging.parentId = testScene.id
         testDialogue1.parentId = testScene.id
         testDialogue2.parentId = testScene.id
         debug && console.log('testScene from Script.js')
         debug && console.log(testScene)

         const preparedUpdates = prepareUpdates([testScene, testSynopsis, testStaging, testDialogue1, testDialogue2])

         debug && console.log('Prepared Updates from Script.js')
         debug && console.log(preparedUpdates)



        dispatch(addUpdates(preparedUpdates, ScriptItem))

     }, [])

 
     console.log(storedScenes)

    return (
        <>
            {(storedScenes && storedScenes.length > 0) && storedScenes.map(scene => (
              <Scene key={scene.id} sceneId={scene.id} />
            )

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