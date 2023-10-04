//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Col, Row, Button} from 'reactstrap';
import { Icon } from 'components/Icons/Icons'
function ScriptItemControls(props) {


    //const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)

    const undoDateTime = 'skdfjkdsjf'

    const { onClick } = props;

    return (
        <>
            <Col>
                <Row>
                    <Icon icon="menu" onClick={() => onClick('menu')} />
                </Row>
                <Row>
                    <Icon icon="undo" onClick={() => onClick('undo')} />
                    {(undoDateTime) &&
                        <Icon icon="redo" onClick={() => onClick('redo')} />
                    }
                </Row>
            </Col>

            {undoDateTime &&
                <>
                    <Button size ='xs' color="primary" onClick={() => onClick('confirmUndo')}>confirm undo</Button>
                    <Button size = 'xs' color="danger" onClick={()=>onClick('cancelUndo')}>cancel</Button>
                </>
            }
        </>
    )
}

export default ScriptItemControls;