
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
import PartSelector from './PartSelector';

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
    const { scriptItem: storedScriptItem, scene, alignRight = false, onKeyDown, focus, previousFocus = null, nextFocus = null } = props;


    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const viewAsPerson = useSelector(state => state.scriptEditor.viewAsPerson)
    const viewAsPartId = useSelector(state => state.scriptEditor.viewAsPartId)
    const storedParts = useSelector(state => state.localServer.parts.history)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[storedScriptItem.parentId])

    //Internal State
    const [scriptItem, setScriptItem] = useState({})
    const [inFocus, setInFocus] = useState(null)


    const textInputRef = useRef(null)



    useEffect(() => {

    }, [])

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


    //calculations functions

    const showParts = () => {
        switch (scriptItem.type) {
            case DIALOGUE: return true;
            default: return false;
        }
    }

    const header = () => {
        switch (scriptItem.type) {
            case DIALOGUE:
                if (scenePartPersons) {


                    const partPersons = scriptItem.partIds.map(partId => scenePartPersons.partPersons.find(partPerson => partPerson.id === partId))

                    const partNames = partPersons.map(partPersons => partPersons.name).join(',')

                    return partNames;
                }; break;
            default: return null;
        }

    }

    const dialogueAlignment = () => {



    }






    const handleFocus = () => {

        setInFocus(true)
    }

    //Saves to Redux store when focus is taken off the scriptItem
    const handleBlur = () => {

        if (scriptItem.changed) {

            const preparedUpdate = prepareUpdate([scriptItem])

            dispatch(addUpdates([preparedUpdate], 'ScriptItem'))
        }

        setInFocus(false)
    }



    log(debug, 'ScriptItemProps', props)

    const { id, type } = scriptItem;

    return (
        <Container id={id} className={`script-item ${type?.toLowerCase()} draft-border`}>
            <Row>
                <Col className={`script-item-body draft-border`}>


                    <div ref={textInputRef} className="script-item-text">
                        <ScriptItemText
                            key={id}
                            maxWidth={textInputRef.current?.offsetWidth}
                            scriptItem={scriptItem}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocus, nextFocus)}
                        />

                        {(inFocus) &&
                            <div className="script-item-controls">
                                <ScriptItemControls />
                            </div>
                        }

                        {showParts() &&
                            <div className="script-item-parts">
                                <PartSelector
                                    scene={scene}
                                    allocatedPartIds={scriptItem.partIds}
                                    onChange={(selectedPartIds) => handleChange('partIds', selectedPartIds)}
                                />
                            </div>
                        }

                        {header() &&

                            <div className="script-item-header">
                                <small>{header()}</small>
                            </div>
                        }

                    </div>

                    {/*Elements specific for each scriptItem type*/}


                </Col>
                <Col md="3" className={`script-item-comment d-none ${(showComments) ? 'd-md-block' : ''} draft-border`} >
                    <Comment scriptItem={scriptItem} />
                </Col>
            </Row>

        </Container >
    )
}

export default ScriptItem;