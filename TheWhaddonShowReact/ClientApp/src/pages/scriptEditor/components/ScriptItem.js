
//React and Redux
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Components
import Dialogue from './Dialogue';
import SceneTitle from './SceneTitle';
import Synopsis from './Synopsis';
import Staging from './Staging';
import Comment from './Comment';
import ScriptItemControls from './ScriptItemControls';
import ScriptItemText from './ScriptItemText';


import { Container, Row, Col } from 'reactstrap';

//utilities
import { log } from 'helper';
import { addUpdates } from 'actions/localServer';
import { prepareUpdate } from 'dataAccess/localServerUtils';
import { moveFocusToId } from '../scripts/utilityScripts';
import { changeFocus } from 'actions/navigation';

//Constants
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN } from 'dataAccess/scriptItemTypes';


function ScriptItem(props) {

    //utility consts
    const debug = true;
    const dispatch = useDispatch()


    // get specific props
    const { scriptItem: storedScriptItem, alignRight = false, scenePartIds, onKeyDown, focus, previousFocusId = null, nextFocusId = null } = props;

    const [scriptItem, setScriptItem] = useState({})

    const viewComments = useSelector(state => state.scriptEditor.viewComments)

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
        <Container className="script-item" draft-border>
            <Row>
                <Col className={`script-item-body ${(type === DIALOGUE) ? 'Dialogue' : ''}} draft-border`}>

                    {/*  Element shared by all scriptItems*/}

                    <div className="script-item-controls">
                        <ScriptItemControls />
                    </div>
                    <div className="script-item-text">
                        <ScriptItemText
                            key={id}
                            scriptItem={scriptItem}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocusId, nextFocusId)}
                        />
                    </div>

                    {/*Elements specific for each scriptItem type*/}

                    {(type === DIALOGUE) ? <Dialogue key={id}
                        onChange={handleChange}
                        scriptItem={scriptItem}
                        scenePartIds={scenePartIds}
                    /> : null
                    }

                </Col>
                <Col md="3" className={`script-item-comment d-none ${(viewComments) ? 'd-md-block' : ''} draft-border`} >
                    <Comment scriptItem={scriptItem} />
                </Col>
        </Row>

        </Container >
    )
}

export default ScriptItem;