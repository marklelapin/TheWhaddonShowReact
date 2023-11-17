//React & Redux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateSearchParameters, toggleSceneSelector } from '../../../actions/scriptEditor';

//Components
import ScriptSearch from './ScriptSearch'
import SceneSelectorRow from './SceneSelectorRow'

//Utils
import { ACT } from '../../../dataAccess/scriptItemTypes'
import { log } from '../../../helper';
import { moveFocusToId } from '../scripts/utility'
import { prepareUpdates } from '../../../dataAccess/localServerUtils';
import { addUpdates } from '../../../actions/localServer';
import { sortLatestScriptItems, addSceneNumbers, newScriptItemsForMoveScene } from '../scripts/scriptItem';
//Constants
import { SCRIPT_ITEM } from '../../../dataAccess/localServerModels';


function SceneSelector(props) {
    const debug = true;

    const { show } = props;

    const dispatch = useDispatch();

    const sceneHistory = useSelector(state => state.scriptEditor.sceneHistory)
    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)


    let scenes = (show) ? sortLatestScriptItems(show, sceneHistory) : []

    scenes = addSceneNumbers(scenes)


    const handleSearchParameterChange = (type, value) => {
        let newSearchParameters = { ...searchParameters }

        switch (type) {
            case 'addTag':
                newSearchParameters.tags.push(value)
                break;
            case 'removeTag':
                newSearchParameters.tags = newSearchParameters.tags.filter(tag => tag !== value)
                break;
            case 'myScenes':
                newSearchParameters.myScenes = value
                break;
            default:
                break;
        }

        dispatch(updateSearchParameters(newSearchParameters))
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

        const updates = newScriptItemsForMoveScene(sceneId, newPreviousId, scenes)

        const preparedUpdates = prepareUpdates(updates)

        dispatch(addUpdates(preparedUpdates, SCRIPT_ITEM));

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
        <div id="scene-selector" className="flex-full-height">
            <h2>Search</h2>
            <ScriptSearch onChange={(type, value) => handleSearchParameterChange(type, value)} />

            <h2>Scenes</h2>
            <div className="full-height-overflow">

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



        </div>



    )

}

export default SceneSelector;