﻿//React and Redux
import React from 'react';
import { useState, useEffect,useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';


//Components
import ScriptItem from '../../../pages/scriptEditor/components/ScriptItem.js';
import PartEditor from '../../../pages/scriptEditor/components/PartEditor.js';
import CurtainBackground from './CurtainBackground.js';

//Utilities
import { prepareUpdates, prepareUpdate, getLatest } from '../../../dataAccess/localServerUtils';
import { sortLatestScriptItems } from '../scripts/scriptItem';
import { addUpdates } from '../../../actions/localServer';
import { newScriptItemsForDelete, newScriptItemsForCreate } from '../scripts/scriptItem';
import { ScriptItemUpdate } from '../../../dataAccess/localServerModels';

import { getNextUndoDate, getNextRedoDate } from '../scripts/undo';
import { log } from '../../../helper'
import { moveFocusToId } from '../scripts/utility';

import {
    updateShowComments,
} from '../../../actions/scriptEditor';

//styling
import s from '../Script.module.scss'


//Constants
import { HEADER_TYPES } from '../../../dataAccess/scriptItemTypes';
import { DIALOGUE, COMMENT } from '../../../dataAccess/scriptItemTypes';
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, CURTAIN_TYPES } from '../../../dataAccess/scriptItemTypes';
import { UP, DOWN, START, END, ABOVE, BELOW, SCENE_END } from '../scripts/utility';


export const PART_IDS = 'partIds';
export const PARTS = 'parts';
export const ADD_COMMENT = 'addComment';
export const DELETE_COMMENT = 'deleteComment';

function Scene(props) {

    //utility constants
    const debug = true;
    const debugRenderProps = true;

    const dispatch = useDispatch()

    //props
    const { id, sceneNumber, onClick, zIndex } = props;



    //Redux state
    const sceneScriptItemHistory = useSelector(state => state.scriptEditor.sceneScriptItemHistory[id])
    const currentSceneScriptItemHistory = useSelector(state => state.scriptEditor.scriptItemHistory[id])
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[id])
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const previousCurtainOpen = useSelector(state => state.scriptEditor.previousCurtain[id])

    log(debug, 'SceneRedux ', { sceneScriptItemHistory, currentSceneScriptItemHistory })

    //Internal State
    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time
    const [scriptItems, setScriptItems] = useState([]); //
    const [loaded, setLoaded] = useState(false); //]

    const currentScene = { ...getLatest(currentSceneScriptItemHistory)[0], undoDateTime: undoDateTime, sceneNumber: sceneNumber }

    log(debug, 'Scene_currentScene', { currentScene, previousCurtainOpen })


    //useEffect Hooks
    useEffect(() => {

        let newScriptItems = sortLatestScriptItems(currentScene, [...sceneScriptItemHistory], undoDateTime)

        setScriptItems(newScriptItems)

    }, [undoDateTime, sceneScriptItemHistory, id])



    //EVENT HANDLERS
    //--------------------------------------------------------------------------------------------------------

    const handleUndo = () => {

        const nextUndoDate = getNextUndoDate([...sceneScriptItemHistory], undoDateTime)

        setUndoDateTime(nextUndoDate)

    }

    const handleRedo = () => {

        const nextUndoDate = getNextRedoDate([...sceneScriptItemHistory], undoDateTime)

        setUndoDateTime(nextUndoDate)

    }

    const handleConfirmUndo = () => {

        //process changed scriptItems
        if (undoDateTime === null) return;

        const idsToUpdate = new Set([...sceneScriptItemHistory].filter(item => new Date(item.created) >= undoDateTime).map(item => item.id))

        //convert to array
        const arrayIds = [...idsToUpdate];

        //filter the scriptItems matching the ids
        const changeScriptItems = scriptItems.filter((item) => arrayIds.includes(item.id));
        const changeScriptItemIds = changeScriptItems.map(item => item.id)

        const deleteScriptItemIds = arrayIds.filter(id => !changeScriptItemIds.includes(id))

        let deleteScriptItems = getLatest([...sceneScriptItemHistory].filter(item => deleteScriptItemIds.includes(item.id)))

        deleteScriptItems = deleteScriptItems.map(item => ({ ...item, isActive: false }))


        //update these scriptItems
        const updates = prepareUpdates([...changeScriptItems, ...deleteScriptItems]);

        dispatch(addUpdates(updates, 'ScriptItem'));

        setUndoDateTime(null)

    }

    const handleClick = (action, scriptItem) => {

        if (['undo', 'redo', 'confirmUndo'].includes(action) === false && undoDateTime !== null) {
            handleConfirmUndo();
        }


        log(debug, `EventsCheck: handleClick: ${action},${scriptItem.id}`)
        switch (action) {
            case 'delete': handleChange('deleteScriptItem', DOWN, scriptItem); break;
            case 'undo': handleUndo(); break;
            case 'redo': handleRedo(); break;
            case 'confirmUndo': handleConfirmUndo(); break;
            case 'deleteScene': onClick('deleteScene', null); break;
            case 'goToComment':
                dispatch(updateShowComments(true))
                moveFocusToId(scriptItem.comment?.id)
                    ; break;

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

        const addScriptItem = (direction, scriptItemToUpdate) => {

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
           
            case PARTS:
                const oldPartId = value.oldPartId
                const newPartId = value.newPartId

                log(debug, 'changeParts handleChange PARTS:', { oldPartId: oldPartId, newPartId: newPartId })
                newUpdates = prepareUpdates( //replaces all oldPartIds with newPartIds
                    [...scriptItems].map(item => ({ ...item, partIds: [...item.partIds].map(partId => (partId === oldPartId) ? newPartId : partId) }))
                )
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
            case ADD_COMMENT:
                let newComment = new ScriptItemUpdate(COMMENT)
                newComment.parentId = currentScene.id
                newComment.previousId = scriptItemToUpdate.id
                let newScriptItem = { ...scriptItemToUpdate, commentId: newComment.id }
                newUpdates = prepareUpdates([newComment, newScriptItem])
                dispatch(updateShowComments(true))
                break;

            case DELETE_COMMENT:
                newUpdates = prepareUpdate({ ...scriptItemToUpdate, commentId: null })
                break;

            default: return;
        }
        log(debug, `Component:Scene handleChange: ${type}. dispatch:`, { count: newUpdates.length, newUpdates })

        dispatch(addUpdates(newUpdates, 'ScriptItem'));

        if (newFocusId) {
            moveFocusToId(newFocusId, newFocusPosition);
        }

        return





    }


    






    const handleMoveFocus = (direction, position, scriptItem, previousFocusOverrideId = null, nextFocusOverrideId = null) => {
        const newId = (direction === DOWN) ? nextFocusOverrideId || scriptItem.nextId : previousFocusOverrideId || scriptItem.previousId
        let newPosition = position || END
        log(debug, 'Component:Scene handleMoveFocus input:', { direction, position, scriptItem, previousFocusOverrideId, nextFocusOverrideId })
        log(debug, 'Component:Scene handleMoveFocus output:', { newId, newPosition })
        if (newId) {
            moveFocusToId(newId, newPosition)
        }

    }






    const synopsis = { ...scriptItems.find(item => item.type === SYNOPSIS), curtainOpen: previousCurtainOpen } || {}
    const staging = { ...scriptItems.find(item => item.type === INITIAL_STAGING), curtainOpen: previousCurtainOpen } || {}

    const body = () => {

        const bodyScriptItems = [...scriptItems].filter(item => item.type !== SCENE && item.type !== SYNOPSIS && item.type !== INITIAL_STAGING && item.type !== ACT && item.type !==SHOW) || []//returns the body scriptItems

        //work out alignment
        const partIdsOrder = [...new Set(bodyScriptItems.map(item => item.partIds[0]))]

        const defaultRighthandPartId = partIdsOrder[1] //defaults the second part to come up as the default right hand part.

        const righthandPartId = scenePartPersons?.partPersons?.find(partPerson => partPerson.id === viewAsPartPerson?.id || partPerson.personId === viewAsPartPerson?.id)?.id || defaultRighthandPartId

        const alignedScriptItems = bodyScriptItems.map(item => ({ ...item, alignRight: item.partIds.includes(righthandPartId) }))

        return alignedScriptItems
    }

    const finalScriptItem = scriptItems[scriptItems.length - 1] || {}

    const totalItems = scriptItems.length + 2 //+1 for the partEditor and scene-footer

    log(debugRenderProps, 'Scene bodyScriptItems', body())
    log(debugRenderProps, 'Scene scriptItems', scriptItems)
    log(debugRenderProps, 'Scene currentScene', currentScene)
    log(debugRenderProps, 'Scene synopsis', synopsis)
    log(debugRenderProps, 'Scene staging', staging)

    log(debugRenderProps, 'ScenePreviousCurtainOpen', previousCurtainOpen)

    //---------------------------------

    return (
        <div id={`scene-${currentScene.id}`} className={s[`scene-group`]} style={{zIndex:zIndex} }>
             <div className={s[`scene-header`]}>

            {(currentScene) &&
                <ScriptItem
                    id={currentScene.id}
                    created={currentScene.created}
                    key={currentScene.id + currentScene.created}
                    sceneId={currentScene.id}
                    sceneNumber={currentScene.sceneNumber}
                    curtainOpen={previousCurtainOpen}
                    onClick={(action) => handleClick(action, currentScene)}
                    onChange={(type, value) => handleChange(type, value, currentScene)}
                    undoDateTime={undoDateTime}
                    zIndex={totalItems}
                    moveFocus={(direction, position) => handleMoveFocus(direction, (direction === UP) ? SCENE_END : position, currentScene, currentScene.previousId, synopsis.id)}
                />

            }
            {currentScene.type === SCENE && synopsis &&
                <ScriptItem
                    id={synopsis.id}
                    created={synopsis.created}
                    key={synopsis.id + synopsis.created}
                    sceneId={currentScene.id}
                    curtainOpen={previousCurtainOpen}
                    onClick={(action) => handleClick(action, synopsis)}
                    onChange={(type, value) => handleChange(type, value, synopsis)}
                    undoDateTime={undoDateTime}
                    zIndex={totalItems-1}
                    moveFocus={(direction, position) => handleMoveFocus(direction, position, synopsis, null, currentScene.partIds[0])}
                />
            }
            {(currentScene.type === SCENE) &&
                <PartEditor
                    scene={currentScene}
                    onChange={(type, value) => handleChange(type, value, currentScene)}
                    onClick={(action) => handleClick(action, currentScene)}
                    undoDateTime={undoDateTime}
                    curtainOpen={previousCurtainOpen}
                    zIndex={totalItems-2}
                    previousFocus={{ id: synopsis.id, parentId: currentScene.id, position: END }} //override the default focus ids
                    nextFocus={{ id: staging.id, parentId: currentScene.id, position: START }}

                />
            }
            {currentScene.type === SCENE && staging &&
                <>
                    <ScriptItem
                        id={staging.id}
                        created={staging.created}
                        key={staging.id + staging.created}
                        sceneId={currentScene.id}
                        curtainOpen={previousCurtainOpen}
                        onClick={(action) => handleClick(action, staging)}
                        onChange={(type, value) => handleChange(type, value, staging)}
                        undoDateTime={undoDateTime}
                        zIndex={totalItems-3}
                        moveFocus={(direction, position) => handleMoveFocus(direction, position, staging, currentScene.partIds[currentScene.partIds.length - 1], null)}
                    />
                </>

            }

            </div>


            <div className={s['scene-body']}>
                {body().map((scriptItem, index) => {
                    return (
                        <ScriptItem
                            id={scriptItem.id}
                            created={scriptItem.created}
                            key={scriptItem.id + scriptItem.created}
                            sceneId={currentScene.id}
                            curtainOpen={scriptItem.curtainOpen}
                            onClick={(action) => handleClick(action, scriptItem)}
                            onChange={(type, value) => handleChange(type, value, scriptItem)}
                            alignRight={scriptItem.alignRight}
                            undoDateTime={undoDateTime}
                            zIndex={totalItems-index-4}
                            moveFocus={(direction, position) => handleMoveFocus(direction, position, scriptItem, null, (scriptItem.nextId === null) ? currentScene.nextId : null)}

                        />
                    )
                })
                }
            </div>

            <div id={`scene-footer-${currentScene.id}`}
                className={`${s['scene-footer']} ${finalScriptItem.curtainOpen ? s['curtain-open'] : s['curtain-closed']}`}
                style={{ zIndex: 0 }}>
               
                <div className={`${s['add-new-scene']} clickable`} onClick={() => onClick('addNewScene')}>
                    (add new scene)
                </div>
                <CurtainBackground curtainOpen={finalScriptItem.curtainOpen} />
            </div>

        </div>

    )
}

export default Scene;