//React and REdux
import React from 'react';
import { useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
    toggleSceneSelector,
    updateShowComments,
    updatePersonSelectorConfig,
    trigger,
    CLEAR_SCRIPT
} from '../../../actions/scriptEditor';

//Components
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons'
import Avatar from '../../../components/Avatar/Avatar'

//utitilites
import { isSmallerScreen } from '../../../components/Sidebar/Sidebar'
import { log } from '../../../logging';


function ScriptViewer(props) {
    const debug = false;

    //utils
    const _ = require('lodash');
    const dispatch = useDispatch();
    const CLASSIC = 'Classic'
    const CHAT = 'Chat'

    //props

    //Redux State
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig)
 
    log(debug, 'Component:ScriptViewerHeader sceneInFocus',sceneInFocus)

    //Internal State
    const [viewStyle, setViewStyle] = useState(CHAT)


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

    const toggleShowComments = () => {
        dispatch(updateShowComments(!showComments))
    }

    const togglePersonSelector = () => {
        if (personSelectorConfig) {

            dispatch(updatePersonSelectorConfig(null))
        } else {
            dispatch(updatePersonSelectorConfig({ additionalCategory: { name: 'Parts', partIds: sceneInFocus.partIds } }))
        }

    }



    return (

        <div id="script-viewer-header" className="bg-light flex-full-width script-viewer-header">

            <div className="left-controls justify-content-start align-items-center">
                <Icon icon="arrow-left" onClick={() => handleArrowLeft()}></Icon>
            </div>
            <div className="center-controls justify-content-center">
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
                <Icon icon="remove" onClick={() => dispatch(trigger(CLEAR_SCRIPT))}></Icon>
            </div>

        </div>

    )
}

export default ScriptViewer;