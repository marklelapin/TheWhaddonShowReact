import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import classnames from 'classnames';
import s from './LinksGroup.module.scss';

export function CaretPin(props) {

    return (
        <>
        
            <div className={classnames({ [s.headerLinkActive]: true }, { [s.collapsed]: props.isPinned }, "d-flex","caret-pin")}
                                onClick={props.onClick}
            >
                <b id="caret-pin" className={['fa fa-angle-left', s.caret].join(' ')} />
      </div>
            <UncontrolledTooltip placement="bottom" target="caret-pin">
                                Pin<br />sidebar<br />
            </UncontrolledTooltip>
        </>
    )

}

export default CaretPin;
