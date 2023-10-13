//React and Redux
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index.js';

//Components
import { Row, Col } from 'reactstrap';
import ScriptItem from 'pages/scriptEditor/components/ScriptItem.js';
import PartEditor from 'pages/scriptEditor/components/PartEditor.js';


//Utilities
import { prepareUpdates, prepareUpdate } from 'dataAccess/localServerUtils';
import { sortLatestScriptItems } from 'dataAccess/scriptItemScripts';
import { addUpdates } from 'actions/localServer';
import { newScriptItemsForDelete, newScriptItemsForCreate, createHeaderScriptItems } from '../scripts/crudScripts';

import { getNextUndoDate, getNextRedoDate } from '../scripts/undoScripts';
import { log } from 'helper'
import { moveFocusToId, moveFocusToUndefinedScriptItem } from '../scripts/utilityScripts';
import { changeFocus } from 'actions/navigation'
import { create } from 'lodash';

//Constants
import { HEADER_TYPES } from 'dataAccess/scriptItemTypes';
import { INITIAL_CURTAIN } from 'dataAccess/scriptItemTypes';
function Scene(props) {

    //utility constants
    const debug = false;
    const debugRenderProps = true;
    const debugKeys = true;

    const dispatch = useDispatch()
    const above = 'above'
    const below = 'below'
    const start = 'start'
    const end = 'end'

    //props
    const { scene, onClick } = props;

    log(debug, 'Scene Passed into Scene', scene)

    //Redux state
    const sceneScriptItemHistory = useSelector(state => state.scriptEditor.sceneScriptItemHistory[scene.id])
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scene.id])
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)


    log(debug, 'sceneScriptItemHistory', sceneScriptItemHistory)

    //Internal State
    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time
    const [scriptItems, setScriptItems] = useState([]); //
    const [focusAfterScriptItemsChange, setFocusAfterScriptItemsChange] = useState(false); //the id to focus on after script items have changed]


    //Update of internal scriptItems. This is triggered by changes to the sceneScriptItemHistory or the undoDateTime
    useEffect(() => {
        resetScriptItems()
    }, [])
    useEffect(() => {
        resetScriptItems()
    }, [sceneScriptItemHistory, undoDateTime])

    const resetScriptItems = () => {
        const scriptItems = sortLatestScriptItems(scene, [...sceneScriptItemHistory], undoDateTime)
        setScriptItems(scriptItems)
    }
    
    //useEffect(() => {
    //    if (focusAfterScriptItemsChange) {
    //        moveFocusToId(focusAfterScriptItemsChange.id, focusAfterScriptItemsChange.position);
    //        setFocusAfterScriptItemsChange(null)
    //    }
    //}, [scriptItems])



    //CRUD OPERATIONS 
    //-------------------------------------------------------------------------------------------------

    const createScriptItem = (placement, currentScriptItem, scriptItems, type = 'Dialogue') => {

        if (HEADER_TYPES.includes(currentScriptItem.type) && currentScriptItem.type !== INITIAL_CURTAIN) {
            return;
        }

        let { newScriptItem, newScriptItems } = newScriptItemsForCreate(placement, currentScriptItem, scriptItems, type)

        log(debug, 'createScriptItem', newScriptItem)
        log(debug, 'newScriptItems', newScriptItems)

        //setFocusAfterScriptItemsChange({
        //    ...newScriptItem, position: (placement === above) ? start : end
        //})

        newScriptItem.setFocus = true

        const preparedUpdates = prepareUpdates(newScriptItems)


        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))

    }

    const deleteScriptItem = (scriptItemToDelete, scriptItems) => {

        if (HEADER_TYPES.includes(scriptItemToDelete.type)) {
            alert('You cannot delete a header item.')
            return;
        }

        const newScriptItems = newScriptItemsForDelete(scriptItemToDelete, scriptItems)

        const preparedUpdates = prepareUpdates(newScriptItems)

        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))

        setFocusAfterScriptItemsChange({
            id: scriptItemToDelete.nextId || scriptItemToDelete.previousId,
            parentId: scriptItemToDelete.parentId,
            position: (scriptItemToDelete.nextId) ? start : end
        })
    }

    const updateIfChanged = (scriptItem) => {
        log(debug, 'updating in Scene.js')


        if (scriptItem.changed) {
            const preparedUpdate = prepareUpdate(scriptItem)
            dispatch(addUpdates(preparedUpdate, 'ScriptItem'))
        }


    }




    //EVENT HANDLERS
    //--------------------------------------------------------------------------------------------------------

    const handleUndo = () => {

        const nextUndoDate = getNextUndoDate([...sceneScriptItemHistory, ...scriptItems], undoDateTime)

        setUndoDateTime(nextUndoDate)

    }

    const handleRedo = () => {

        const nextUndoDate = getNextRedoDate([...sceneScriptItemHistory, ...scriptItems], undoDateTime)

        setUndoDateTime(nextUndoDate)

    }

    const handleSetUndo = () => {

        //process scriptItemsToAdd

        const idsToUpdate = new Set([...scriptItems].filter(item => item.created > undoDateTime).map(item => item.id))


        //convert to array
        const arrayIds = [...idsToUpdate];
        //filter the scriptItems matching the ids
        const filterScriptItems = scriptItems.filter((item) => arrayIds.includes(item.id));

        //update these scriptItems
        const updates = prepareUpdates(filterScriptItems);

        dispatch(addUpdates(updates));

    }




    const handleClick = (action, scriptItem) => {

        switch (action) {
            case 'add': createScriptItem(below, scriptItem, scriptItems); break;
            case 'delete': deleteScriptItem(scriptItem, scriptItems); break;
            case 'confirm': updateIfChanged(scriptItem); break;
            case 'undo': handleUndo(); break;
            case 'redo': handleRedo(); break;
            case 'setUndo': handleSetUndo(); break;
            case 'cancelUndo': setUndoDateTime(null); break;
            default: return;
        }
    }


    const handleKeyDown = (e, scriptItem, previousFocusOverride = null, nextFocusOverride = null) => {

        const up = 'up'
        const down = 'down'

        const closestPosition = () => {

            const percentageAcoss = (e.target.selectionEnd / e.target.value.length)
            const closestPosition = (percentageAcoss > 0.5) ? end : start
            return closestPosition

        }


        const moveFocus = (direction, position = null, overrideId = null) => {

            e.preventDefault()
            const newId = overrideId || (direction === down) ? nextFocusOverride?.id || scriptItem.nextId : previousFocusOverride?.id || scriptItem.previousId
            const currentClosestPosition = closestPosition()
            let newPosition = position || currentClosestPosition //|| (direction === up) ? start : end

            if (newId) {

                moveFocusToId(newId, newPosition)

            }

        }


        if (e.key === 'ArrowDown' && scriptItem.nextId === null) {
            updateIfChanged(scriptItem)
            return
        }




        if (e.shiftKey) {


            let latestScriptItems = []

            setScriptItems((prevScriptItems) => {
                latestScriptItems = [...prevScriptItems]
                return prevScriptItems
            })


            if (e.key === 'ArrowUp') {
                e.preventDefault()

                if (HEADER_TYPES.includes(scriptItem.type)) {
                    moveFocus(up)
                    return
                } else {
                    createScriptItem(above, scriptItem, latestScriptItems)
                    return
                }
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                if (HEADER_TYPES.includes(scriptItem.type)) {
                    moveFocus(down)
                    return
                } else {
                    createScriptItem(below, scriptItem, latestScriptItems)
                    return
                }
            }

            if (e.key === 'Enter' && e.target.tagName.toLowerCase() === 'textarea') {
                /*   log(debugKeys,'it got here')*/
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const text = e.target.value;
                const newText = text.substring(0, start) + '\n' + text.substring(end);
                e.target.value = newText;
                e.target.selectionStart = start + 1;
                e.target.selectionEnd = start + 1;
                return

            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()

            if (HEADER_TYPES.includes(scriptItem.type) && scriptItem.type !== INITIAL_CURTAIN) {
                moveFocus(down)
                return;
            }

            let latestScriptItems = []

            setScriptItems((prevScriptItems) => {
                latestScriptItems = [...prevScriptItems]
                return prevScriptItems
            })


            createScriptItem(below, scriptItem, latestScriptItems)
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            moveFocus(up)
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            moveFocus(down)
            return
        }
        if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
            e.preventDefault()
            moveFocus(down, start)
            return
        }
        if (e.key === 'ArrowLeft' && e.target.selectionEnd === 0) {
            e.preventDefault()
            moveFocus(up, end)
            return
        }


        if (e.key === 'Backspace') {

            if (!scriptItem.text || scriptItem.text === null || scriptItem.text === '') {
                deleteScriptItem(scriptItem, scriptItems)
                return
            }

            if (e.target.selectionEnd === 0) {
                moveFocus(up, end)
                return
            }
        }

        if (e.key === 'Delete') {

            if (e.target.selectionStart === e.target.value.length) {

                const nextScriptItem = scriptItems.find(item => item.id === scriptItem.nextId)
                const previousScriptItem = scriptItems.find(item => item.id === scriptItem.previousId)

                if (scriptItem.text === null || scriptItem.text.length === 0) {
                    deleteScriptItem(scriptItem, scriptItems)
                    return
                }



                if (nextScriptItem && (nextScriptItem.text === null || nextScriptItem.text.length === 0)) {
                    deleteScriptItem(nextScriptItem, scriptItems)
                    return
                }

                if (nextScriptItem) {
                    e.preventDefault();
                    moveFocus(down, start);
                    return;
                }

            }

        }
    }




    const handlePartIdChange = (partIds) => {

        log(debug, 'PartIdChange', partIds)

        let scene = [...scriptItems].find(item => item.type === 'Scene') || {}

        scene.partIds = partIds

        const preparedUpdate = prepareUpdate(scene)

        dispatch(addUpdates(preparedUpdate, 'ScriptItem'))
    }

    //const handleChange = (type, id, value) => {

    //    if (type === 'partIds') {
    //        let update = [...scriptItems].find(item => item.id === id)
    //        update.partIds = value

    //        update = prepareUpdate(update)

    //        dispatch(addUpdates(update, 'ScriptItem')) //part Updates are confirmed in part editor so unlike other updates this automatically updates the store.
    //    }


    //}


    const currentScene = scriptItems.find(item => item.type === 'Scene') || {} //returns the synopsis scriptItem
    const synopsis = scriptItems.find(item => item.type === 'Synopsis') || {} //returns the synopsis scriptItem
    const staging = scriptItems.find(item => item.type === 'InitialStaging') || {}//returns the staging scriptItem')

    const body = () => {

        const bodyScriptItems = [...scriptItems].filter(item => item.type !== 'Scene' && item.type !== 'Synopsis' && item.type !== 'InitialStaging') || []//returns the body scriptItems

        //work out alignment
        const partIdsOrder = [...new Set(bodyScriptItems.map(item => item.partIds[0]))]

        const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

        const righthandPartId = scenePartPersons?.partPersons?.find(partPerson => partPerson.id === viewAsPartPerson?.id || partPerson.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

        const alignedScriptItems = bodyScriptItems.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

        return alignedScriptItems
    }


    log(debugRenderProps, 'Scene bodyScriptItems', body())
    log(debugRenderProps, 'Scene scriptItems', scriptItems)
    log(debugRenderProps, 'Scene currentScene', currentScene)
    log(debugRenderProps, 'Scene synopsis', synopsis)
    log(debugRenderProps, 'Scene staging', staging)



    //---------------------------------

    return (
        <>
            <div className={`scene-header ${(scene.curtainOpen) ? 'curtain-open' : 'curtain-closed'} draft-border`}>
                {
                    (currentScene) &&
                    <ScriptItem scriptItem={currentScene}
                        onClick={(action) => handleClick(action, currentScene)}
                        onKeyDown={handleKeyDown}
                    />

                }
                {synopsis &&
                    <ScriptItem scriptItem={synopsis}
                        onClick={(action) => handleClick(action, synopsis)}

                        onKeyDown={handleKeyDown}
                        nextFocus={
                            {
                                id: (currentScene.partIds) ? currentScene.partIds[0] : null,
                                parentId: currentScene.id,
                                position: start
                            }}
                    />
                }
                <PartEditor
                    scene={currentScene}
                    onChange={(partIds) => handlePartIdChange(partIds)}
                    previousFocus={{ id: synopsis.id, parentId: currentScene.id, position: end }} //override the default focus ids
                    nextFocus={{ id: staging.id, parentId: currentScene.id, position: start }}
                />

                {staging &&
                    <>
                        <ScriptItem
                            scriptItem={staging}
                            onClick={(action) => handleClick(action, staging)}
                            onKeyDown={handleKeyDown}
                            previousFocus={
                                {
                                    id: (currentScene.partIds) ? currentScene.partIds[currentScene.partIds.length - 1] : null,
                                    parentId: currentScene.id,
                                    position: end
                                }}

                        />
                    </>

                }

            </div>


            <div className="scene-body">
                {body().map((scriptItem, index) => {
                    return (
                        <ScriptItem
                            onClick={(action) => handleClick(action, scriptItem)}
                            key={scriptItem.id}
                            scriptItem={scriptItem}
                            scene={currentScene}
                            alignRight={scriptItem.alignRight}
                            onKeyDown={handleKeyDown}

                        />
                    )
                })
                }
            </div>

            <div className={`scene-footer ${currentScene.finalCurtain ? 'curtain-open' : 'curtain-closed'}`}>
                <div className="add-new-scene clickable" onClick={() => onClick('addNewScene', currentScene)}>
                    (add new scene)
                </div>
            </div>
        </>
    )
}

export default Scene;