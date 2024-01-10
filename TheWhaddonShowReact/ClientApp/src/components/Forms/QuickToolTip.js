import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';


function QuickToolTip(props) {
    const {id,tip,placement = 'top',show = 500,hide = 250 } = props

    const [toolTipOpen, setToolTipOpen] = useState(null);

    const toolTipDelay = { show , hide };

    const toggleToolTip = (id) => {
        setToolTipOpen(toolTipOpen === id ? null : id)
    }
    return (

        <Tooltip placement={placement} isOpen={toolTipOpen === id} toggle={() => toggleToolTip(id)} target={id} delay={toolTipDelay}>{tip}</Tooltip>

    )
}

export default QuickToolTip