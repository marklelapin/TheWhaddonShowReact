//React and REdux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { toggleSceneSelector } from 'actions/scriptEditor';

//Components
import { Container, Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import Scene from './Scene'
import { Icon } from 'components/Icons/Icons'

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';

function ScriptViewer(props) {

    //utils
    const dispatch = useDispatch();
    const CLASSIC = 'Classic'
    const CHAT = 'Chat'

    //props
    const { scenes, onClick } = props;


    //Internal State
    const [viewStyle, setViewStyle] = useState(CHAT)
    const [showComments, setShowComments] = useState(true)
    const [undoDateTime, setUndoDateTime] = useState(null)



    const handlePrint = () => {
        window.print()
    }


    const handleNavLink = (type) => {

        setViewStyle(type)
    }

    const handleArrowLeft = () => {
        dispatch(toggleSceneSelector())
    }

    const handleUndo = () => {

    }

    const handleRedo = () => {
    }

    return (
        <>
            <Container fluid className="bg-light script-viewer-header sticky-top">
                <Row >
                    <Col xs="1" className="d-flex justify-content-start align-items-center">
                        <Icon icon="arrow-left" onClick={() => handleArrowLeft()}></Icon>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <Nav className="bg-light" tabs>
                            <NavItem>
                                <NavLink
                                    className={`script-viewer-navlink ${(viewStyle === CHAT) ? 'active' : ''}` }
                                    onClick={() => handleNavLink(CHAT)}
                                >
                                    <span>Chat</span><Icon icon="chat-mode" />
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={`script-viewer-navlink ${(viewStyle === CLASSIC) ? 'active' : ''}`}
                                    onClick={() => handleNavLink(CLASSIC)}>
                                    <span>Classic</span><Icon icon="classic-mode" />
                                </NavLink>
                            </NavItem >
                        </Nav >
                    </Col>
                    <Col xs="1" className="d-flex justify-content-end align-items-center">
                        <Icon icon="undo" onClick={() => handleUndo()}></Icon>
                        {(undoDateTime !== null) &&
                            <Icon icon="redo" onClick={() => handleRedo()}></Icon>
                        }
                        <Icon icon="print" onClick={() => handlePrint()}></Icon>
                    </Col>
                </Row>

            </Container>






            <Container fluid="md" id="script-viewer" className="draft-border">


                {(scenes && scenes.length > 0) && scenes.map(scene => {

                    if (scene.type === SHOW) {
                        return <h1 key={scene.id}>{scene.text}</h1>
                    }
                    else if (scene.type === ACT) {
                        return <h2 key={scene.id} >{scene.text}</h2>
                    }
                    else {
                        return <Scene key={scene.id} scene={scene} />
                    }
                }

                )}


            </Container>


        </>





    )
}

export default ScriptViewer;