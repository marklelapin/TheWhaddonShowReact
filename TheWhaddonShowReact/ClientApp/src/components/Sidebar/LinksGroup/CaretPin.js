import React from 'react';
import {Icon} from '../../Icons/Icons';

import s from './LinksGroup.module.scss';
import classnames from 'classnames';
export function CaretPin(props) {


    const { id, onClick, isPinned = false, isCollapsed =true} = props

    return (
       

            <div className={classnames(s.headerLinkActive,s.caret,isPinned ? s.pinned : null,isCollapsed ? s.collapsed : null,'d-flex')}
                onClick={onClick}
            >
            <Icon icon="caret" id={id} className={s.caretPin} toolTip={'Pin Sidebar'} />
            </div>
         
       
    )

}

export default CaretPin;
