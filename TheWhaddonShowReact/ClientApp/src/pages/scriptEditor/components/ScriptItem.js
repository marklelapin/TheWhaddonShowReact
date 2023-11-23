
//React and Redux
import React from 'react';
import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addUpdates } from '../../../actions/localServer';
import { updateShowComments } from '../../../actions/scriptEditor';
//Components
import Comment from './Comment';

import ScriptItemText from './ScriptItemText';
import PartSelector from './PartSelector';
import { Icon } from '../../../components/Icons/Icons';
import { Button } from 'reactstrap';
import MediaDropzone from '../../../components/Uploaders/MediaDropzone';
import CurtainBackground from './CurtainBackground';
//utilities
import { log } from '../../../helper';
import { prepareUpdate, prepareUpdates } from '../../../dataAccess/prepareUpdate';
import {
    newScriptItemsForToggleCurtain,
    newScriptItemsForAddComment,
    clearCurtainTags
} from '../scripts/scriptItem';
import { moveFocusToId } from '../scripts/utility';
//Constants
import { SCENE, DIALOGUE, STAGING, INITIAL_STAGING, CURTAIN_TYPES } from '../../../dataAccess/scriptItemTypes';
import { SCRIPT_ITEM } from '../../../dataAccess/localServerModels';
import { DOWN } from '../scripts/utility';
//styling
import s from '../ScriptItem.module.scss';


function ScriptItem(props) {

    //utility consts
    const debug = true;
    const moment = require('moment');
    const dispatch = useDispatch();
    // get specific props
    const { id = null,
        created = null,
        sceneId = null,
        sceneNumber = null,
        alignRight = false,
        curtainOpen = null,
        zIndex = 0,
        previousFocusId = null,
        nextFocusId = null
    } = props;

    const createdString = moment(created).format('YYYY-MM-DDTHH:mm:ss.SSS')

    log(debug, 'Component:ScriptItem', { id, created })

    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments) || true
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[sceneId]) || []
    const focus = useSelector(state => (state.scriptEditor.focus[id])) || false
    const isUndoInProgress = useSelector(state => state.scriptEditor.isUndoInProgress) || null


    const scriptItemHistory = useSelector(state => state.scriptEditor.scriptItemHistory[id]) || []
    const scriptItem = scriptItemHistory.find(item => item.created === createdString) || {}
    const { type, commentId } = scriptItem;

    log(debug, 'Component:ScriptItem scriptItemHistory:', scriptItemHistory)
    log(debug, 'Component:ScriptItem scriptItem:', scriptItem)

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

    const header = () => {
        switch (type) {
            case DIALOGUE:
                if (scenePartPersons) {
                    log(debug, 'ScriptItem: changePart scriptItem:', scriptItem)
                    log(debug, 'ScriptItem:  changePart scenePartPersons', scenePartPersons)
                    const partPersons = scriptItem.partIds.map(partId => scenePartPersons.partPersons.find(partPerson => partPerson.id === partId))

                    const partNames = partPersons.map(partPersons => partPersons?.name).join(',')

                    return partNames || '-'
                }; break;
            case SCENE:
                return `Scene ${sceneNumber}.` || null
            case STAGING:
                return 'Staging' || null
            case INITIAL_STAGING:
                return 'Initial Staging' || null

            default: return null;
        }

    }

    const handleShowMedia = (value = null) => {

        if (isUndoInProgress) { dispatch(triggerConfirmUndo()); } //automatically confirms undo if started to add media.

        log(debug, 'handleShowMedia', { showMedia: showMedia, value: value })
        if (value === null) {
            setShowMedia(!showMedia)
        } else {
            setShowMedia(value)
        }
    }

    const handleMedia = (type, media) => {

        if (isUndoInProgress) { dispatch(triggerConfirmUndo()); } //automatically confirms undo if started to add media.

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

        handleChange('attachments', updatedAttachments)
    }



    const handleChange = (type, value) => {

        let newUpdate = null;
        let newUpdates = [];

        switch (type) {
            case 'text': newUpdate = { ...scriptItem, text: value }; break;;
            case 'partIds': newUpdate = { ...scriptItem, partIds: value }; break;
            case 'tags': newUpdate = { ...scriptItem, tags: value }; break;
            case 'attachments': newUpdate = { ...scriptItem, attachments: value }; break;
            case 'type': newUpdate = { ...scriptItem, type: value };

                if (CURTAIN_TYPES.includes(value)) { //its going to a curtain type
                    newUpdate = newScriptItemsForToggleCurtain(newUpdate, true) //set it to open curtain.
                } else if (CURTAIN_TYPES.includes(scriptItem.type)) { //i.e. its coming from a curtain type
                    newUpdate.text = '';
                    newUpdate = clearCurtainTags(newUpdate)
                }
                break;
            case 'toggleCurtain': newUpdate = newScriptItemsForToggleCurtain(scriptItem); break;
            case 'addComment':
                newUpdates = newScriptItemsForAddComment(scriptItem)
                dispatch(updateShowComments(true))
                break;

            //These actions require access to scriptItems outside of this one and are processed in ScriptEditorProcesser component to avoid continual re-rendering of this component.
            case 'deleteComment':
                dispatch(triggerDeleteComment(scriptItem))
                break;
            case 'addScriptItemBelow':
                dispatch(triggerAddScriptItem(BELOW, scriptItem))
                break;
            case 'addScriptItemAbove':
                dispatch(triggerAddScriptItem(ABOVE, scriptItem))
                break;
            case 'deleteScriptItem':
                dispatch(triggerDeleteScriptItem(value, scriptItem)) //value = direction of deletion (UP or DOWN)
                break;
            case 'deleteNextScriptItem':
                dispatch(triggerDeleteNextScriptItem(scriptItem))
                break;
            case 'deleteScene':
                dispatch(triggerDeleteScene(scriptItem))
                break;
            default: return;
        }

        if (newUpdate) {
            const preparedUpdate = prepareUpdate(newUpdate)
            dispatch(addUpdates(preparedUpdate, SCRIPT_ITEM));
        }

        if (newUpdates) {
            const preparedUpdates = prepareUpdates(newUpdates)
            dispatch(addUpdates(preparedUpdates, SCRIPT_ITEM))
        }


    }

    const handleClick = (e, action) => {

        //if undoDateTime is set, then confirm undo if user is moving on different action.
        if (['undo', 'redo', 'confirmUndo'].includes(action) === false && isUndoInProgress) {
            dispatch(triggerConfirmUndo());
        }

        log(debug, `EventsCheck: handleClick: ${action},${scriptItem.id}`)
        switch (action) {
            case 'delete': handleChange('deleteScriptItem', DOWN); break;
            case 'deleteScene': handleChange('deleteScene', null); break;

            case 'undo': dispatch(triggerUndo()); break;
            case 'redo': dispatch(triggerRedo()); break;
            case 'confirmUndo': dispatch(triggerConfirmUndo()); break;
            case 'goToComment':
                dispatch(updateShowComments(true))
                moveFocusToId(scriptItem.commentid)
                    ; break;

            default: return;
        }
    }

    const finalCurtainOpen = (curtainOpen !== null) ? curtainOpen : scriptItem.curtainOpen

    return (
        <div id={id}
            className={`script-item ${s['script-item']} ${s[type?.toLowerCase()]}  ${(alignRight) ? s['align-right'] : ''} ${finalCurtainOpen ? s['curtain-open'] : s['curtain-closed']}`}
            style={{ zIndex: zIndex }}
        >

            {showParts() &&
                <div className={s['script-item-parts']}>
                    <PartSelector
                        key={id}
                        scriptItemId={id}
                        sceneId={sceneId}
                        allocatedPartIds={scriptItem.partIds}
                        onChange={(selectedPartIds) => handleChange('partIds', selectedPartIds)}
                    />
                </div>
            }
            <div ref={textInputRef} className={s['script-item-text-area']}>

                <ScriptItemText
                    key={id}
                    maxWidth={textInputRef.current?.offsetWidth}
                    scriptItem={scriptItem}
                    header={header()}
                    onClick={(action, value) => handleClick(action, value)}
                    toggleMedia={(value) => handleShowMedia(value)}
                    onChange={(type, value) => handleChange(type, value)}
                    previousFocusId={previousFocusId}
                    nextFocusId={nextFocusId}
                />

            </div>
            {((showMedia && focus) || (scriptItem.attachments?.length > 0)) &&
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
                <Comment id={commentId} onChange={(action, value) => handleChange(action, value)} />
            }

            {/*Elements specific for each scriptItem type*/}

            {(type === SCENE) &&
                <div className={s['scene-controls']}>
                    {scriptItem.undoDateTime &&
                        <Button size='xs' color="primary" onClick={(e) => handleClick(e, 'confirmUndo')} >confirm undo</Button>
                    }
                    <Icon icon="undo" onClick={(e) => handleClick(e, 'undo')} />
                    {scriptItem.undoDateTime &&
                        <Icon icon="redo" onClick={(e) => handleClick(e, 'redo')} />
                    }
                    <Icon icon="trash" onClick={(e) => handleClick(e, 'deleteScene', null)} />



                </div>
            }

            <CurtainBackground curtainOpen={finalCurtainOpen} />
        </div>
    )
}

export default ScriptItem;