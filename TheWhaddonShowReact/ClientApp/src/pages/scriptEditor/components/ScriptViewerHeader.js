//React and REdux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    toggleSceneSelector,
    updateShowComments,
    updateViewAsPartPerson,
} from 'actions/scriptEditor';

//Components
import { Container, Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import { Icon } from 'components/Icons/Icons'
import Avatar from 'components/Avatar/Avatar'

//utitilites
import { isSmallerScreen } from 'components/Sidebar/Sidebar'
import { log } from 'helper';
import { getLatest } from 'dataAccess/localServerUtils'

//Constants
import PersonSelector from './PersonSelector';


function ScriptViewer(props) {
    const debug = true;

    //utils
    const _ = require('lodash');
    const dispatch = useDispatch();
    const CLASSIC = 'Classic'
    const CHAT = 'Chat'

    //props
    const { scenes, onClick } = props;






    const showComments = useSelector(state => state.scriptEditor.showComments)
    const focus = useSelector(state => state.navigation.focus)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const partPersons = useSelector(state => state.scriptEditor.partPersons)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons)

    log(debug, 'ScriptViewer: focus', focus)


    //Internal State
    const [viewStyle, setViewStyle] = useState(CHAT)
    const [undoDateTime, setUndoDateTime] = useState(null)
    const [focussedScene, setFocussedScene] = useState(null)


    const [openPersonSelector, setOpenPersonSelector] = useState(null)


    useEffect(() => {
        log(debug, 'Script Viewer UseEffect Focus:', focus, focussedScene)
        if (focus && focus.parentId !== focussedScene?.id) { //only if moved to a new scene.

            const newFocussedScene = scenePartPersons[focus.parentId]
            if (newFocussedScene) {
                setFocussedScene(newFocussedScene)
            }
        }   






    }, [focus])

    useEffect(() => {
        if (scenePartPersons && focussedScene) {
            const updatedScene = scenePartPersons[focussedScene.parentId]
            setFocussedScene(updatedScene)
        }

    }, [scenePartPersons])




    //Event Handlers
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

    const toggleShowComments = () => {
        dispatch(updateShowComments(!showComments))
    }

    const togglePersonSelector = () => {

        setOpenPersonSelector(!openPersonSelector)
    }

    const handleSelectPerson = (person) => {
        log(debug,'viewAsPartPerson', viewAsPartPerson)
        log(debug, 'handleSelectPerson', person)
        dispatch(updateViewAsPartPerson(person))
        setOpenPersonSelector(false)
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
                                    className={`script-viewer-navlink ${(viewStyle === CHAT) ? 'active' : ''}`}
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
                    <Col xs="1">
                        <Avatar
                            size="sm"
                            person={viewAsPartPerson}
                            avatarInitials={(viewAsPartPerson === null) ? '?' : null}
                            onClick={() => togglePersonSelector()}
                        />
                        {/*<PartSelector*/}
                        {/*    scenePartIds={focussedScene?.partIds}*/}
                        {/*    allocatedPartIds={(viewAsPart===null) ? null : [viewAsPart.id]}*/}
                        {/*    size="sm"*/}
                        {/*    onClick={(partIdArray) => handleSelectPartId(partIdArray[0])}*/}
                        {/*/>*/}

                    </Col>

                    <Col xs="1" className="d-flex justify-content-end align-items-center">
                        {(isSmallerScreen() === false) &&

                            (showComments) ? <Icon icon="comment" onClick={() => toggleShowComments()}></Icon>
                            : <Icon icon="comment-o" onClick={() => toggleShowComments()}></Icon>
                        }

                        <Icon icon="undo" onClick={() => handleUndo()}></Icon>
                        {(undoDateTime !== null) &&
                            <Icon icon="redo" onClick={() => handleRedo()}></Icon>
                        }
                        <Icon icon="print" onClick={() => handlePrint()}></Icon>
                    </Col>
                </Row>

            </Container>


            {(openPersonSelector) &&
                <PersonSelector
                    additionalCategory={{ name: 'Parts', persons: focussedScene?.partPersons }}
                    closeModal={() => togglePersonSelector()}
                    onClick={(person) => handleSelectPerson(person)} />
            }
        </>





    )
}

export default ScriptViewer;