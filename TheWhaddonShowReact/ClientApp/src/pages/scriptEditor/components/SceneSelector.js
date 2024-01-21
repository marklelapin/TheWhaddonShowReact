//React & Redux
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';
import { updateSearchParameters, trigger, MOVE_SCENE, updateMovementInProgress } from '../../../actions/scriptEditor';

//Components
import ScriptSearch from './ScriptSearch'
import SceneSelectorRow from './SceneSelectorRow'

//Utils

import { log } from '../../../logging';
import { moveFocusToId, END } from '../scripts/utility';
import { isViewAsPartPerson } from '../scripts/part';
import { ACT } from '../../../dataAccess/scriptItemTypes'
import s from '../Script.module.scss'


function SceneSelector(props) {

    const { show, scenesToLoad, isModal = false } = props;

    const dispatch = useDispatch();

    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const currentPartPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    const [beingDragged, setBeingDragged] = useState(false)

    const getFilteredShowOrder = () => {

        let filteredScenes = showOrder.filter(scene => scene.type === ACT)

        if (searchParameters.text) filteredScenes = [...filteredScenes, showOrder?.filter(scene => scene.text.includes(searchParameters.text)) || scene.sceneNumber.includes(searchParameters.text)]

        if (searchParameters.myScenes === true) filteredScenes = [...filteredScenes, showOrder?.filter(scene => isViewAsPartPerson(viewAsPartPerson,scene,currentPartPersons))]

        if (searchParameters.tags && searchParameters.tags.length > 0) filteredScenes = [...filteredScenes, showOrder?.filter(scene => scene.tags.some(tag => searchParameters.tags.includes(tag)))]

        filteredScenes = filteredScenes.filter(scene => scene.isActive).map(scene => scene.id)

        return filteredScenes

    }
    const filteredShowOrder = getFilteredShowOrder();




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
                dispatch(updateMovementInProgress(true))
                moveFocusToId(id, END, true)
                break;
            default:
                break;
        }
    }


    return (
        <div id="scene-selector" className={classnames(s.sceneSelector, (isModal) ? s.modal : null)} >
            <h2>Search</h2>
            <ScriptSearch onChange={(type, value) => handleSearchParameterChange(type, value)} />

            <h2>Scenes</h2>
            <div className="full-height-overflow">

                {showOrder.map((scene, idx) => {

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
                        isInFocus={scene.id === sceneInFocus.id}
                        highlight={isViewAsPartPerson(viewAsPartPerson,scene,currentPartPersons)}

                        />


                })}


            </div>



        </div>



    )

}

export default SceneSelector;