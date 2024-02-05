
//React and Redux
import React from 'react';
import { memo, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
//Components
import Comment from './Comment';

import ScriptItemText from './ScriptItemText';
import PartSelector from './PartSelector';
import { Icon } from '../../../components/Icons/Icons';
import { Button } from 'reactstrap';
import CheckBox from '../../../components/Forms/CheckBox';
import MediaDropzone from '../../../components/Uploaders/MediaDropzone';
import CurtainBackground from './CurtainBackground';
import QuickToolTip from '../../../components/Forms/QuickToolTip';
//utilities
import { log, SCRIPT_ITEM as logType } from '../../../dataAccess/logging';

import classnames from 'classnames';
//Constants
import { SCENE, DIALOGUE, CURTAIN_TYPES, OPEN_CURTAIN } from '../../../dataAccess/scriptItemTypes';
import {CHAT,CLASSIC } from '../scripts/layout';
//trigger types
import {
    trigger,
    REDO, UNDO, CONFIRM_UNDO,
    DELETE_SCENE, UPDATE_ATTACHMENTS,
    UPDATE_PART_IDS, TOGGLE_CURTAIN
} from '../../../actions/scriptEditor';

//styling
import s from '../ScriptItem.module.scss';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';


const ScriptItem = memo((props) => {

    ScriptItem.displayName = 'ScriptItem'

    //utility consts
    const dispatch = useDispatch();


    // get specific props
    const { id = null,
        sceneId = null,
        alignRight = false,
        isViewAsPartPerson = false,
        curtainOpen = null,
        previousCurtainOpen = null,
        previousFocusId = null,
        nextFocusId = null,
        zIndex,
        sceneNumber = null,
    } = props;

    log(logType, 'props:', props)

    //Redux state

    const focus = useSelector(state => (state.scriptEditor.scriptItemInFocus[id])) || false
    const isUndoInProgress = useSelector(state => (state.scriptEditor.currentUndo[sceneId]))
    const scriptItem = useSelector(state => state.scriptEditor.currentScriptItems[id]) || {}
    const viewStyle = useSelector(state => state.scriptEditor.viewStyle) || CHAT
    const currentUser = useSelector(state => state.user.currentUser)
    const readOnly = isScriptReadOnly(currentUser)
    log(logType, 'redux:', { focus, isUndoInProgress, scriptItem, readOnly})

    const { type, commentId, nextId } = scriptItem;

    //internal state
    const [showMedia, setShowMedia] = useState(false)

    //icon ids
    const curtainCheckboxId = `curtain-checkbox-${scriptItem?.id}`;
    const partSelectorId = `part-selector-${scriptItem?.id}`
    const confirmUndoId = `confirm-undo-${sceneId}`;
    const undoId = `undo-${sceneId}`
    const redoId = `redo-${sceneId}`
    const deleteSceneId = `delete-scene-${sceneId}`

    //calculations functions
    const showParts = () => {
        switch (type) {
            case DIALOGUE: return true;
            default: return false;
        }
    }



    const handleShowMedia = (value = null) => {

        log(logType, 'handleShowMedia', { showMedia: showMedia, value: value })
        if (value === null) {
            setShowMedia(!showMedia)
        } else {
            setShowMedia(value)
        }
    }

    const handleMedia = (type, media) => {

        let urls = []

        if (Array.isArray(media)) {
            urls = media
        } else {
            urls = [media]
        }

        let updatedAttachments = [...scriptItem.attachments]

        switch (type) {
            case 'add': updatedAttachments = [...updatedAttachments, ...urls]; break;
            case 'remove': updatedAttachments = updatedAttachments.filter(attachment => !urls.includes(attachment)); break;
            default: return;
        }

        dispatch(trigger(UPDATE_ATTACHMENTS, { scriptItem, value: updatedAttachments }))
    }

    const finalCurtainOpen = (curtainOpen !== null) ? curtainOpen : scriptItem.curtainOpen


    log(logType, 'rendering:', { id })

    return (

        <div id={id}
            className={classnames('script-item',
                s['script-item'],
                s[type?.toLowerCase()],
                (alignRight & viewStyle === CHAT) ? s['align-right'] : null,
                (viewStyle === CLASSIC && isViewAsPartPerson) ? s.highlight : null,
                (finalCurtainOpen) ? s['curtain-open'] : s['curtain-closed'],
                s[viewStyle],
                (nextId === null) ? s['final-script-item'] : null)}

            style={{ zIndex: zIndex }}
        >

            {scriptItem && showParts() &&

                <div id={partSelectorId} className={s['script-item-parts']}>
                    <PartSelector
                        id={`part-selector-${scriptItem.id}`}
                        key={id}
                        sceneId={sceneId}
                        allocatedPartIds={scriptItem.partIds}
                        onSelect={(selectedPartIds) => dispatch(trigger(UPDATE_PART_IDS, { scriptItem, value: selectedPartIds }))}
                    />
                </div>



            }
            <div className={`${s['script-item-text-area']} ${s[viewStyle]}`}>
                <ScriptItemText
                    key={id}
                    scriptItem={scriptItem}
                    previousCurtainOpen={previousCurtainOpen}
                    toggleMedia={(value) => handleShowMedia(value)}
                    previousFocusId={previousFocusId}
                    nextFocusId={nextFocusId}
                    isUndoInProgress={isUndoInProgress}
                    sceneNumber={sceneNumber}
                    viewStyle={viewStyle}
                />

            </div>
            {scriptItem && ((showMedia && focus) || (scriptItem.attachments?.length > 0)) &&
                <div className={`${s['dropzone']} ${s[viewStyle.toLowerCase()]}`}>
                    <MediaDropzone
                        existingMediaURLs={scriptItem.attachments}
                        addMedia={(media) => handleMedia('add', media)}
                        removeMedia={(media) => handleMedia('remove', media)}
                        showControls={(showMedia && focus)}
                        autoLoad={true}
                        readOnly={readOnly}
                    />
                </div>
            }

            {(commentId) &&
                <Comment id={commentId} />
            }

            {/*Elements specific for each scriptItem type*/}

            {(type === SCENE) && (readOnly === false) &&
                <div className={s['scene-controls']}>
                    {isUndoInProgress &&
                        <Button id={confirmUndoId} key={confirmUndoId} size='xs' color="primary" onClick={() => dispatch(trigger(CONFIRM_UNDO))} >confirm undo</Button>
                    }
                    {!readOnly && <Icon id={undoId} key={undoId} icon="undo" onClick={() => dispatch(trigger(UNDO, { sceneId: scriptItem.id }))} toolTip="Undo" />}
                    {!readOnly &&
                        <Icon id={redoId}
                            key={redoId}
                            className={isUndoInProgress ? s['show-redo'] : s['hide-redo']}
                            icon="redo" onClick={() => dispatch(trigger(REDO, { sceneId: scriptItem.id }))} toolTip="Redo" />}
                {/*    <Icon id={printSceneId} key={printSceneId} icon="print" onClick={() => handlePrint()} toolTip="Print scene"></Icon>*/}
                    {!readOnly && <Icon id={deleteSceneId} key={deleteSceneId} icon="trash" onClick={() => dispatch(trigger(DELETE_SCENE, { scriptItem }))} toolTip="Delete scene" />}

                </div>
            }
            {scriptItem && CURTAIN_TYPES.includes(type) && !readOnly &&
                <>
                    <div id={curtainCheckboxId} className={`${s['curtain-checkbox']} ${s[viewStyle.toLowerCase()]} ${s[viewStyle]} ${finalCurtainOpen ? s['curtain-open'] : s['curtain-closed']}`}>
                        <CheckBox key={scriptItem.id}
                            id={'checkbox-' + curtainCheckboxId}
                            checked={scriptItem.tags.includes(OPEN_CURTAIN)}
                            onChange={() => dispatch(trigger(TOGGLE_CURTAIN, { scriptItem }))}
                            toolTip="Toggle Curtain"
                            ios={true} />
                    </div>
                    <QuickToolTip id={curtainCheckboxId} tip="Toggle Curtain" />
                </>

            }
            {scriptItem &&
                <CurtainBackground curtainOpen={finalCurtainOpen} />
            }

        </div>
    )
})

export default ScriptItem;