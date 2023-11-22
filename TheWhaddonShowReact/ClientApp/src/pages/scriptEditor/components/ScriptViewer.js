//React and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import Scene from './Scene'

//utitilites

import { log } from '../../../helper';
import { addUpdates } from '../../../actions/localServer';
import { sortLatestScriptItems, addSceneNumbers, newScriptItemsForCreateHeader, newScriptItemsForSceneDelete } from '../scripts/scriptItem';
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
    const { show, onClick } = props;

    //Redux 
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const sceneHistory = useSelector(state => state.scriptEditor.sceneHistory)


    let scenes = (show) ? sortLatestScriptItems(show, sceneHistory) : []
    scenes = addSceneNumbers(scenes)

    log(debug, "ScriptViewer scenes", scenes)

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

    const totalItems = scenes.length;


    return (
        <div id="script-viewer" className="flex-full-height">
            <ScriptViewerHeader onClick={(action) => handleClick(action, null)} />

            <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']}`}>
                    <p className={`${s['comments-title']}`}>Comments</p>
                    {(scenes && scenes.length > 0) && scenes.map((scene,idx) => {

                        return <Scene key={scene.id}
                            id={scene.id}
                            sceneNumber={scene.sceneNumber}
                            onClick={(action) => handleClick(action, scene)}
                            zIndex={totalItems - idx }
                        />
                    }

                    )}
                    
                </div>

            </div>
        </div>





    )
}

export default ScriptViewer;