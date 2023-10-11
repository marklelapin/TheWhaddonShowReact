
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

                saveChangeToStore(newUpdate)
                break;
            case 'tags':
                setScriptItem({ ...scriptItem, tags: value, changed: true })
                moveFocusToId(scriptItem.id, 'end'); break;
            case 'type':
                let newScriptItem = { ...scriptItem, type: value, changed: true }

                if (value === INITIAL_CURTAIN || value === CURTAIN) {
                    newScriptItem.tags = getOpenCurtainTags(newScriptItem)
                    newScriptItem.text = newCurtainText(true, scriptItem)
                } else if (scriptItem.type === INITIAL_CURTAIN || scriptItem.type === CURTAIN) { //i.e. its coming from a curtain type
                    newScriptItem.text = "";
                }
                saveChangeToStore(newScriptItem)
                moveFocusToId(scriptItem.id, 'end'); break;
            case 'toggleCurtain':

                const open = value

                const newTags = (open) ? getOpenCurtainTags(scriptItem) : getCloseCurtainTags(scriptItem)

                const newText = newCurtainText(open, scriptItem)

                const update = {
                    ...scriptItem
                    , tags: newTags
                    , text: newText
                    , changed: true
                }
                saveChangeToStore(update)

                moveFocusToId(scriptItem.id, 'end'); 

              break;
            default: return;
        }

    }


    const saveChangeToStore = (newScriptItem) => {
        const preparedUpdate = prepareUpdate(newScriptItem)
        dispatch(addUpdates(preparedUpdate, 'ScriptItem'));
    }

    const newCurtainText = (open, scriptItem) => {

        const previousCurtainOpen = scriptItem.previousCurtainOpen

        if (open) { // curtain is opening
            if (previousCurtainOpen === true) return 'Curtain remains open'
            else return 'Curtain opens'
        } else { //curtain is closing
            if (previousCurtainOpen === false) return 'Curtain remains closed'
            else return 'Curtain closes'
        }
    }

    const getOpenCurtainTags = (scriptItem) => {
        const tags = scriptItem.tags
        
        let newTags = tags.filter(tag => tag !== 'CloseCurtain')
        newTags.push('OpenCurtain')

        return newTags;
    }

    const getCloseCurtainTags = (scriptItem) => {
        const tags = scriptItem.tags;

        let newTags = tags.filter(tag => tag !== 'OpenCurtain')
        newTags.push('CloseCurtain')

        return newTags;
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
        <div id={id} className={`script-item ${type?.toLowerCase()} ${(alignRight) ? 'align-right' : ''} ${(scriptItem.curtainOpen) ? 'curtain-open' : 'curtain-closed'} draft-border`}>

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