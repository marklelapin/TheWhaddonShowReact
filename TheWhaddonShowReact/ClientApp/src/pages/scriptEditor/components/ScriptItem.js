
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
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN } from 'dataAccess/scriptItemTypes';


function ScriptItem(props) {

    //utility consts
    const debug = false;
    const dispatch = useDispatch()


    // get specific props
    const { scriptItem: storedScriptItem, scene, alignRight = false, onKeyDown, previousFocus = null, nextFocus = null } = props;


    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[storedScriptItem.parentId])

    //Internal State
    const [scriptItem, setScriptItem] = useState({})


    const textInputRef = useRef(null)



    useEffect(() => {

    }, [])

    useEffect(() => {
        log(debug, 'SCripItem: useEffect: storedScriptItem', storedScriptItem)
        setScriptItem(storedScriptItem)
    }, [storedScriptItem])



    //changes are registered internally until onBlur is called
    const handleChange = (type, value) => {

        switch (type) {
            case 'text': setScriptItem({ ...scriptItem, text: value, changed: true }); break;
            case 'partIds':

                const newUpdate = { ...scriptItem, partIds: value }
                const preparedUpdate = prepareUpdate(newUpdate)
                dispatch(addUpdates(preparedUpdate, 'ScriptItem'));
                break;
            case 'tags':
                setScriptItem({ ...scriptItem, tags: value, changed: true })
                moveFocusToId(scriptItem.id, 'end'); break;
            case 'type':
                let newScriptItem = { ...scriptItem, type: value, changed: true }

                if (value === INITIAL_CURTAIN || value === CURTAIN) {
                    newScriptItem.tags.push('OpenCurtain')
                    newScriptItem.text = 'Open Curtain'
                }

                setScriptItem(newScriptItem)
              
                moveFocusToId(scriptItem.id, 'end'); break;
            case 'toggleCurtain':

                let newTags = scriptItem.tags;

                if (value === true) { //open curtain
                    newTags = scriptItem.tags.filter(tag => tag !== 'CloseCurtain')
                    newTags.push('OpenCurtain')
                } else { //close curtain
                    newTags = scriptItem.tags.filter(tag => tag !== 'OpenCurtain')
                    newTags.push('CloseCurtain')
                }

                let newText;

                (value === true) ? newText = 'Open Curtain' : newText = 'Close Curtain';

                const update = {
                    ...scriptItem
                    , tags: newTags
                    , text: newText
                    , changed: true
                }
                dispatch(addUpdates(prepareUpdate(update), 'ScriptItem'))

                moveFocusToId(scriptItem.id, 'end'); 

              break;
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



  

    //Saves to Redux store when focus is taken off the scriptItem
    const handleBlur = () => {

        if (scriptItem.changed) {

            const preparedUpdate = prepareUpdate([scriptItem])

            dispatch(addUpdates(preparedUpdate, 'ScriptItem'))
        }
    }



    log(debug, 'ScriptItemProps', props)

    const { id, type } = scriptItem;

    return (
        <div id={id} className={`script-item ${type?.toLowerCase()} ${(alignRight) ? 'align-right' : ''} ${(scriptItem.curtainOpen) ? 'curtain-open' : ''} draft-border`}>

            <div ref={textInputRef} className="script-item-text-area">

                <ScriptItemText
                    key={id}
                    maxWidth={textInputRef.current?.offsetWidth}
                    scriptItem={scriptItem}
                    header={header()}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => onKeyDown(e, scriptItem, previousFocus, nextFocus)}
                    refresh={scriptItem.refresh}
                />

            </div>
            {showParts() &&
                <div className="script-item-parts">
                    <PartSelector
                        scene={scene}
                        allocatedPartIds={scriptItem.partIds}
                        onChange={(selectedPartIds) => handleChange('partIds', selectedPartIds)}
                    />
                </div>
            }
            {/*Elements specific for each scriptItem type*/}


            {/*<div md="3" className={`script-item-comment d-none ${(showComments) ? 'd-md-block' : ''} draft-border`} >*/}
            {/*    <Comment scriptItem={scriptItem} />*/}
            {/*</div>*/}


        </div >
    )
}

export default ScriptItem;