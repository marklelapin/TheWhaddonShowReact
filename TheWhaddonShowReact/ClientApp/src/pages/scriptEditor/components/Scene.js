//React and Redux
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index.js';

//Components
import { Row,Col} from 'reactstrap';
import ScriptItem from 'pages/scriptEditor/components/ScriptItem.js';
import PartEditor from 'pages/scriptEditor/components/PartEditor.js';


//Utilities
import { prepareUpdates, sortLatestScriptItems, prepareUpdate } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import { newScriptItemsForDelete, newScriptItemsForCreate } from '../scripts/crudScripts';
import { getNextUndoDate, getNextRedoDate } from '../scripts/undoScripts';
import { log } from 'helper'
import { changeFocus } from 'actions/navigation';

function Scene(props) {

    //utility constants
    const debug = false;
    const debugRenderProps = false;


    const _ = require('lodash');
    const dispatch = useDispatch()
    const above = 'above'
    const below = 'below'
    const start = 'start'
    const end = 'end'

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

    const focus = useSelector((state) => state.navigation.focus)


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
    const [focusAfterScriptItemsChange, setFocusAfterScriptItemsChange] = useState(false); //the id to focus on after script items have changed]


    useEffect(() => {
        resetScriptItems()
    }, [])
    useEffect(() => {

        resetScriptItems()

    }, [storedScriptItems, undoDateTime])

    const resetScriptItems = () => {

        const scriptItemsUpdate = sortLatestScriptItems(scene, [...storedScriptItems], undoDateTime)

        setScriptItems(scriptItemsUpdate)

    }

    useEffect(() => {
        dispatch(changeFocus(focusAfterScriptItemsChange))
    }, [scriptItems])



    //CRUD OPERATIONS 
    //-------------------------------------------------------------------------------------------------

    const createScriptItem = (placement, existingScriptItem, scriptItems, type = 'Dialogue') => {

        const { newScriptItem, newScriptItems } = newScriptItemsForCreate(placement, existingScriptItem, scriptItems, type)

        log(debug, 'createScriptItem', newScriptItem)
        log(debug, 'newScriptItems', newScriptItems)


        setFocusAfterScriptItemsChange({
            ...newScriptItem, position: (placement === above) ? start : end
        })

        const preparedUpdates = prepareUpdates(newScriptItems)

        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))

    }

    const deleteScriptItem = (scriptItemToDelete, scriptItems) => {

        const newScriptItems = newScriptItemsForDelete(scriptItemToDelete, scriptItems)

        setFocusAfterScriptItemsChange({
            id: scriptItemToDelete.previousId,
            parentId: scriptItemToDelete.parentId,
            position: end
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




    const handleKeyDown = (e, scriptItem, previousFocusOverride = null, nextFocusOverride = null) => {

        const up = 'up'
        const down = 'down'

        const moveFocus = (direction, overrideId = null) => {
            e.preventDefault()
            const newId = overrideId || (direction === down) ? nextFocusOverride?.id || scriptItem.nextId : previousFocusOverride?.id || scriptItem.previousId

            if (newId) {

                dispatch(changeFocus({ id: newId, parentId: scriptItem.parentId, position: (direction === up) ? end : start }))

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

        if (e.key === 'Delete') {

            if (e.target.selectionStart === e.target.value.length) {

                const nextScriptItem = scriptItems.find(item => item.id === scriptItem.nextId)

                if (nextScriptItem) {
                    deleteScriptItem(nextScriptItem, scriptItems)
                    return
                }

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

    const handlePartIdChange = (partIds) => {

        log(debug,'PArtIdChange',partIds)

            let scene = [...scriptItems].find(item => item.type === 'Scene') || {}

            scene.partIds = partIds

            const preparedUpdate = prepareUpdate(scene)

            dispatch(addUpdates(preparedUpdate, 'ScriptItem'))
    }

    const handleChange = (type, id, value) => {

        if (type === 'partIds') {
            let update = [...scriptItems].find(item => item.id === id)
            update.partIds = value

            update = prepareUpdate(update)

            dispatch(addUpdates(update, 'ScriptItem')) //part Updates are confirmed in part editor so unlike other updates this automatically updates the store.
        }


    }


    const currentScene = scriptItems.find(item => item.type === 'Scene') || {} //returns the synopsis scriptItem
    const synopsis = scriptItems.find(item => item.type === 'Synopsis') || {} //returns the synopsis scriptItem
    const staging = scriptItems.find(item => item.type === 'InitialStaging') || {}//returns the staging scriptItem')

    const body = [...scriptItems].filter(item => item.type !== 'Scene' && item.type !== 'Synopsis' && item.type !== 'InitialStaging') || []//returns the body scriptItems

    const scenePartIds = currentScene.partIds || []

    log(debugRenderProps, 'Scene scriptItems', scriptItems)
    log(debugRenderProps, 'Scene currentScene', currentScene)
    log(debugRenderProps, 'Scene synopsis', synopsis)
    log(debugRenderProps, 'Scene staging', staging)

    const getFocus = (id) => {
        if (id === focus?.id) {
            return focus
        }
        return null
    }


    //---------------------------------

    return (
        <>
            <Row className="scene-header draft-border">
                <Col>

 {
                    (currentScene) &&
                    <ScriptItem scriptItem={currentScene}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        focus={getFocus(currentScene.id)}
                    />

                }
                {synopsis &&
                        <ScriptItem scriptItem={synopsis}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            focus={getFocus(synopsis.id)}
                            nextFocus={{ id: scenePartIds[0], parentId: currentScene.id, position: start }}
                    />
                }
                <PartEditor
                        partIds={scenePartIds}
                        onChange={(partIds) => handlePartIdChange(partIds)}
                        previousFocus={{ id: synopsis.id, parentId: currentScene.id, position: end }} //override the default focus ids
                        nextFocus={{ id: staging.id, parentId: currentScene.id, position: start }}
                />

                {staging &&
                    <>
                        <h5>Initial Staging</h5>
                        <ScriptItem scriptItem={staging}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            focus={getFocus(staging.id)}
                            previousFocus={{ id: scenePartIds[scenePartIds.length - 1], parentId: currentScene.id, position: end }}
                       
                        />
                    </>

                }

                </Col>
            </Row>
               

            <div className="scene-body">
                {body.map((scriptItem,index) => {
                    return (
                        <ScriptItem key={scriptItem.id}
                            scriptItem={scriptItem}
                            scenePartIds={scenePartIds}
                            onKeyDown={handleKeyDown}
                            focus={getFocus(scriptItem.id)} 
                           
                        />
                    )
                })
                }
            </div>

        </>
    )
}

export default Scene;