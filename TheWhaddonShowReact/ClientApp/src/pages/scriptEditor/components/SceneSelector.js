//React & Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateSearchParameters, toggleSceneSelector } from 'actions/scriptEditor';
import { changeFocus } from 'actions/navigation';

//Components
import ScriptSearch from './ScriptSearch'
import SceneSelectorRow from './SceneSelectorRow'

//Utils
import { ACT, SCENE } from 'dataAccess/scriptItemTypes'
import { log } from 'helper';
import { moveFocusToId } from '../scripts/utility'
import { TestAct } from '../Script'
import { prepareUpdates } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';

//Constants
import { ScriptItem } from 'dataAccess/localServerModels';

function SceneSelector(props) {
    const debug = true;

    const { scenes } = props;

    const dispatch = useDispatch();


    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)
    const showSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)

    const handleSearchParameterChange = (type, value) => {
        let searchParameters = { ...searchParameters }

        switch (type) {
            case 'addTag':
                searchParameters.tags.push(value)
                break;
            case 'removeTag':
                searchParameters.tags = searchParameters.tags.filter(tag => tag !== value)
                break;
            case 'myScenes':
                searchParameters.myScenes = value
                break;
            default:
                break;
        }

        dispatch(updateSearchParameters(searchParameters))
    }


    const handleDragSceneSelector = (e) => {
        //TODO: Add drag and drop functionality - to change scene order

    }


    const filteredScenes = () => {

        const searchTags = searchParameters.tags
        const searchCharacters = searchParameters.characters
        const myScenes = searchParameters.myScenes

        //TODO filtering exercise

        const filteredScenes = scenes.filter(scene => scene.isActive)

        return filteredScenes

    }



    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", `sceneId:${e.currentTarget.dataset.sceneid}`)
    }
    const handleDragOver = (e) => {
        e.preventDefault()
        if (e.dataTransfer.getData("text/plain").substring(0, 1) === "sceneId") {
            e.currentTarget.classList.add("drag-over")
        }

    }
    const handleDragLeave = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove("drag-over")
    }
    const handleDrop = (e) => {
        e.preventDefault()

        const newPreviousId = e.currentTarget.dataset.sceneid

        const sceneId = e.dataTransfer.getData("text/plain").substring(8)

        moveScene(sceneId, newPreviousId)

    }

    const moveScene = (sceneId, newPreviousId) => {

        const scene = scenes.find(scene => scene.id === sceneId)
        const newPreviousScene = scenes.find(scene => scene.id === newPreviousId)
        const newNextScene = scenes.find(scene => scene.id === newPreviousScene?.nextId)
        const oldPreviousScene = scenes.find(scene => scene.id === scene.previousId)
        const oldNextScene = scenes.find(scene => scene.id === scene.nextId)

        let sceneUpdate = (scene) ? { ...scene } : null
        let newPreviousSceneUpdate = (newPreviousScene) ? { ...newPreviousScene } : null
        let newNextSceneUpdate = (newNextScene) ? { ...newNextScene } : null
        let oldPreviousSceneUpdate = (oldPreviousScene) ? { ...oldPreviousScene } : null
        let oldNextSceneUpdate = (oldNextScene) ? { ...oldNextScene } : null

        if (sceneUpdate) {
            sceneUpdate.previousId = newPreviousScene?.id
            sceneUpdate.nextId = newNextScene?.id
        }

        (newPreviousSceneUpdate) && (newPreviousSceneUpdate.nextId = scene?.id);
        (newNextSceneUpdate) && (newNextSceneUpdate.previousId = scene?.id);

        (oldPreviousSceneUpdate) && (oldPreviousSceneUpdate.nextId = oldNextScene?.id);
        (oldNextSceneUpdate) && (oldNextSceneUpdate.previousId = oldPreviousScene?.id);

        const updates = [sceneUpdate, newPreviousSceneUpdate, newNextSceneUpdate, oldPreviousSceneUpdate, oldNextSceneUpdate]

        const preparedUpdates = prepareUpdates(updates)

        dispatch(addUpdates(preparedUpdates, ScriptItem));

    }


    const handleClick = (type, id) => {
        switch (type) {
            case 'goto':
                moveFocusToId(id)
                dispatch(toggleSceneSelector())
                break;
            case 'add':
                console.log('Add Scene Button Pressed') //TODO add in add scene functionality
                break;
            default:
                break;
        }
    }


    log(debug, 'SceneSelector Rendering: scenes', scenes)
    log(debug, 'SceneSelector Rendering: filteredScenes', filteredScenes())

    return (
        <div id="scene-selector" className="draft-border">
            <h2>Search</h2>
            <ScriptSearch onChange={(type, value) => handleSearchParameterChange(type, value)} />

            <h2>Scenes</h2>

            {filteredScenes().map(scene => {

                if (scene.type === ACT) {

                    return <h2 key={scene.id}>{scene.text}</h2>
                }

                return <SceneSelectorRow
                    key={scene.id}
                    scene={scene}
                    onClick={(action, id) => handleClick(action, id)}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}

                />


            })}


        </div>



    )

}

export default SceneSelector;