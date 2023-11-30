//React and REdux
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import Scene from './Scene'
import PersonSelector from './PersonSelector'

//utitilites

import { log } from '../../../helper';

//Constants
import ScriptViewerHeader from './ScriptViewerHeader';

import s from '../Script.module.scss'
function ScriptViewer(props) {

    //utility consts
    const debug = true;

    //props
    const { show } = props;

    //Redux 
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const isPersonSelectorOpen = (personSelectorConfig !==null)


    log(debug, "Component:ScriptViewer showOrder", showOrder)


    return (
        <>
            <div id="script-viewer" className="flex-full-height" style={{ zIndex: 1 }}>
                <ScriptViewerHeader />

                <div id="script-viewer-main" className={`${s['script-viewer-main']} full-height-overflow`}>
                    <div id="script-body" className={`${s['script-body']} ${(showComments) ? s['show-comments'] : s['hide-comments']}`}>
                        <p className={`${s['comments-title']}`}>Comments</p>
                        {(showOrder && showOrder.length > 0) &&
                            showOrder.map((scene) => {

                            return <Scene key={scene.id}
                                id={scene.id}
                                sceneNumber={scene.sceneNumber}
                                zIndex={scene.zIndex}
                            />
                        }

                        )}

                    </div>

                </div>
            </div>

            {(isPersonSelectorOpen) &&
                  <PersonSelector viewAs />
            }

        </>


    )
}

export default ScriptViewer;