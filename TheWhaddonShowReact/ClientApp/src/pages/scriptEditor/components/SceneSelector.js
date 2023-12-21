//React & Redux
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateSearchParameters, toggleSceneSelector, trigger, MOVE_SCENE } from '../../../actions/scriptEditor';

//Components
import ScriptSearch from './ScriptSearch'
import SceneSelectorRow from './SceneSelectorRow'

//Utils

import { log } from '../../../logging';
import { moveFocusToId, END } from '../scripts/utility'



function SceneSelector(props) {
    const debug = true;

    const { show, scenesToLoad } = props;

    const dispatch = useDispatch();

    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)

    const [beingDragged, setBeingDragged] = useState(false)

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

        const filteredScenes = showOrder?.filter(scene => scene.isActive) || []

        return filteredScenes

    }



    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", `sceneId:${e.currentTarget.dataset.sceneid}`)
        setBeingDragged(true)
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
        setBeingDragged(false)
        const newPreviousId = e.currentTarget.dataset.sceneid

        const sceneId = e.dataTransfer.getData("text/plain").substring(8)

        dispatch(trigger(MOVE_SCENE, { sceneId, value: newPreviousId }))
    }






    const handleClick = (type, id) => {
        switch (type) {
            case 'goto':
                moveFocusToId(id,END,true)
                dispatch(toggleSceneSelector())
                break;
            default:
                break;
        }
    }



    log(debug, 'SceneSelector Rendering: filteredScenes', filteredScenes())

    return (
        <div id="scene-selector" className="flex-full-height">
            <h2>Search</h2>
            <ScriptSearch onChange={(type, value) => handleSearchParameterChange(type, value)} />

            <h2>Scenes</h2>
            <div className="full-height-overflow">

                {filteredScenes().map((scene,idx) => {
                    
                    return (idx < scenesToLoad || scenesToLoad === null) &&

                    <SceneSelectorRow
                        key={scene.id}
                        scene={scene}
                        onClick={(action, id) => handleClick(action, id)}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        beingDragged={beingDragged}

                    />


                })}


            </div>



        </div>



    )

}

export default SceneSelector;