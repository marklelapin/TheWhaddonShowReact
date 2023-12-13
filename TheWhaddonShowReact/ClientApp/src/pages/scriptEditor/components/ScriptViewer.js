//React and REdux
import React, { useEffect } from 'react';
import { useSelector,  useDispatch } from 'react-redux';

import { updateMaxScriptItemTextWidth } from '../../../actions/scriptEditor';

//Components
import Scene from './Scene'
import PersonSelector from './PersonSelector'
import ScriptViewerHeader from './ScriptViewerHeader';
//utitilites
import { log, SCRIPT_VIEWER as logType } from '../../../logging';

//Constants


import s from '../Script.module.scss'



function ScriptViewer(props) {
    
    //props
    const { show } = props;

    

    //Redux 
    const dispatch = useDispatch();

    const showComments = useSelector(state => state.scriptEditor.showComments)
    const showOrder = useSelector(state => state.scriptEditor.sceneOrders[show.id])
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const isPersonSelectorOpen = (personSelectorConfig !==null)


    log(logType, "Component:ScriptViewer showOrder", showOrder)


    useEffect(() => {

        let timeoutId;
        const handleScriptViewerResizeDebounce = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handleScriptViewerResize(), 1000);
        }

        handleScriptViewerResize()

        window.addEventListener('resize', handleScriptViewerResizeDebounce);

        return () => { window.removeEventListener('resize', handleScriptViewerResizeDebounce); }
    }, []);


    useEffect(() => {
        handleScriptViewerResize()
    },[showComments])

    const handleScriptViewerResize = () => {

        const scriptBody = document.getElementById('script-body')

        const scriptBodyWidth = (showComments === true) ? (scriptBody.offsetWidth - 310) : scriptBody.offsetWidth;
        const maxScriptItemTextWidth = scriptBodyWidth - 100
        log(logType,'hanldeScriptViewerResize', {scriptBodyWidth, showComments, maxScriptItemTextWidth})
        dispatch(updateMaxScriptItemTextWidth(maxScriptItemTextWidth))
    }


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