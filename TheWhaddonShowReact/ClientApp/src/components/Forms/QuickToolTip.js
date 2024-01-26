import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

import { isMouseAvailable } from '../../core/screenHelper';

function QuickToolTip(props) {


    const isMouse = isMouseAvailable()

    const {id,tip,placement = 'top',show = 500,hide = 250 } = props

    const [toolTipOpen, setToolTipOpen] = useState(null);

    const toolTipDelay = { show , hide };

    const toggleToolTip = (id) => {
        setToolTipOpen(toolTipOpen === id ? null : id)
    }

    if (!isMouse) return null

    return (

        <Tooltip placement={placement} isOpen={toolTipOpen === id} toggle={() => toggleToolTip(id)} target={id} delay={toolTipDelay}>{tip}</Tooltip>

    )
}

export default QuickToolTip