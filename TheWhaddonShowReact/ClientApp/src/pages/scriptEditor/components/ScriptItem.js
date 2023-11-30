
//React and Redux
import React from 'react';
import { memo, useState, useRef } from 'react';
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
//utilities
import { log } from '../../../helper';
//Constants
import { SCENE, DIALOGUE, CURTAIN_TYPES } from '../../../dataAccess/scriptItemTypes';
//trigger types
import {
    trigger,
    REDO, UNDO, CONFIRM_UNDO,
    DELETE_SCENE, UPDATE_ATTACHMENTS,
    UPDATE_PART_IDS, TOGGLE_CURTAIN
} from '../../../actions/scriptEditor';

//styling
import s from '../ScriptItem.module.scss';


const ScriptItem = memo((props) => {

    //utility consts
    const debug = true;
    const dispatch = useDispatch();


    // get specific props
    const { id = null,
        sceneId = null,
        alignRight = false,
        curtainOpen = null,
        previousFocusId = null,
        nextFocusId = null,
        zIndex
    } = props;

    log(debug, 'Component:ScriptItem props:', props)

    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments) || true

    const focus = useSelector(state => (state.scriptEditor.scriptItemInFocus[id])) || false
    const isUndoInProgress = useSelector(state => (state.scriptEditor.isUndoInProgress[id]))
    const scriptItem = useSelector(state => state.scriptEditor.currentScriptItems[id]) || {}


    log(debug, 'Component:ScriptItem redux:', { showComments, focus, isUndoInProgress, scriptItem })

    const { type, commentId } = scriptItem;



    //Refs
    const textInputRef = useRef(null)


    //internal state
    const [showMedia, setShowMedia] = useState(false)


    //calculations functions
    const showParts = () => {
        switch (type) {
            case DIALOGUE: return true;
            default: return false;
        }
    }



    const handleShowMedia = (value = null) => {

        dispatch(trigger(CONFIRM_UNDO)); //automatically confirms undo if started to add media.

        log(debug, 'handleShowMedia', { showMedia: showMedia, value: value })
        if (value === null) {
            setShowMedia(!showMedia)
        } else {
            setShowMedia(value)
        }
    }

    const handleMedia = (type, media) => {

        dispatch(trigger(CONFIRM_UNDO));  //automatically confirms undo if started to add media.

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

    return (

        <div id={id}

            className={`script-item ${s['script-item']} ${s[type?.toLowerCase()]}  ${(alignRight) ? s['align-right'] : ''} ${finalCurtainOpen ? s['curtain-open'] : s['curtain-closed']}`}
            style={{ zIndex: zIndex }}
        >

            {scriptItem && showParts() &&
                <div className={s['script-item-parts']}>
                    <PartSelector
                        key={id}
                        sceneId={sceneId}
                        allocatedPartIds={scriptItem.partIds}
                        onSelect={(selectedPartIds) => dispatch(trigger(UPDATE_PART_IDS, { scriptItem, value: selectedPartIds }))}
                    />
                </div>
            }
            <div ref={textInputRef} className={s['script-item-text-area']}>

                <ScriptItemText
                    key={id}
                    maxWidth={textInputRef.current?.offsetWidth}
                    scriptItem={scriptItem}
                    toggleMedia={(value) => handleShowMedia(value)}
                    previousFocusId={previousFocusId}
                    nextFocusId={nextFocusId}
                    isUndoInProgress={isUndoInProgress}
                />

            </div>
            {scriptItem && ((showMedia && focus) || (scriptItem.attachments?.length > 0)) &&
                <div className={s['dropzone']}>
                    <MediaDropzone
                        existingMediaURLs={scriptItem.attachments}
                        addMedia={(media) => handleMedia('add', media)}
                        removeMedia={(media) => handleMedia('remove', media)}
                        showControls={(showMedia && focus)}
                        autoLoad={true}
                    />
                </div>
            }

            {(commentId) && (showComments) &&
                <Comment id={commentId} />
            }

            {/*Elements specific for each scriptItem type*/}

            {(type === SCENE) &&
                <div className={s['scene-controls']}>
                    {isUndoInProgress &&
                        <Button size='xs' color="primary" onClick={() => dispatch(trigger(CONFIRM_UNDO))} >confirm undo</Button>
                    }
                    <Icon icon="undo" onClick={() => dispatch(trigger(UNDO, { sceneId: scriptItem.id }))} />
                    {isUndoInProgress &&
                        <Icon icon="redo" onClick={() => dispatch(trigger(REDO, { sceneId: scriptItem.id }))} />
                    }
                    <Icon icon="trash" onClick={() => dispatch(trigger(DELETE_SCENE, { scriptItem }))} />



                </div>
            }
            {scriptItem && CURTAIN_TYPES.includes(type) &&

                <CheckBox checked={scriptItem.curtainOpen} onChange={() => dispatch(trigger(TOGGLE_CURTAIN({ scriptItem })))} ios={true} />
            }
            {scriptItem &&
                <CurtainBackground curtainOpen={finalCurtainOpen} />
            }

        </div>
    )
})

export default ScriptItem;