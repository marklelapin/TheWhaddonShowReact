import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index.js';
import { getLatest, prepareUpdates, useSortLatestScriptItems, sortLatestScriptItems, sortScriptItems, prepareUpdate } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import ScriptItem from 'pages/scriptEditor/components/ScriptItem.js';
import PartEditor from 'pages/scriptEditor/components/PartEditor.js';

import s from 'pages/forms/elements/Elements.module.scss';
import { Input } from 'reactstrap';
import TextareaAutosize from 'react-autosize-textarea';
import BlurAndFocusListener from './BlurAndFocusListener';

import { newScriptItemsForDelete, newScriptItemsForCreate } from '../scripts/crudScripts';
import { findScriptItem, moveFocusToId } from '../scripts/utilityScripts';
import { getNextUndoDate, getNextRedoDate } from '../scripts/undoScripts';
import { log } from 'helper'
function Scene(props) {

    //utility constants
    const debug = false;
    const debugFocus = true;
    const _ = require('lodash');
    const dispatch = useDispatch()
    const above = 'above'
    const below = 'below'
    const up = 'up'
    const down = 'down'

    //props
    const { scene } = props;

    log(debug, 'Scene Passed into Scene', scene)


    //UPDATE MECHANISM FOR SCRIPT ITEMS TO SYNC WITH REDUX STORE
    //--------------------------------------------------------------------------------------------------------
    //Create Selector for ScriptItems in Redux Store necessary due to filtering of state.
    const getScriptItems = (state) => state.localServer.scriptItems.history
    const selectorScriptItems = createSelector(
        [getScriptItems],
        (item, _) => {
            log(debug, 'selectorScriptItems from Scene.js')
            return item.filter((item) => (item.parentId === scene.id || item.id === scene.id)) || []
        })

    const refreshTrigger = useSelector((state) => state.localServer.refresh) //identifies when a change has been made to localserver redux store

    const [storedScriptItems, setStoredScriptItems] = useState([]) //internal state copy of stored scriptItems

    useEffect(() => { //without this manual refresh mechanism state was continually being updated from background dispatches such as sync and end sync + others.

        log(debug, 'refreshTrigger from Scene.js', refreshTrigger)

        if (refreshTrigger.type === 'ScriptItem' && refreshTrigger.ids.length > 0) {
            const storedScriptItems = selectorScriptItems(store.getState())

            setStoredScriptItems(storedScriptItems)
        }
    }, [refreshTrigger])
    //--------------------------------------------------------------------------------------------------------



    //Setup remaining internal state:
    //--------------------------------------------------------------------------------------------------------

    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time
    const [scriptItems, setScriptItems] = useState([]); //
    const [focusAfterScriptItemChange, setFocusAfterScriptItemChange] = useState({}); //the id to focus on after script items have changed

    useEffect(() => {
        log(debugFocus,'moveFocusToId',focusAfterScriptItemChange)
        moveFocusToId(focusAfterScriptItemChange.id, focusAfterScriptItemChange.direction)
    }, [scriptItems])


    useEffect(() => {
        log(debugFocus,'updateScriptItems')
        const scriptItemsUpdate = sortLatestScriptItems(scene, [...storedScriptItems], undoDateTime)
        setScriptItems(scriptItemsUpdate)

    }, [])

    useEffect(() => {
        log(debug, 'useEffect - storedScriptItems')
        const scriptItemsUpdate = sortLatestScriptItems(scene, [...storedScriptItems], undoDateTime)
        setScriptItems(scriptItemsUpdate)

    }, [storedScriptItems, undoDateTime])







    //CRUD OPERATIONS 
    //-------------------------------------------------------------------------------------------------

    const createScriptItem = (placement, existingScriptItem, scriptItems, type = 'Dialogue') => {

        const { newScriptItem, newScriptItems } = newScriptItemsForCreate(placement, existingScriptItem, scriptItems, type)

        log(debug, 'createScriptItem', newScriptItem)
        log(debug, 'newScriptItems', newScriptItems)


        setFocusAfterScriptItemChange({
            id: newScriptItem.id,
            direction: (placement === above) ? up : down
        })

        const preparedUpdates = prepareUpdates(newScriptItems)

        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))

    }

    const deleteScriptItem = (scriptItemToDelete, scriptItems) => {

        const newScriptItems = newScriptItemsForDelete(scriptItemToDelete, scriptItems)

        setFocusAfterScriptItemChange({
            id: scriptItemToDelete.nextId || scriptItemToDelete.previousId,
            direction: (scriptItemToDelete.nextId) ? down : up
        })

        const preparedUpdates = prepareUpdates(newScriptItems)

        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))

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

        const nextUndoDate = getNextUndoDate([...storedScriptItems, ...scriptItems], undoDateTime)

        setUndoDateTime(nextUndoDate)

    }

    const handleRedo = () => {

        const nextUndoDate = getNextRedoDate([...storedScriptItems, ...scriptItems], undoDateTime)

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




    const handleKeyDown = (e, scriptItem) => {

        const up = 'up'
        const down = 'down'

        const moveFocus = (direction, overrideId = null) => {
            e.preventDefault()
            const newId = overrideId || (direction === down) ? scriptItem.nextId : scriptItem.previousId

            if (newId) {

                moveFocusToId(newId, direction)

            }

        }


        if (e.key === 'ArrowDown' && scriptItem.nextId === null) {
            updateIfChanged(scriptItem)
            return
        }


        if (e.shiftKey) { //create new chat bubble


            let latestScriptItems = []

            setScriptItems((prevScriptItems) => {
                latestScriptItems = [...prevScriptItems]
                return prevScriptItems
            })


            if (e.key === 'ArrowUp') {
                e.preventDefault()
                createScriptItem(above, scriptItem, latestScriptItems)
                return
            }

            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault()
                createScriptItem(below, scriptItem, latestScriptItems)
                return
            }
        }

        if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault()
            moveFocus(down)
            return
        }
        if (e.key === 'ArrowUp' && e.target.selectionEnd === 0) {
            e.preventDefault()
            moveFocus(up)
            return
        }
        if (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length) {
            e.preventDefault()
            moveFocus(down)
            return
        }
        if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
            e.preventDefault()
            moveFocus(down)
            return
        }
        if (e.key === 'ArrowLeft' && e.target.selectionEnd === 0) {
            e.preventDefault()
            moveFocus(up)
            return
        }


       if (e.key === 'Backspace') {

            if (!scriptItem.text || scriptItem.text === null || scriptItem.text === '') {
                deleteScriptItem(scriptItem, scriptItems)
                return
            }

            if (e.target.selectionEnd === 0) {
                moveFocus(up)
                return
            }
        }

    }


    const handleBlur = (e, scriptItem = null) => {

        /*const scriptItem = findScriptItem(e.target, scriptItems)*/  //May need to go back to global blur event listener if performance is an issue

        if (scriptItem) {
            log(debug, 'Sending update from blur:', scriptItem)
            updateIfChanged(scriptItem)
        }
    }


    const handleChange = (type, id, value) => {

        if (type === 'partIds') {
            let update = [...scriptItems].find(item => item.id === id)
            update.partIds = value

            update = prepareUpdate(update)

            dispatch(addUpdates(update)) //part Updates are confirmed in part editor so unlike other updates this automatically updates the store.
        }
        if (type === 'text') {
            log(debug, 'handleSceneHeaderChange')
            let updateArray = [...scriptItems]
            updateArray = updateArray.map(item => {
                if (item.id === id) { return { ...item, text: value, changed: true } } else { return item }
            })

            setScriptItems(updateArray)
            //don't update whilst changing - update on loss of focus
        }

    }


    const currentScene = [...scriptItems].find(item => item.type === 'Scene') || {} //returns the synopsis scriptItem
    const synopsis = [...scriptItems].find(item => item.type === 'Synopsis') || {} //returns the synopsis scriptItem
    const staging = [...scriptItems].find(item => item.type === 'InitialStaging') || {}//returns the staging scriptItem')

    const body = [...scriptItems].filter(item => item.type !== 'Scene' && item.type !== 'Synopsis' && item.type !== 'InitialStaging') || []//returns the body scriptItems

    log(debugFocus, 'scriptItems', scriptItems)
    log(debug, 'storedSCriptItems', storedScriptItems)
    log(debug, 'currentScene', currentScene)

    //---------------------------------

    return (
        <>
            <div className="scene-header">
                {
                    (currentScene) &&
                    <Input
                        id={currentScene.id}
                        className="scene-title script-item text-input"
                        type="text"
                        key={currentScene.id}
                        placeholder="enter name"
                        value={currentScene.text || ''}
                        onChange={(e) => handleChange('text', currentScene.id, e.target.value)}
                        onBlur={() => handleBlur(currentScene)}
                        onKeyDown={(e) => handleKeyDown(e, currentScene)} />

                }
                {synopsis &&
                    <TextareaAutosize
                        id={synopsis.id}
                        key={synopsis.id}
                        placeholder="..."
                        className={`form-control ${s.autogrow} transition-height scene-synopsis script-item text-input`}
                        value={synopsis.text || ''}
                        onChange={(e) => handleChange('text', synopsis.id, e.target.value)}
                        onBlur={() => handleBlur(currentScene)}
                        onKeyDown={(e) => handleKeyDown(e, synopsis)}
                    />
                }
                {staging &&

                    <TextareaAutosize
                        id={staging.id}
                        key={staging.id}
                        placeholder="..."
                        className={`form-control ${s.autogrow} transition-height scene-staging script-item text-input`}
                        value={staging.text || ''}
                        onChange={(e) => handleChange('text', staging.id, e.target.value)}
                        onBlur={() => handleBlur(currentScene)}
                        onKeyDown={(e) => handleKeyDown(e, staging)}
                    />
                }
                <PartEditor partIds={scene.partIds} onChange={(partIds) => handleChange('partIds', scene.id, partIds)} />
            </div>

            <div className="scene-body">
                {body.map((scriptItem) => {
                    return (
                        <ScriptItem key={scriptItem.id} scriptItem={scriptItem} parts={currentScene.partIds} onKeyDown={handleKeyDown} />
                    )
                })
                }
            </div>

            {moveFocusToId(focusAfterScriptItemChange.id, focusAfterScriptItemChange.direction) }
        </>
    )
}

export default Scene;