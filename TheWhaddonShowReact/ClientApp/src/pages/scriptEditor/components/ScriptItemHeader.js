import React from 'react';
import { useSelector  } from 'react-redux';

import {STAGING, INITIAL_STAGING, DIALOGUE, SOUND, LIGHTING, TYPES_WITH_HEADER, ACTION} from '../../../dataAccess/scriptItemTypes';

import s from '../ScriptItem.module.scss';
function ScriptItemHeader(props) {

    const { type, partIds = null } = props;

    if (TYPES_WITH_HEADER.includes(type) === false) return null;

    return (

        <div className={s['script-item-header']}>
            {(type === STAGING) && <span>Staging</span>}

            {(type === INITIAL_STAGING) && <span>Initial Staging</span>}

            {(type === SOUND) && <span>Sound</span>}

            {(type === LIGHTING) && <span>Lighting</span>}

            {(type === ACTION) && <span>Action</span> }


            {(type === DIALOGUE) && (partIds === null || partIds.length === 0) && <span>-</span>}

            {type === DIALOGUE && (partIds !== null) &&

                partIds.map((partId, idx) => {

                    return (
                        <HeaderPartName key={partId} partId={partId} />
                    )
                })

            }
        </div>

    )



}

export default ScriptItemHeader;


function HeaderPartName(props) {
    const { partId } = props;

    const partName = useSelector(state => state.scriptEditor.currentPartPersons[partId]?.name)

    return (
        <span >{partName}</span>
    )

}