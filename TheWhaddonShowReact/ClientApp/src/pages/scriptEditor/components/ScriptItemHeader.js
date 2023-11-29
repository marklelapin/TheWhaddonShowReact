import React from 'react';
import { useSelector  } from 'react-redux';

import {STAGING, INITIAL_STAGING, DIALOGUE} from '../../../dataAccess/scriptItemTypes';

import s from '../ScriptItem.module.scss';
function ScriptItemHeader(props) {

    const { type, partIds = null } = props;

    return (

        <div className={s['script-item-header']}>
            {(type === STAGING) && <span>Staging</span>}

            {(type === INITIAL_STAGING) && <span>Initial Staging</span>}

            {(type === DIALOGUE) && (partIds === null || partIds.length === 0) && <span>-</span>})

            {type == DIALOGUE && (partIds !== null) &&

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