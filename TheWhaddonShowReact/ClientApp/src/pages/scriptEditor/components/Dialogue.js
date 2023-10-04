//react and redux
import React from 'react';
import { useSelector } from 'react-redux';

//Components
import PartSelector from './PartSelector';

//utilities
import { log } from 'helper';


function Dialogue(props) {

    const debug = true;

    const { onChange, scriptItem, scenePartIds = [] } = props;

    const { id, partIds: allocatedPartIds = [] } = scriptItem;


    const dialogueRightId = useSelector(state => state.scriptEditor.dialogueRightId)

    const partName = 'Test name'

    const alignment = dialogueRightId === id ? 'align-right' : 'align-left'

    log(debug, 'DialogueProps', props)
    log(debug, 'Dialogue scriptItem', scriptItem)


    return (

        <>
            <div className="script-item-header">
                <small>{partName}</small>
            </div>
        <div className={`script-item-avatar ${alignment}`}>
            <PartSelector
                scriptItem={scriptItem}
                scenePartIds={scenePartIds}
                allocatedPartIds={allocatedPartIds}
                onChange={(partIds) => onChange('partIds', partIds)}
            /> 
        </div>
        
        </>
        
    )

}

export default Dialogue;