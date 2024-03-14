//React & Redux
import classnames from 'classnames';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MOVE_SCENE, setShowSceneSelector, trigger, updateMovementInProgress, updateScriptFilter, updateSceneInFocus,MULTIPLE } from '../../../actions/scriptEditor';

//Components

import SceneSelectorRow from './SceneSelectorRow';
import ScriptSearch from './ScriptSearch';

//Utils

import { log, SCENE_SELECTOR as logType } from '../../../dataAccess/logging';
import { ACT, SHOW } from '../../../dataAccess/scriptItemTypes';
import s from '../Script.module.scss';
import { isViewAsPartPerson } from '../scripts/part';
import { END, moveFocusToId } from '../scripts/utility';


function SceneSelector(props) {

    const { show, scenesToLoad, isModal = false } = props;

    const dispatch = useDispatch();

    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const searchParameters = useSelector(state => state.scriptEditor.searchParameters)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const currentPartPersons = useSelector(state => state.scriptEditor.currentPartPersons)
    const currentScriptFilter = useSelector(state => state.scriptEditor.scriptFilter)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)
    const viewMode = useSelector(state => state.scriptEditor.viewMode)

    const showSingleScene = (viewMode !== MULTIPLE) || isMobileDevice

    const noSearchParametersSet = (searchParameters.characters === '' && searchParameters.tags.length === 0 && searchParameters.myScenes === false)

    log(logType, 'viewAsPartPerson', { viewAsPartPerson })


    const getFilteredShowOrder = () => {

        let filteredScenes = showOrder?.filter(scene => scene.type !== SHOW)
            .map(scene => ({
                ...scene,
                show: true //gets converted to false if not matching searches below
                , isViewAsPartPerson: isViewAsPartPerson(viewAsPartPerson, scene, currentPartPersons)   //indicates if viesAsPartPerson is in the scene
            })) || [];


        //filter out scenes not matching characters
        if (searchParameters.characters?.length > 0) {
            filteredScenes = filteredScenes.map(scene => {
                if (scene.type !== ACT && !(scene.text?.toLowerCase().includes(searchParameters.characters.toLowerCase()) || (scene.sceneNumber && scene.sceneNumber.toString().includes(searchParameters.characters)))) {
                    return { ...scene, show: false };
                } else {
                    return scene;
                }
            })
        }
        //filter out scenes not matching tags
        if (searchParameters.tags?.length > 0) {
            filteredScenes = filteredScenes.map(scene => {
                if (scene.type !== ACT && !scene.tags.some(tag => searchParameters.includes(tag))) {
                    return { ...scene, show: false };
                } else {
                    return false;
                }
            })
        }
        //filter out scenes that don't contain viewAsPartPerson
        if (searchParameters.myScenes === true) {
            filteredScenes = filteredScenes.map(scene => {
                if (scene.type !== ACT && !scene.isViewAsPartPerson) {
                    return { ...scene, show: false };
                } else {
                    return scene;
                }
            });
        }
        const filteredShowOrder = filteredScenes.filter(scene => scene.show === true);

        return filteredShowOrder;
    }

    const filteredShowOrder = getFilteredShowOrder();


    useEffect(() => {
        if (!showSingleScene) { //doesn't do it for mobile devices due to performance
            handleUpdateScriptFilter()
        }
    }, [searchParameters, showSingleScene]) //eslint-disable-line react-hooks/exhaustive-deps

    const handleUpdateScriptFilter = () => {
        const newScriptFilter = (noSearchParametersSet) ? null : filteredShowOrder.map(scene => scene.id)
        dispatch(updateScriptFilter(newScriptFilter))
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

        dispatch(trigger(MOVE_SCENE, { sceneId, value: newPreviousId }))
    }

    const handleClick = (type, id) => {
        switch (type) {
            case 'goto':
                if (showSingleScene) {
                    dispatch(updateScriptFilter([id]))
                } else if (currentScriptFilter === null || currentScriptFilter.includes(id)) {
                    dispatch(updateMovementInProgress(true))
                    moveFocusToId(id, END, true)
                    dispatch(updateSceneInFocus(showOrder.find(item => item.id === id)))
                } else {
                    handleUpdateScriptFilter()
                    dispatch(updateMovementInProgress(true))
                    moveFocusToId(id, END, true)
                    dispatch(updateSceneInFocus(showOrder.find(item=>item.id === id)))
                }
                break;
            default:
                break;
        }

        if (isModal) dispatch(setShowSceneSelector(false))
    }



    log(logType, 'render props', { filteredShowOrder })

    return (
        <div id="scene-selector" className={classnames(s.sceneSelector, (isModal) ? s.modal : null)} >
            <ScriptSearch isModal={isModal} />

            <h2>Scenes</h2>
            <div className="full-height-overflow">

                {filteredShowOrder.map((scene, idx) => {

                    return (idx < scenesToLoad || scenesToLoad === null) &&

                        <SceneSelectorRow
                            key={scene.id}
                            scene={scene}
                            onClick={(action, id) => handleClick(action, id)}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            isInFocus={scene.id === sceneInFocus}
                            highlight={scene.isViewAsPartPerson}
                            isMobileDevice={isMobileDevice}

                        />


                })}


            </div>



        </div>



    )

}

export default SceneSelector;