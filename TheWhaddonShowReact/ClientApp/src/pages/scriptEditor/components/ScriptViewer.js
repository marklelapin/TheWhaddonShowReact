//React and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import { Container } from 'reactstrap';
import Scene from './Scene'

//utitilites

import { log } from 'helper';
import { addUpdates } from 'actions/localServer';
import { createHeaderScriptItems, newScriptItemsForSceneDelete } from '../scripts/scriptItem';
import { prepareUpdates } from 'dataAccess/localServerUtils';
import { moveFocusToId } from '../scripts/utility';

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';
import ScriptViewerHeader from './ScriptViewerHeader';
import { START, END } from '../scripts/utility';

function ScriptViewer(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch()

    //props
    const { scenes } = props;

    //Redux 
    const showComments = useSelector(state => state.scriptEditor.showComments)

    log(debug, 'ScriptViewer Rendering')




    const handleClick = (action, scene) => {

        let newUpdates = []
        let newFocusId = null
        let newFocusScenePosition = START
        let newFocusTextInputPosition = START

        switch (action) {
            case 'addNewScene':
                log(debug, 'UpdatingScenes ScriptViewer Add Scene', scene)
                const previousScene = scene
                const nextScene = scenes.find(scene => scene.id === previousScene.nextId)
                newUpdates = createHeaderScriptItems(previousScene,nextScene)
               
                break;
            case 'deleteScene':
                log(debug,'UpdateingScenes ScriptViewer Delete Scene', scene)
                const sceneToDelete = scene;
                newUpdates = newScriptItemsForSceneDelete(sceneToDelete, scenes)
                newFocusId = sceneToDelete.nextId || sceneToDelete.previousId
                break;
            default: 
        }
        log(debug,'UpdatingScenes ScriptViewer Updates', newUpdates)
        if (newUpdates) {
            const preparedUpdates = prepareUpdates(newUpdates)
            dispatch(addUpdates(preparedUpdates, 'ScriptItem'));
        }
        if (newFocusId) {
            handleMoveFocus(newFocusId, newFocusScenePosition, newFocusTextInputPosition)
        }
                    
    }


    const handleMoveFocus = (sceneId, scenePosition, itemPosition = null) => { //different to move focus in partEdior and SCriptItems - position relates to start and end of scene. (not start and end of individual item)

        const moveToScene = scenes.find(scene => scene.id === sceneId)

        const moveToId = (scenePosition === START) ? moveToScene.id : moveToScene.finalId

        const moveToPosition = itemPosition || (scenePosition === START) ? START : END

        moveFocusToId(moveToId, moveToPosition)

    }


        return (
            <>
                <ScriptViewerHeader />

                <div id="script-viewer" className="draft-border">

                    <div id="script-body" className="draft-border">
                        {(scenes && scenes.length > 0) && scenes.map(scene => {

                            if (scene.type === SHOW) {
                                return <h1 key={scene.id}>{scene.text}</h1>
                            }
                            else if (scene.type === ACT) {
                                return <h2 key={scene.id} >{scene.text}</h2>
                            }
                            else {
                                return <Scene key={scene.id} scene={scene} onClick={(action) => handleClick(action, scene)} />
                            }
                        }

                        )}


                    </div>
                    <div id="script-comment" className={`${(showComments) ? "show-comments" : ''} draft-border`}>

                    </div>
                </div>

            </>





        )
    }

    export default ScriptViewer;