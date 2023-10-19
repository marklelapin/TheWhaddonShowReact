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
import { sortLatestScriptItems } from '../scripts/scriptItem';
import { addUpdates } from 'actions/localServer';
import { newScriptItemsForDelete, newScriptItemsForCreate, createHeaderScriptItems } from '../scripts/scriptItem';

import { getNextUndoDate, getNextRedoDate } from '../scripts/undo';
import { log } from 'helper'
import { moveFocusToId, removeFocusFromId } from '../scripts/utility';
import { changeFocus } from 'actions/navigation'
import { create } from 'lodash';

//Constants
import { HEADER_TYPES } from 'dataAccess/scriptItemTypes';
import { INITIAL_CURTAIN, DIALOGUE } from 'dataAccess/scriptItemTypes';
import { CURTAIN_TYPES } from 'dataAccess/scriptItemTypes';
import { UP, DOWN, START, END, ABOVE, BELOW, SCENE_END } from '../scripts/utility';


export const PART_IDS = 'partIds';


function Scene(props) {

    //utility constants
    const debug = true;
    const debugRenderProps = true;

    const dispatch = useDispatch()

    //props
    const { scene, onClick, previousSceneEndId } = props;

    log(debug, 'Scene Passed into Scene', scene)

    //Redux state
    const sceneScriptItemHistory = useSelector(state => state.scriptEditor.sceneScriptItemHistory[scene.id])
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scene.id])
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)


    log(debug, 'EventsCheck Scene_sceneScriptItemHistory ', sceneScriptItemHistory)

    //Internal State
    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time
    //const [scriptItems, setScriptItems] = useState([]); //
   




    const scriptItems = sortLatestScriptItems(scene, [...sceneScriptItemHistory], undoDateTime)
    log(debug, 'EventsCheck Scene_scriptItems ', scriptItems)


  



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
        log(debug, `EventsCheck: handleClick: ${action},${scriptItem.id}`)
        switch (action) {
            case 'delete': handleChange('deleteScriptItem', DOWN, scriptItem); break;
            case 'undo': handleUndo(); break;
            case 'redo': handleRedo(); break;
            case 'setUndo': handleSetUndo(); break;
            case 'cancelUndo': setUndoDateTime(null); break;
            case 'deleteScene': onClick('deleteScene'); break;
            default: return;
        }
    }

    const handleChange = (type, value, scriptItem) => {

        log(debug, `EventsCheck: handleChange: ${type} , ${value}, ${scriptItem.id}, ${scriptItem.created}`)

        const scriptItemToUpdate = [...scriptItems].find(item => item.id === scriptItem.id)

        let newUpdates = []
        //sets default next focus and position - they get overridden in switch statements if necessary
        let newFocusId = scriptItemToUpdate;
        let newFocusPosition = END;

        const addScriptItem = (direction,scriptItemToUpdate) => {

            const tempTextValue = value;

            let scriptItemToUpdateWithText = { ...scriptItemToUpdate }

            if (tempTextValue) {
                scriptItemToUpdateWithText.text = tempTextValue;
                newUpdates = prepareUpdate(scriptItemToUpdateWithText);
            }

            let createUpdates = prepareUpdates(newScriptItemsForCreate(direction, scriptItemToUpdateWithText, [...scriptItems], DIALOGUE), 1)

            newUpdates = [...newUpdates, ...createUpdates]
            newFocusId = null //left for new ScriptItem to focus on itself when created.

        }

        const deleteScriptItem = (scriptItem) => {
            const direction = value || DOWN;
            const scriptItemToDelete = scriptItem;

            if (HEADER_TYPES.includes(scriptItemToDelete.type)) {
                alert('You cannot delete a header item.')
                return;
            }
            log(debug, 'EventsCheck: deleteScriptItem', scriptItemToDelete)
            newUpdates = prepareUpdates(newScriptItemsForDelete(scriptItemToDelete, [...scriptItems]))

            if (direction === DOWN) {
                newFocusId = scriptItemToDelete.nextId || scriptItemToDelete.previousId
                newFocusPosition = (scriptItemToDelete.nextId) ? START : END
            } else {
                newFocusId = scriptItemToDelete.previousId;
                newFocusPosition = END;
            }
        }

        switch (type) {
            case 'text':
                log(debug, `EventsCheck handleChange text: ${value}`)
                newUpdates = prepareUpdate({ ...scriptItemToUpdate, text: value }); break;
            case PART_IDS: newUpdates = prepareUpdate({ ...scriptItemToUpdate, partIds: value }); break;
            case 'tags': newUpdates = prepareUpdate({ ...scriptItemToUpdate, tags: value }); break;
            case 'type':
                let draft = prepareUpdate({ ...scriptItemToUpdate, type: value })

                if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type
                    draft.tags = getOpenCurtainTags(draft)
                    draft.text = newCurtainText(true, scriptItemToUpdate)
                } else if (CURTAIN_TYPES.includes(scriptItemToUpdate.type)) { //i.e. its coming from a curtain type
                    draft.text = "";
                }
                break;

            case 'toggleCurtain':
                const open = value
                const newTags = (open) ? getOpenCurtainTags(scriptItem) : getCloseCurtainTags(scriptItem)
                const newText = newCurtainText(open, scriptItem)
                newUpdates = prepareUpdate({
                    ...scriptItemToUpdate
                    , tags: newTags
                    , text: newText
                    , changed: true
                })
                break;

            case 'addScriptItemBelow':
                addScriptItem(BELOW, scriptItemToUpdate)
                break;
            case 'addScriptItemAbove':
                addScriptItem(ABOVE, scriptItemToUpdate)
                break;
            case 'deleteScriptItem':
                deleteScriptItem(scriptItemToUpdate)
                break;
            case 'deleteNextScriptItem':
                const nextScriptItem = [...scriptItems].find(item => item.id === scriptItemToUpdate.nextId)
                if (nextScriptItem) {
                    deleteScriptItem(nextScriptItem)
                }
                break;
            default: return;
        }
        log(debug, `EventsCheck: newUpdates count ${newUpdates.length}`)
        log(debug, `EVentsCheck: new Updates: + ${JSON.stringify(newUpdates)}`)

        dispatch(addUpdates(newUpdates, 'ScriptItem'));

        if (newFocusId) {
            moveFocusToId(newFocusId, newFocusPosition);
        }

        return





    }


    const newCurtainText = (open, scriptItem) => {

        const previousCurtainOpen = scriptItem.previousCurtainOpen

        if (open) { // curtain is opening
            if (previousCurtainOpen === true) return 'Curtain remains open'
            else return 'Curtain opens'
        } else { //curtain is closing
            if (previousCurtainOpen === false) return 'Curtain remains closed'
            else return 'Curtain closes'
        }
    }

    const getOpenCurtainTags = (scriptItem) => {
        const tags = scriptItem.tags

        let newTags = tags.filter(tag => tag !== 'CloseCurtain')
        newTags.push('OpenCurtain')

        return newTags;
    }

    const getCloseCurtainTags = (scriptItem) => {
        const tags = scriptItem.tags;

        let newTags = tags.filter(tag => tag !== 'OpenCurtain')
        newTags.push('CloseCurtain')

        return newTags;
    }


    const handleMoveFocus = (direction, position, scriptItem, previousFocusOverrideId = null, nextFocusOverrideId = null) => {
        const newId = (direction === DOWN) ? nextFocusOverrideId || scriptItem.nextId : previousFocusOverrideId || scriptItem.previousId
        let newPosition = position || END

        if (newId) {
            moveFocusToId(newId, newPosition)
        }

    }


 



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
        <div id={`scene-${currentScene.id}`}>
            <div className={`scene-header ${(scene.curtainOpen) ? 'curtain-open' : 'curtain-closed'} draft-border`}>
                {
                    (currentScene) &&
                    <ScriptItem scriptItem={currentScene}
                        onClick={(action) => handleClick(action, currentScene)}
                        onChange={(type, value) => handleChange(type, value, currentScene)}
                        moveFocus={(direction, position) => handleMoveFocus(direction, (direction===UP) ? SCENE_END : position, currentScene, currentScene.previousId, synopsis.id)}
                    />

                }
                {synopsis &&
                    <ScriptItem scriptItem={synopsis}
                        onClick={(action) => handleClick(action, synopsis)}
                        onChange={(type, value) => handleChange(type, value, synopsis)}
                        moveFocus={(direction, position) => handleMoveFocus(direction, position, synopsis, null, currentScene.partIds[0])}
                    />
                }
                <PartEditor
                    scene={currentScene}
                    onChange={(type,value) => handleChange(type,value,currentScene)}
                    previousFocus={{ id: synopsis.id, parentId: currentScene.id, position: END }} //override the default focus ids
                    nextFocus={{ id: staging.id, parentId: currentScene.id, position: START }}
                />

                {staging &&
                    <>
                        <ScriptItem
                            scriptItem={staging}
                            onClick={(action) => handleClick(action, staging)}
                            onChange={(type, value) => handleChange(type, value, staging)}
                            moveFocus={(direction, position) => handleMoveFocus(direction, position, staging, currentScene.partIds[currentScene.partIds.length - 1], null)}
                        />
                    </>

                }

            </div>


            <div className="scene-body">
                {body().map((scriptItem, index) => {
                    return (
                        <ScriptItem
                            onClick={(action) => handleClick(action, scriptItem)}
                            onChange={(type, value) => handleChange(type, value, scriptItem)}
                            key={scriptItem.id}
                            scriptItem={scriptItem}
                            scene={currentScene}
                            alignRight={scriptItem.alignRight}
                            moveFocus={(direction, position) => handleMoveFocus(direction, position, scriptItem, null, (scriptItem.nextId===null) ? currentScene.nextId : null)}

                        />
                    )
                })
                }
            </div>

            <div className={`scene-footer ${currentScene.finalCurtain ? 'curtain-open' : 'curtain-closed'}`}>
                <div className="add-new-scene clickable" onClick={() => onClick('addNewScene')}>
                    (add new scene)
                </div>
            </div>
        </div>
    )
}

export default Scene;