//React and REdux
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    CLEAR_SCRIPT,
    toggleSceneSelector,
    trigger,
    updatePersonSelectorConfig,
    updateShowComments,
    updateViewStyle
} from '../../../actions/scriptEditor';

//Components
import { Nav, NavItem, NavLink } from 'reactstrap';
import Avatar from '../../../components/Avatar/Avatar';
import { Icon } from '../../../components/Icons/Icons';

//utitilites
import { isScreenLargerThan, isScreenSmallerThan } from '../../../core/screenHelper';
import { log } from '../../../logging';
//css
import QuickToolTip from '../../../components/Forms/QuickToolTip';
import s from '../Script.module.scss';


function ScriptViewer(props) {
    const debug = false;

    //utils
    const _ = require('lodash');
    const dispatch = useDispatch();
    const CLASSIC = 'classic'
    const CHAT = 'chat'

    //props

    //Redux State
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig)
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const screenSize = useSelector(state => state.layout.screenSize)
    log(debug, 'Component:ScriptViewerHeader sceneInFocus', sceneInFocus)

    //Event Handlers
    const handlePrint = () => {
        alert("Sorry! Not yet implemented.")
        // window.print()
    }


    const handleNavLink = (type) => {

        dispatch(updateViewStyle(type))
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
            dispatch(updatePersonSelectorConfig({ additionalCategory: { name: 'Parts', partIds: sceneInFocus?.partIds || [] } }))
        }

    }

    const singleSection = isScreenSmallerThan('md')

    return (
        
        <div id="script-viewer-header" className={`bg-light flex-full-width ${s['script-viewer-header']}`}>

            <div className={`${s['left-controls']} justify-content-start align-items-center`}>
                <Icon icon="arrow-left" onClick={() => handleArrowLeft()}></Icon>
            </div>
            <div className={`${s['center-controls']} justify-content-center`}>
                <Nav className="bg-light" tabs>
                    <NavItem>
                        <NavLink id ="chat-mode"
                            className={`${s['script-viewer-navlink']} ${(viewStyle === CHAT) ? 'active' : ''}`}
                            onClick={() => handleNavLink(CHAT)}
                        >
                            <span>Chat</span><Icon icon="chat-mode" />
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink id="classic-mode"
                            className={`${s['script-viewer-navlink']} ${singleSection ? s['reduced-padding'] : ''} ${(viewStyle === CLASSIC) ? 'active' : ''}`}
                            onClick={() => handleNavLink(CLASSIC)}>
                            <span>Classic</span><Icon icon="classic-mode" />
                        </NavLink>
                    </NavItem >
                </Nav >
            </div>
            <QuickToolTip id="chat-mode" tip="Fun, great on mobile and shows curtain more clearly." placement="top" />
            <QuickToolTip id="classic-mode" tip="Smart, great for printing" placement="top" />
            <div id="view-as-control" className={`${s['view-as-control']} ${viewAsPartPerson ? s['selected'] : ''} ${s[viewStyle]}`}>
                <span>view as: 
                </span>

                <Avatar
                    size="sm"
                    person={viewAsPartPerson}
                    avatarInitials={(viewAsPartPerson === null) ? '?' : null}
                    onClick={() => togglePersonSelector()}
                />

            </div>
            <QuickToolTip id="view-as-control" tip="Highlight someones lines" placement="top" />
            <div className={`${['right-controls']} justify-content-end align-items-center`}>
                {singleSection  &&
                    (showComments) ? <Icon id="script-viewer-comments" icon="comment" onClick={() => toggleShowComments()} toolTip="Hide comments"></Icon>
                    : <Icon id="script-viewer-comments" icon="comment-o" onClick={() => toggleShowComments()} toolTip="Show comments"></Icon>
                }

                <Icon id="script-viewer-print" icon="print" onClick={() => handlePrint()} toolTip="Print whole script"></Icon>
                {singleSection &&
                    <Icon id="script-viewer-close" icon="remove" onClick={() => dispatch(trigger(CLEAR_SCRIPT))} toolTip="Close script"></Icon>
                }
            </div>

        </div>

    )
}

export default ScriptViewer;