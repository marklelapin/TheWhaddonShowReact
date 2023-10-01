import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Dialogue from './Dialogue';
import { log } from 'helper';
import { addUpdates } from 'actions/localServer';
import { prepareUpdate } from 'dataAccess/localServerUtils';
import { moveFocusToId } from '../scripts/utilityScripts';

function ScriptItem(props) {

    //utility consts
    const debug = false;
    const dispatch = useDispatch()


    // get specific props
    const { scriptItem: storedScriptItem, alignRight = false, parts, onKeyDown, focus } = props;

    const [scriptItem, setScriptItem] = useState({})


    useEffect(() => {
        setScriptItem(storedScriptItem)
    }, [storedScriptItem])

    useEffect(() => {
        if (focus) {
           moveFocusToId(storedScriptItem.id, focus.position)
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
    const handleBlur = (scriptItem) => {

        if (scriptItem.changed) {

            const preparedUpdate = prepareUpdate([scriptItem])

            dispatch(addUpdates([preparedUpdate], 'ScriptItem'))
        }

    }



    log(debug, 'ScriptItemProps', props)

    const { id, type } = scriptItem;

    return (
        <div id={id} className="script-item">

            {(type === "Dialogue") ? <Dialogue key={id}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={onKeyDown}
                scriptItem={scriptItem}
                alignRight={alignRight}
                parts={parts}
                 /> : null}

        </div>

    )

}

export default ScriptItem;