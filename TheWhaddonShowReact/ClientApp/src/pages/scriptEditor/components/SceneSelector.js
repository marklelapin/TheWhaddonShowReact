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


import { TestAct } from '../Script'


function SceneSelector(props) {
    const debug = false;

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


    const handleClick = (type, id) => {

        switch (type) {
            case 'goto':
                dispatch(changeFocus({ id: id })) //TODO add in travel to scene functionality?
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

    return (
        <div id="scene-selector" className="draft-border">
            <h2>Search</h2>
            <ScriptSearch onChange={(type, value) => handleSearchParameterChange(type, value)} />

            <h2>Scenes</h2>

            {filteredScenes().map(scene => {

                if (scene.type === ACT) {

                    return <h2 key={scene.id}>scene.text</h2>
                }

                return <SceneSelectorRow
                    key={scene.id}
                    scene={scene}
                    onClick={(type, id) => handleClick(type, id)}
                />


            })}


        </div>



    )

}

export default SceneSelector;