//React and REdux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    toggleSceneSelector,
    updateShowComments,
    updateViewAsPartPerson,
} from '../../../actions/scriptEditor';

//Components
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons'
import Avatar from '../../../components/Avatar/Avatar'

//utitilites
import { isSmallerScreen } from '../../../components/Sidebar/Sidebar'
import { log } from '../../../helper';

//Constants
import PersonSelector from './PersonSelector';


function ScriptViewer(props) {
    const debug = false;

    //utils
    const _ = require('lodash');
    const dispatch = useDispatch();
    const CLASSIC = 'Classic'
    const CHAT = 'Chat'

    //props
    const { scenes, onClick } = props;

    //Redux State
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const focus = useSelector(state => state.scriptEditor.focus)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const partPersons = useSelector(state => state.scriptEditor.partPersons)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons)

    log(debug, 'Component:ScriptViewerHeader focus', focus)


    //Internal State
    const [viewStyle, setViewStyle] = useState(CHAT)
    const [undoDateTime, setUndoDateTime] = useState(null)
    const [focussedScene, setFocussedScene] = useState(null)


    const [openPersonSelector, setOpenPersonSelector] = useState(null)


    useEffect(() => {
        log(debug, 'ScriptViewerHeader Focus:', { focus: focus, focussedScene: focussedScene })
        let currentFocus = null;
        for (var key in focus) {
            if (focus.hasOwnProperty(key)) {
                currentFocus = focus[key];
            }
        }
        log(debug, 'Component:ScriptViewerHeader currentFocus:', currentFocus)
        log(debug, 'Component:ScriptViewerHeader keyfocusdata:', {parentId: currentFocus?.parentId,focussedSceneId: focussedScene?.id})
        if (currentFocus && currentFocus.parentId && currentFocus.parentId !== focussedScene?.id) { //only if moved to a new scene.

            const newFocussedScene = scenePartPersons[currentFocus.parentId]
            if (newFocussedScene) {
                setFocussedScene(newFocussedScene)
            }
        } 
    }, [focus])


    useEffect(() => {
        if (scenePartPersons && focussedScene) {
            const updatedScene = scenePartPersons[focussedScene.id]
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

    const handleClearScript = () => {
        onClick('clearScript')
    }

    return (
        <>
            <div id="script-viewer-header" className="bg-light flex-full-width script-viewer-header">
                
                    <div className="left-controls justify-content-start align-items-center">
                        <Icon icon="arrow-left" onClick={() => handleArrowLeft()}></Icon>
                    </div>
                    <div  className="center-controls justify-content-center">
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
                    </div>
                <div className="view-as-control">
                    <span>view as:
                    </span>
                
                        <Avatar
                            size="sm"
                            person={viewAsPartPerson}
                            avatarInitials={(viewAsPartPerson === null) ? '?' : null}
                            onClick={() => togglePersonSelector()}
                        />
                    
                    </div>

                    <div className="right-controls justify-content-end align-items-center">
                        {(isSmallerScreen() === false) &&

                            (showComments) ? <Icon icon="comment" onClick={() => toggleShowComments()}></Icon>
                            : <Icon icon="comment-o" onClick={() => toggleShowComments()}></Icon>
                        }

                    <Icon icon="print" onClick={() => handlePrint()}></Icon>
                        <Icon icon="remove" onClick={() => handleClearScript()}></Icon>
                    </div>
               

            </div>


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