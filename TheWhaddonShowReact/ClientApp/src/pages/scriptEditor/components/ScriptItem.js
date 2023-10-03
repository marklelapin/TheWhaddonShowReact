import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Dialogue from './Dialogue';
import { log } from 'helper';
import { addUpdates } from 'actions/localServer';
import { prepareUpdate } from 'dataAccess/localServerUtils';
import { moveFocusToId } from '../scripts/utilityScripts';
import { changeFocus } from 'actions/navigation';
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN } from 'dataAccess/scriptItemTypes';
import SceneHeader from './SceneHeader';
import Synopsis from './Synopsis';
import Staging from './Staging';

function ScriptItem(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch()


    // get specific props
    const { scriptItem: storedScriptItem, alignRight = false, scenePartIds, onKeyDown, focus, previousFocusId = null, nextFocusId = null } = props;

    const [scriptItem, setScriptItem] = useState({})


    useEffect(() => {
        setScriptItem(storedScriptItem)
    }, [storedScriptItem])

    useEffect(() => {
        if (focus) {
            moveFocusToId(storedScriptItem.id, focus.position)
            dispatch(changeFocus(null))
        }
    }, [focus])



    //changes are registered internally until onBlur is called
    const handleChange = (type, value) => {

        switch (type) {
            case 'text': setScriptItem({ ...scriptItem, text: value, changed: true }); break;
            case 'partIds': setScriptItem({ ...scriptItem, partIds: value, changed: true }); break;
            case 'tags': setScriptItem({ ...scriptItem, tags: value, changed: true }); break;
            default: return;
        }

    }

    //Saves to Redux store when focus is taken off the scriptItem
    const handleBlur = () => {

        if (scriptItem.changed) {

            const preparedUpdate = prepareUpdate([scriptItem])

            dispatch(addUpdates([preparedUpdate], 'ScriptItem'))
        }

    }



    log(debug, 'ScriptItemProps', props)

    const { id, type } = scriptItem;

    return (
        <div id={id} className="script-item">

            {(type === SCENE) ? <SceneHeader key={id}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocusId, nextFocusId)}
                scriptItem={scriptItem}
            /> : null
            }

            {(type === SYNOPSIS) ? <Synopsis key={id}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocusId, nextFocusId)}
                scriptItem={scriptItem}
            /> : null
            }

            {(type === INITIAL_STAGING) ?
           

                    <Staging key={id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocusId, nextFocusId)}
                        scriptItem={scriptItem}
                /> : null
                
            }

            {(type === DIALOGUE) ? <Dialogue key={id}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocusId, nextFocusId)}
                scriptItem={scriptItem}
                alignRight={alignRight}
                scenePartIds={scenePartIds}
            /> : null}


        </div>

    )

}

export default ScriptItem;