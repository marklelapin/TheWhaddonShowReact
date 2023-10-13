//React and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import { Container } from 'reactstrap';
import Scene from './Scene'

//utitilites

import { log } from 'helper';
import { addUpdates } from 'actions/localServer';
import { createHeaderScriptItems } from '../scripts/crudScripts';
import { prepareUpdates } from 'dataAccess/localServerUtils';

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';
import ScriptViewerHeader from './ScriptViewerHeader';


function ScriptViewer(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch()

    //props
    const { scenes } = props;

    //Redux 
    const showComments = useSelector(state => state.scriptEditor.showComments)

    log(debug, 'ScriptViewer Rendering')



    const handleClick = (action, value) => {

        switch (action) {
            case 'addNewScene':
                const previousScene = value
                const nextScene = scenes.find(scene => scene.id === previousScene.nextId)

                const newHeaderScriptItems = createHeaderScriptItems(previousScene,nextScene)
                const preparedUpdates = prepareUpdates(newHeaderScriptItems)

                dispatch(addUpdates(preparedUpdates, 'ScriptItem'));
                break;
                default: 
        }
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
                                return <Scene key={scene.id} scene={scene} onClick={(action, value) => handleClick(action, value)} />
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