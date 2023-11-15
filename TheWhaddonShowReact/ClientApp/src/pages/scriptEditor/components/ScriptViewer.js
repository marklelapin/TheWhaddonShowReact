//React and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import Scene from './Scene'

//utitilites

import { log } from '../../../helper';
import { addUpdates } from '../../../actions/localServer';
import { newScriptItemsForCreateHeader, newScriptItemsForSceneDelete } from '../scripts/scriptItem';
import { prepareUpdates } from '../../../dataAccess/localServerUtils';
import { moveFocusToId } from '../scripts/utility';

//Constants
import { SHOW, ACT } from '../../../dataAccess/scriptItemTypes';
import ScriptViewerHeader from './ScriptViewerHeader';
import { START } from '../scripts/utility';

import s from '../Script.module.scss'
function ScriptViewer(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch()

    //props
    const { scenes, onClick } = props;

    //Redux 
    const showComments = useSelector(state => state.scriptEditor.showComments)

    log(debug, 'ScriptViewer Rendering')




    const handleClick = (action, scene) => {

        let newUpdates = []
        let newFocusId = null
        let newFocusPosition = START

        switch (action) {
            case 'addNewScene':
                log(debug, 'UpdatingScenes ScriptViewer Add Scene', scene)
                const previousScene = scene
                const nextScene = scenes.find(scene => scene.id === previousScene.nextId)
                newUpdates = newScriptItemsForCreateHeader(previousScene, nextScene)
                newFocusId = newUpdates[0].id
                break;
            case 'deleteScene':
                log(debug, 'UpdateingScenes ScriptViewer Delete Scene', scene)
                const sceneToDelete = scene;
                newUpdates = newScriptItemsForSceneDelete(sceneToDelete, scenes)
                newFocusId = sceneToDelete.nextId || sceneToDelete.previousId
                break;
            case 'clearScript':
                onClick('clearScript')
                break;
            default: return;
        }
        log(debug, 'UpdatingScenes ScriptViewer Updates', newUpdates)
        if (newUpdates) {
            const preparedUpdates = prepareUpdates(newUpdates)
            dispatch(addUpdates(preparedUpdates, 'ScriptItem'));
        }
        if (newFocusId) {
            moveFocusToId(newFocusId, newFocusPosition)
        }

    }



    return (
        <div id="script-viewer" className="flex-full-height">
            <ScriptViewerHeader onClick={(action) => handleClick(action, null)} />

            <div id="script-viewer-main" className={`full-height-overflow`}>
                <div id="script-body" className={`${(showComments) ? 'show-comments' : 'hide-comments'}`}>
                    {(scenes && scenes.length > 0) && scenes.map(scene => {

                        if (scene.type === SHOW) {
                            return <h1 key={scene.id}>{scene.text}</h1>
                        }
                        else {
                            return <Scene key={scene.id} scene={scene} onClick={(action) => handleClick(action, scene)} />
                        }
                    }

                    )}
                </div>
            </div>
        </div>





    )
}

export default ScriptViewer;