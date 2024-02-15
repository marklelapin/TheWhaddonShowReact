import React from 'react';
import {Icon} from '../../Icons/Icons';

import s from './LinksGroup.module.scss';

export function CaretPin(props) {


    const { id, onClick, isPinned = false, isCollapsed =true} = props

    return (
       

            <div className={`${[s.headerLinkActive]} ${isPinned ? s.pinned : ''} ${isCollapsed ? s.collapsed : ''} d-flex caret-pin`}
                onClick={onClick}
            >
            <Icon icon="caret" id={id} className={s.caret} toolTip={'Pin Sidebar'} />
            </div>
         
       
    )

}

export default CaretPin;
