//React and Redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateIsUndoInProgress } from '../../../actions/scriptEditor';


//Components
import ScriptItem from '../../../pages/scriptEditor/components/ScriptItem.js';
import PartEditor from '../../../pages/scriptEditor/components/PartEditor.js';
import CurtainBackground from './CurtainBackground.js';

//Utilities
import { getLatest } from '../../../dataAccess/localServerUtils';
import { sortLatestScriptItems } from '../scripts/scriptItem';


import { log } from '../../../helper'




//styling
import s from '../Script.module.scss'


//Constants

import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING } from '../../../dataAccess/scriptItemTypes';



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

    log(debug, 'Component:Scene sceneScriptItemHistory: ', { sceneScriptItemHistory })

    //Internal State
    const [scriptItems, setScriptItems] = useState([]); //
    const [loaded, setLoaded] = useState(false); //]

    const currentScene = { ...getLatest(currentSceneScriptItemHistory)[0], undoDateTime: undoDateTime, sceneNumber: sceneNumber }

    log(debug, 'Component:Scene currentScene', { currentScene, previousCurtainOpen })


    //useEffect Hooks
    useEffect(() => {

        let newScriptItems = sortLatestScriptItems(currentScene, [...sceneScriptItemHistory], undoDateTime)

        setScriptItems(newScriptItems)

    }, [undoDateTime, sceneScriptItemHistory, id]) //es-lint disable-line react-hooks/exhaustive-deps


  
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

    log(debugRenderProps, 'Component:Scene bodyScriptItems', body())
    log(debugRenderProps, 'Component:Scene scriptItems', scriptItems)
    log(debugRenderProps, 'Component:Scene currentScene', currentScene)
    log(debugRenderProps, 'Component:Scene synopsis', synopsis)
    log(debugRenderProps, 'Component:Scene staging', staging)

    //---------------------------------

    return (
        <div id={`scene-${currentScene.id}`} className={s[`scene-group`]} style={{ zIndex: zIndex }}>
            <div className={s[`scene-header`]}>

                {(currentScene) &&
                    <ScriptItem
                        id={currentScene.id}
                        created={currentScene.created}
                        key={currentScene.id}
                        sceneId={currentScene.id}
                        sceneNumber={currentScene.sceneNumber}
                        curtainOpen={previousCurtainOpen}
                        zIndex={totalItems}
                        previousFocusId={currentScene.previousId}
                        nextFocusId={synopsis.id}
                    />

                }
                {currentScene.type === SCENE && synopsis &&
                    <ScriptItem
                        id={synopsis.id}
                        created={synopsis.created}
                        key={synopsis.id}
                        sceneId={currentScene.id}
                        curtainOpen={previousCurtainOpen}
                        zIndex={totalItems - 1}
                        nextFocusId={currentScene.partIds[0]}
                    />
                }
                {(currentScene.type === SCENE) &&
                    <PartEditor
                        sceneId={currentScene.id}
                        curtainOpen={previousCurtainOpen}
                        zIndex={totalItems - 2}
                        previousFocusId={synopsis.id} //override the default focus ids
                        nextFocusId={staging.id}

                    />
                }
                {currentScene.type === SCENE && staging &&
                    <>
                    <ScriptItem
                        id={staging.id}
                        created={staging.created}
                        key={staging.id}
                        sceneId={currentScene.id}
                        curtainOpen={previousCurtainOpen}
                        zIndex={totalItems - 3}
                        previousFocusId={currentScene.partIds[currentScene.partIds.length - 1]}
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
                            key={scriptItem.id}
                            sceneId={currentScene.id}
                            curtainOpen={scriptItem.curtainOpen}
                            alignRight={scriptItem.alignRight}
                            zIndex={totalItems - index - 4}
                            nextFocusId={(scriptItem.nextId === null) ? currentScene.nextId : null}

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