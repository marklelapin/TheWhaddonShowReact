//React and REdux
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    CLEAR_SCRIPT,
    trigger,
    updatePersonSelectorConfig,
    updateViewStyle,
    updateShowBools,
    updatePrintScript,
} from '../../../actions/scriptEditor';
import {
    openSidebar
} from '../../../actions/navigation';

//Components
import { Nav, NavItem, NavLink } from 'reactstrap';
import Avatar from '../../../components/Avatar/Avatar';
import { Icon } from '../../../components/Icons/Icons';

//utitilites
import { isScreenLargerThan, isScreenSmallerThan } from '../../../core/screenHelper';
import { setPauseSync } from '../../../actions/localServer';
import { log, SCRIPT_VIEWER_HEADER as logType } from '../../../dataAccess/logging';
import { getShowBools } from '../scripts/layout';
import classnames from 'classnames';
//css
import QuickToolTip from '../../../components/Forms/QuickToolTip';
import s from '../Script.module.scss';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';


function ScriptViewer() {

    //utils
    const dispatch = useDispatch();
    const CLASSIC = 'classic'
    const CHAT = 'chat'

    //props

    //Redux State
    const defaultShowComments = useSelector(state => state.scriptEditor.showComments)
    const defaultShowSceneSelector = useSelector(state => state.scriptEditor.showSceneSelector)
    const currentUser = useSelector(state => state.user.currentUser)

    const sceneInFocus = useSelector(state => state.scriptEditor.sceneInFocus)
    const viewAsPartPerson = useSelector(state => state.scriptEditor.viewAsPartPerson)
    const personSelectorConfig = useSelector(state => state.scriptEditor.personSelectorConfig)
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle)
    const printScript = useSelector(state => state.scriptEditor.printScript)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)

    console.log('scriptViewerProps', { printScript, viewStyle })
    const readOnly = isScriptReadOnly(currentUser)

    //This section allows users with write access to print the script as read only
    //The textareas used for editing don't print well so they are made div in read only mode.Event Handlers
    //It also allows print to be triggered from modal.
    useEffect(() => {

        handlePrintSetup()

    }, [printScript, viewStyle, dispatch]) //eslint-disable-line react-hooks/exhaustive-deps


    const handlePrintSetup = () => {
        if (printScript !== false && viewStyle === CLASSIC) {
            console.log('useEffect printScript', { printScript, viewStyle })
            setTimeout(() => {
                window.print();
                dispatch(updatePrintScript(false))
            }, 2000)

        }
        if (printScript !== false && viewStyle === CHAT) {
            log(logType, 'Switching to classic mode.')
            dispatch(updateViewStyle(CLASSIC))
        }
    }

    log(logType, 'props', { sceneInFocus, viewStyle, readOnly })




    const handleNavLink = (type) => {
        dispatch(updateViewStyle(type))
    }

    const toggleShowComments = () => {
        const newShowComments = !defaultShowComments
        const newShowSceneSelector = (newShowComments === false) ? false : defaultShowSceneSelector
        const showBools = getShowBools(newShowSceneSelector, newShowComments)
        dispatch(updateShowBools(showBools))
    }

    const toggleSceneSelector = () => {
        const newShowSceneSelector = !defaultShowSceneSelector
        const newShowComments = (newShowSceneSelector === false) ? false : defaultShowComments
        const showBools = getShowBools(newShowSceneSelector, newShowComments)
        dispatch(updateShowBools(showBools))
    }

    const togglePersonSelector = () => {
        if (personSelectorConfig) {

            dispatch(updatePersonSelectorConfig(null))
        } else {
            dispatch(updatePersonSelectorConfig({ additionalCategory: { name: 'Parts', partIds: sceneInFocus?.partIds || [] } }))
        }

    }

    const handleClickPrint = () => {
        console.log('hello handleClickPrint')
        dispatch(updatePrintScript(true))

    }

    const { showComments, showCommentControls, showSceneSelectorControls } = getShowBools(defaultShowSceneSelector, defaultShowComments)


    return (

        <div id="script-viewer-header" className={`bg-light flex-full-width ${s['script-viewer-header']}`}>

            <div className={s['left-controls']}>

                <Nav className="bg-light" tabs>

                    {(!isMobileDevice || viewStyle === CLASSIC) &&
                        <NavItem>
                            <NavLink id="chat-mode"
                                className={`${s['script-viewer-navlink']} ${(viewStyle === CHAT) ? 'active' : ''}`}
                                onClick={() => handleNavLink(CHAT)}
                            >
                                <span>Chat</span><Icon icon="chat-mode" />
                            </NavLink>
                            <QuickToolTip id="chat-mode" tip="Fun, great on mobile and shows curtain more clearly." placement="top" />
                        </NavItem>
                    }
                    {(!isMobileDevice || viewStyle === CHAT) &&
                        <NavItem>
                            <NavLink id="classic-mode"
                                className={`${s['script-viewer-navlink']} ${isScreenSmallerThan('xl') ? s['reduced-padding'] : ''} ${(viewStyle === CLASSIC) ? 'active' : ''}`}
                                onClick={() => handleNavLink(CLASSIC)}>
                                <span>Classic</span><Icon icon="classic-mode" />
                            </NavLink>
                            <QuickToolTip id="classic-mode" tip="Smart, great for printing" placement="top" />
                        </NavItem >
                    }
                </Nav >

            </div>
            <div className={s['center-controls']}>
                <div id="view-as-control"
                    className={classnames(s['view-as-control'], viewAsPartPerson ? s['selected'] : null, s[viewStyle], 'clickable')}
                    onClick={() => togglePersonSelector()}
                >
                    <span>view as:
                    </span>

                    <Avatar
                        size="sm"
                        person={viewAsPartPerson}
                        avatarInitials={(viewAsPartPerson === null) ? '?' : null}
                    />
                    <QuickToolTip id="view-as-control" tip="Highlight someones lines" placement="top" />
                </div>
                {showSceneSelectorControls && <div id="scene-selector-control" className={classnames(s['scene-selector-control'], 'clickable')} onClick={() => toggleSceneSelector()}>
                    {!isMobileDevice && <span>{`search `}
                    </span>}
                    <Icon id="script-viewer-show-selector-modal" icon="search" toolTip="Search scenes"></Icon>
                    <QuickToolTip id="scene-selector-control" tip="Search scenes" placement="top" />
                </div>}
            </div>
            <div className={s['right-controls']}>
                {!isMobileDevice &&
                    <>
                        {showCommentControls && showComments && <Icon id="script-viewer-comments" icon="comment" onClick={() => toggleShowComments()} toolTip="Hide comments"></Icon>}

                        {showCommentControls && !showComments && <Icon id="script-viewer-comments" icon="comment-o" onClick={() => toggleShowComments()} toolTip="Show comments"></Icon>}

                        <Icon id="script-viewer-print" icon="print" onClick={() => handleClickPrint('regular')} toolTip="Print script" style={{ paddingLeft: '5px' }}></Icon>
                        <Icon id="script-viewer-print-large" icon="glasses" onClick={() => handleClickPrint('large')} toolTip="Print script (large)" style={{ paddingRight: '5px' }}></Icon>

                        {!readOnly && isScreenLargerThan('lg') && <Icon id="script-viewer-close" icon="remove" onClick={() => dispatch(trigger(CLEAR_SCRIPT))} toolTip="Close script"></Icon>}

                        {readOnly && <Icon id="script-viewer-refresh" icon="refresh" onClick={() => dispatch(setPauseSync(false))} toolTip="Refresh script"></Icon>}
                    </>
                }
                {isMobileDevice &&
                    <Icon icon="menu" onClick={() => dispatch(openSidebar())} />
                }

            </div>

        </div >
    )
}

export default ScriptViewer;