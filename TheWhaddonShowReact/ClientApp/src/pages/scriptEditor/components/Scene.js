import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index.js';
import { getLatest, prepareUpdates, useSortLatestScriptItems, sortLatestScriptItems, sortScriptItems, prepareUpdate } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import ScriptItem from 'pages/scriptEditor/components/ScriptItem.js';
import PartEditor from 'pages/scriptEditor/components/PartEditor.js';
import { ScriptItemUpdate } from 'dataAccess/localServerModels';
import s from 'pages/forms/elements/Elements.module.scss';
import { Input } from 'reactstrap';
import TextareaAutosize from 'react-autosize-textarea';
import BlurAndFocusListener from './BlurAndFocusListener';
import log from 'helper'
function Scene(props) {

    //utility constants
    const debug = false;
    const _ = require('lodash');
    const dispatch = useDispatch()
    const above = 'above'
const below = 'below'


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
    const [currentScriptItems, setCurrentScriptItems] = useState([]); //the current scriptItem being worked that hasn't yet been added to store.
    const [scriptItems, setScriptItems] = useState([]); //
    const [reachedEndScriptItem, setReachedEndScriptItem] = useState(null); //if reached the end of the script]
    const [revertToStore, setRevertToStore] = useState(null); //if reached the end of the script]


    useEffect(() => {
        const scriptItemsUpdate = sortLatestScriptItems(scene, [...storedScriptItems], undoDateTime)
        setScriptItems(scriptItemsUpdate)
    }, [])

    useEffect(() => {
        log(debug, 'useEffect - storedScriptItems')
        const scriptItemsUpdate = sortLatestScriptItems(scene, [...storedScriptItems], undoDateTime)
        setScriptItems(scriptItemsUpdate)

    }, [storedScriptItems, undoDateTime, revertToStore])




    useEffect(() => {

        const handleKeyDownAtEnd = (e) => {

            handleKeyDown(e, reachedEndScriptItem)
        }
        log(true, 'useEffect - reachedEndScriptItem', reachedEndScriptItem)

        if (reachedEndScriptItem !== null) {
            document.addEventListener('keydown', handleKeyDownAtEnd)

        } else {
            document.removeEventListener('keydown', handleKeyDownAtEnd)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDownAtEnd)
        }
    }, [reachedEndScriptItem])






    const createNewScriptItem = (placement, existingScriptItem, type = 'Dialogue') => {

        let scriptItemsUpdate = [...scriptItems]

        if (!existingScriptItem) throw new Error ('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

        let previousScriptItemUpdate = scriptItemsUpdate.find(item => item.id === existingScriptItem.previousId)

        let nextScriptItemUpdate = scriptItemsUpdate.find(item => item.id === existingScriptItem.nextId)

        let existingScriptItemUpdate = existingScriptItem

        let newScriptItem = new ScriptItemUpdate(type)
        newScriptItem.new = true

        if (placement === above) {

            newScriptItem.previousId = previousScriptItemUpdate.id
            newScriptItem.nextId = existingScriptItemUpdate.id

            previousScriptItemUpdate.nextId = newScriptItem.id

            existingScriptItemUpdate.previousId = newScriptItem.id

            previousScriptItemUpdate.changed = true
            existingScriptItemUpdate.changed = true
        }

        if (placement === below) {

            newScriptItem.previousId = existingScriptItemUpdate.id
            newScriptItem.nextId = nextScriptItemUpdate.id

            existingScriptItemUpdate.nextId = newScriptItem.id

            nextScriptItemUpdate.previousId = newScriptItem.id

            existingScriptItemUpdate.changed = true
            nextScriptItemUpdate.changed = true

        }


        scriptItemsUpdate = scriptItemsUpdate.map(item => {
            if (item.id === previousScriptItemUpdate.id) return previousScriptItemUpdate
            if (item.id === existingScriptItemUpdate.id) return existingScriptItemUpdate
            if (item.id === nextScriptItemUpdate.id) return nextScriptItemUpdate
            if (item.id === newScriptItem.id) return newScriptItem
            else return item
        })

        setScriptItems(scriptItemsUpdate)

        return newScriptItem

    }



    const deleteScriptItem = (scriptItem) => {

        let scriptItemUpdate = {...scriptItem}

        let scriptItemsUpdate = [...scriptItems]

        let previousScriptItemUpdate = scriptItemsUpdate.find(item => item.id === scriptItem.previousId)
        let nextScriptItemUpdate = scriptItemsUpdate.find(item => item.id === scriptItem.nextId)

        if (previousScriptItemUpdate) {
            previousScriptItemUpdate.nextId = nextScriptItemUpdate.id
            previousScriptItemUpdate.changed = true
        }

        if (nextScriptItemUpdate) {
            nextScriptItemUpdate.previousId = previousScriptItemUpdate.id
            nextScriptItemUpdate.changed = true
        }

        scriptItemUpdate.isActive = false


        scriptItemsUpdate = scriptItemsUpdate.map(item => {
            if (item.id === previousScriptItemUpdate.id) return previousScriptItemUpdate
            if (item.id === nextScriptItemUpdate.id) return nextScriptItemUpdate
            if (item.id === scriptItemUpdate.id) return scriptItemUpdate
            else return item
        })

        setScriptItems(scriptItemsUpdate)

    }










    //EVENT HANDLERS
    //--------------------------------------------------------------------------------------------------------

    const handleUndo = () => {

        const undoDate = undoDateTime || new Date();

        const dateArray = [...storedScriptItems, ...currentScriptItems].filter(item => item.created < undoDate).map(item => item.created)

        let latestDateBeforeUndo = dateArray[0]

        for (const date of dateArray) {
            if (date > latestDateBeforeUndo)
                latestDateBeforeUndo = date;
        }

        setUndoDateTime(latestDateBeforeUndo)

    }

    const handleRedo = () => {

        const dateArray = [...storedScriptItems, ...currentScriptItems].filter(item => item.created > undoDateTime).map(item => item.created)
        let earliestDateAfterRedo = dateArray[0]

        for (const date of dateArray) {
            if (date < earliestDateAfterRedo)
                earliestDateAfterRedo = date;
        }
        setUndoDateTime(earliestDateAfterRedo)
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
                const newScriptItemElement = document.getElementById(newId)
                if (newScriptItemElement) {
                    const newScriptItemTextInput = newScriptItemElement.querySelector('.text-input') || newScriptItemElement

                    if (newScriptItemTextInput) {

                        newScriptItemTextInput.focus();

                        if (direction === down) {
                            newScriptItemTextInput.selectionStart = 0
                            newScriptItemTextInput.selectionEnd = 0
                        } else {
                            newScriptItemTextInput.selectionStart = newScriptItemTextInput.value.length
                        }

                    } else { moveFocusError(direction, scriptItem.id, newId) }

                } else { console.log('Cant find previous element') } //TODO extend this when more scenes available 

            } else {
                if (direction === up) {
                    //do nothing as reached the top of the script
                } else {
                    //reached the bottom of the script
                    log(true,'reached the bottom of the script')
                    setReachedEndScriptItem(scriptItem)
                    e.target.blur()

                }
            }

        }

        const moveFocusError = (direction, id) => {
            throw new Error(`Cant locate the ${direction} scriptItem: ${id}`)
        }


        if (reachedEndScriptItem) {

            moveFocus(up, reachedEndScriptItem.id)
            setReachedEndScriptItem(null)
            return
        }



        if (e.shiftKey) { //create new chat bubble

            if (e.key === 'ArrowUp') {
                createNewScriptItem(up)
                //move focus
            }

            if (e.keyCode === 13 || e.key === 'ArrowDown') {
                //create new scriptItemBelow
                //move focus
            }

        } else if (e.ctrlKey) { //go to next chat bubble

            if (e.key === 'ArrowUp') {
                e.preventDefault()
                log(debug, 'handleKeyPress - ctrl + arrowUp')
                moveFocus(up)
            }
            if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === '/n') {
                e.preventDefault()
                moveFocus(down)
            }
        } else if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault()
            moveFocus(down)
        } else if (e.key === 'ArrowUp' && e.target.selectionEnd === 0) {
            moveFocus(up)
        } else if (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length) {
            moveFocus(down)
        } else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
            moveFocus(down)
        } else if (e.key === 'ArrowLeft' && e.target.selectionEnd === 0) {
            moveFocus(up)
        }
    }

    const handleFocus = (e) => {


    }

    const handleBlur = (e) => {
        log(debug, 'handleBlur')

        const scriptItem = findScriptItem(e.target)

        if (scriptItem) {
            log(debug, 'Sending update from blur:', scriptItem)
            updateIfChanged(scriptItem)
        }

    }



    const findScriptItem = (element) => {

        let currentElement = element;
        let scriptItemId = null;
        let scriptItem = null;

        //Search for scriptItem element and get its Id.
        while (currentElement && scriptItemId === null) {

            if (currentElement.classList.contains('script-item')) {

                scriptItemId = currentElement.id;
            }
            currentElement = currentElement.parentElement;
        }

        if (scriptItemId) {
            //using prevState in setState to ensure latest version of the scriptItems is used
            setScriptItems((prevScriptItems) => {

                (scriptItemId) ? scriptItem = prevScriptItems.find((item) => item.id === scriptItemId) : scriptItem = null;

                return prevScriptItems;
            })

            return scriptItem;

        } else {

            throw new Error('Couldnt locate scriptItem from element.')
        }

    }

    

    const updateIfChanged = () => {
        log(debug, 'updating in Scene.js')

        let scriptItemsToUpdate = []

        //use previous state in setState to ensure latest version of the scriptItems is used
            setScriptItems((prevStoredScriptItems) => {
                scriptItemsToUpdate = [...prevStoredScriptItems].filter(item=>item.new || item.changed)
                return prevStoredScriptItems
            })

        const newScriptItem = scriptItemsToUpdate.find(item => item.new)

        //special case for new scriptItem that hasnt been changed to avoid creation of lots of empty created scriptItems
        if (newScriptItem && !newScriptItem.changed) {

            setRevertToStore(Math.Random())
            return

        }
        ///NEEDD TO THINK THROUGH THIS BIT - AM I GOING TO GET A LOOP IF DELETE SCRIPT ITEMS CHANGES SCRIPTITMES.


        //delete the scriptItems if they contain no text.
        scriptItemsToUpdate.forEach(item => {

            if (item.text === '' || item.text === null) {

                deleteScriptItem(item)
            }

        })

        const preparedUpdates = prepareUpdates(scriptItemsToUpdate)

        dispatch(addUpdates(preparedUpdates, 'ScriptItem'))
            
    }

    const handleSceneHeaderChange = (type, id, value) => {

        if (type === 'partIds') {
            let update = [...scriptItems].find(item => item.id === id)
            update.partIds = value

            update = prepareUpdate(update)

            dispatch(addUpdates(update)) //part Updates are confirmed in part editor so unlike other updates this automatically updates the store.
        }
        if (type === 'Scene' || type === 'Synopsis' || type === 'Staging') {
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

    log(debug, 'scriptItems', scriptItems)
    log(debug, 'storedSCriptItems', storedScriptItems)

    //---------------------------------

    return (

        <BlurAndFocusListener onBlur={handleBlur} onFocus={handleFocus} >

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
                        onChange={(e) => handleSceneHeaderChange('Scene', currentScene.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, currentScene)} />

                }
                {synopsis &&
                    <TextareaAutosize
                        id={synopsis.id}
                        key={synopsis.id}
                        placeholder="..."
                        className={`form-control ${s.autogrow} transition-height scene-synopsis script-item text-input`}
                        value={synopsis.text || ''}
                        onChange={(e) => handleSceneHeaderChange('Synopsis', synopsis.id, e.target.value)}
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
                        onChange={(e) => handleSceneHeaderChange('Staging', staging.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, staging)}
                    />
                }
                <PartEditor partIds={scene.partIds} onChange={(partIds) => handleSceneHeaderChange('partIds', partIds)} />
            </div>

            <div className="scene-body">
                {body.map((scriptItem) => {
                    return (
                        <ScriptItem id={scriptItem.id} key={scriptItem.id} scriptItem={scriptItem} parts={currentScene.partIds} onKeyDown={(e) => handleKeyDown(e, scriptItem)} className="script-item" />
                    )
                })
                }
            </div>
        </BlurAndFocusListener>
    )
}

export default Scene;