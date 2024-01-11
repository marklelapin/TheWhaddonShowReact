import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PartSelectorDropdown from './PartSelectorDropdown';

import { STAGING, INITIAL_STAGING, DIALOGUE, SOUND, LIGHTING, TYPES_WITH_HEADER, SCENE } from '../../../dataAccess/scriptItemTypes.js';

import { trigger, UPDATE_PART_IDS } from '../../../actions/scriptEditor.js';
import { log, SCRIPT_ITEM_HEADER as logType } from '../../../logging.js';

import s from '../ScriptItem.module.scss';
import QuickToolTip from '../../../components/Forms/QuickToolTip';
function ScriptItemHeader(props) {

    const { scriptItem, sceneNumber } = props;
    const { type, partIds } = scriptItem;
    log(logType, 'props:', props)
    const headerId = `script-item-header-${scriptItem.id}`

    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)

    if (TYPES_WITH_HEADER.includes(type) === false) return null;

    return (

        <div id={headerId} className={`${s['script-item-header']} ${s[viewStyle]}`}>
            {(type === SCENE) && <span>Scene {sceneNumber}</span>} 
            {(type === STAGING) && <span>Staging</span>}

            {(type === INITIAL_STAGING) && <span>Initial Staging</span>}

            {(type === SOUND) && <span>Sound</span>}

            {(type === LIGHTING) && <span>Lighting</span>}

        {/*    {(type === ACTION) && <span>Action</span>}*/}

            {(type === DIALOGUE) && (partIds === null || partIds.length === 0) &&
                <>
                    <HeaderPartName key={`blankPart-${scriptItem.id}`} scriptItem={scriptItem} />
                    <QuickToolTip id={headerId} key={headerId} tip='Assign part' />
                </>

            }

            {type === DIALOGUE && (partIds !== null) &&
                <>
                    {partIds.map((partId, idx) => {

                        return (
                                <HeaderPartName key={headerId + partId} partId={partId} scriptItem={scriptItem} isEnd={(idx === partIds.length - 1)} />
                        )
                    })
                    }
                     <QuickToolTip id={headerId} key={`${headerId}`} tip='Assign part' />
                </>

            }
        </div>

    )



}

export default ScriptItemHeader;


function HeaderPartName(props) {
    const dispatch = useDispatch();

    const { partId = null, scriptItem, isEnd } = props;

    const partName = useSelector(state => state.scriptEditor.currentPartPersons[partId]?.name)
    const scene = useSelector(state => state.scriptEditor.currentScriptItems[scriptItem.parentId])

    const scenePartIds = scene?.partIds || []

    const [openPartSelector, setOpenPartSelector] = useState(false);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setOpenPartSelector(!openPartSelector)
    }

    const handleSelect = (selectedPartIds) => {
        dispatch(trigger(UPDATE_PART_IDS, { scriptItem, value: selectedPartIds }))
        setOpenPartSelector(false)
    }


    return (
        <>
            {(partId !== null) && <span className='clickable' onClick={(e) => toggleDropdown(e)}>{`${partName} ${(isEnd) ? '' : ', '}`}</span>}
            {(partId === null) && <span className='clickable' onClick={(e) => toggleDropdown(e)}>???</span>}
            {(openPartSelector) &&

                <PartSelectorDropdown
                    partIds={scenePartIds}
                    toggle={(e) => toggleDropdown(e)}
                    onSelect={(selectedPartIds) => handleSelect(selectedPartIds)}
                />
            }


        </>

    )

}