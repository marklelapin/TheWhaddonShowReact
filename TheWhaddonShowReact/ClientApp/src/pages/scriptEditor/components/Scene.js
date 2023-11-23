//React and Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addUpdates } from '../../../actions/localServer';
import { updateIsUndoInProgress } from '../../../actions/scriptEditor';


//Components
import ScriptItem from '../../../pages/scriptEditor/components/ScriptItem.js';
import PartEditor from '../../../pages/scriptEditor/components/PartEditor.js';
import CurtainBackground from './CurtainBackground.js';

//Utilities
import { prepareUpdates, prepareUpdate, getLatest } from '../../../dataAccess/localServerUtils';
import { sortLatestScriptItems } from '../scripts/scriptItem';

import { newScriptItemsForDelete, newScriptItemsForCreate } from '../scripts/scriptItem';

import { getNextUndoDate, getNextRedoDate } from '../scripts/undo';
import { log } from '../../../helper'
import { moveFocusToId } from '../scripts/utility';



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

    const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)

    log(debug, 'SceneRedux ', { sceneScriptItemHistory, currentSceneScriptItemHistory })

    //Internal State
    const [scriptItems, setScriptItems] = useState([]); //
    const [loaded, setLoaded] = useState(false); //]

    const currentScene = { ...getLatest(currentSceneScriptItemHistory)[0], undoDateTime: undoDateTime, sceneNumber: sceneNumber }

    log(debug, 'Scene_currentScene', { currentScene, previousCurtainOpen })


    //useEffect Hooks
    useEffect(() => {

        dispatch(updateIsUndoInProgress(undoDateTime !== null))

        let newScriptItems = sortLatestScriptItems(currentScene, [...sceneScriptItemHistory], undoDateTime)

        setScriptItems(newScriptItems)

    }, [undoDateTime, sceneScriptItemHistory, id]) //es-lint disable-line react-hooks/exhaustive-deps



    //EVENT HANDLERS
    //--------------------------------------------------------------------------------------------------------

   

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

        const bodyScriptItems = [...scriptItems].filter(item => item.type !== SCENE && item.type !== SYNOPSIS && item.type !== INITIAL_STAGING && item.type !== ACT && item.type !== SHOW) || []//returns the body scriptItems

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
        <div id={`scene-${currentScene.id}`} className={s[`scene-group`]} style={{ zIndex: zIndex }}>
            <div className={s[`scene-header`]}>

                {(currentScene) &&
                    <ScriptItem
                        id={currentScene.id}
                        created={currentScene.created}
                        key={currentScene.id + currentScene.created}
                        sceneId={currentScene.id}
                        sceneNumber={currentScene.sceneNumber}
                        curtainOpen={previousCurtainOpen}
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
                        zIndex={totalItems - 1}
                        moveFocus={(direction, position) => handleMoveFocus(direction, position, synopsis, null, currentScene.partIds[0])}
                    />
                }
                {(currentScene.type === SCENE) &&
                    <PartEditor
                        scene={currentScene}
                        onChange={(type, value) => handleChange(type, value, currentScene)}
                        onClick={(action) => handleClick(action, currentScene)}
                        curtainOpen={previousCurtainOpen}
                        zIndex={totalItems - 2}
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
                            zIndex={totalItems - 3}
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
                            alignRight={scriptItem.alignRight}
                            zIndex={totalItems - index - 4}
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