
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
import { Icon } from 'components/Icons/Icons';
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
    const { scriptItem, scene, alignRight = false, onClick, onChange, moveFocus, previousFocus = null, nextFocus = null } = props;


    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scriptItem.parentId])

    //Refs
    const textInputRef = useRef(null)


 
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

                    return partNames || '-'
                }; break;
            default: return null;
        }

    }




    log(debug, 'ScriptItemProps', props)

    const { id, type } = scriptItem;

    return (
        <div id={id} className={`script-item ${type?.toLowerCase()} ${(alignRight) ? 'align-right' : ''} ${(scriptItem.curtainOpen) ? 'curtain-open' : 'curtain-closed'} draft-border`}>

            {showParts() &&
                <div className="script-item-parts">
                    <PartSelector
                        scene={scene}
                        allocatedPartIds={scriptItem.partIds}
                        onChange={(selectedPartIds) => onChange('partIds', selectedPartIds)}
                    />
                </div>
            }
            <div ref={textInputRef} className="script-item-text-area">

                <ScriptItemText
                    key={id}
                    maxWidth={textInputRef.current?.offsetWidth}
                    scriptItem={scriptItem}
                    header={header()}
                    onClick={onClick}
                    onChange={onChange}
                    moveFocus={moveFocus}
                    refresh={scriptItem.refresh}
                />

            </div>

            {/*Elements specific for each scriptItem type*/}

            {(type === SCENE) &&
                <div className="scene-controls">
                    <Icon icon="remove" onClick={() => onClick('deleteScene', scriptItem)} />
                </div>
            }
        </div>

    )
}

export default ScriptItem;