//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Col, Row, Button } from 'reactstrap';
import { Icon } from 'components/Icons/Icons'
function ScriptItemControls(props) {


    //const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)

    const undoDateTime = null

    const { onClick } = props;

    return (
        <>
            
            <div className="script-item-control-buttons">
                <Icon icon="menu" onClick={() => onClick('menu')} />
                <Icon icon="add" onClick={() => onClick('add')} />
                <Icon icon="undo" onClick={() => onClick('undo')} />
                {(undoDateTime) &&
                    <Icon icon="redo" onClick={() => onClick('redo')} />
                }
                {(!undoDateTime) &&
                    <Icon icon="remove" />
                }

            </div>
 

            {undoDateTime &&
                <div className="confirm-undo-buttons">
                    <Button size='xs' color="primary" onClick={() => onClick('confirmUndo')} >confirm undo</Button>
                    <Button size='xs' color="danger" onClick={() => onClick('cancelUndo')} >cancel</Button>
                </div>
            }
        </>
    )
}

export default ScriptItemControls;