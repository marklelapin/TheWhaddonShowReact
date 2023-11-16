
//React and Redux
import React from 'react';
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

//Components
import Comment from './Comment';

import ScriptItemText from './ScriptItemText';
import PartSelector from './PartSelector';
import { Icon } from '../../../components/Icons/Icons';
import { Button } from 'reactstrap';
import MediaDropzone from '../../../components/Uploaders/MediaDropzone';
//utilities
import { log } from '../../../helper';

//Constants
import { SCENE, DIALOGUE, STAGING, INITIAL_STAGING , } from '../../../dataAccess/scriptItemTypes';

//styling
import s from '../ScriptItem.module.scss';

function ScriptItem(props) {

    //utility consts
    const debug = true;


    // get specific props
    const { scriptItem, scene, alignRight = false, onClick, onChange, moveFocus, undoDateTime, previousFocus = null, nextFocus = null } = props;

    log(debug, 'ScriptItemComment: scriptItem', scriptItem)
    //Redux state
    const showComments = useSelector(state => state.scriptEditor.showComments)
    const scenePartPersons = useSelector(state => state.scriptEditor.scenePartPersons[scene?.id])
    const focus = useSelector(state => (state.scriptEditor.focus[scriptItem.id]))

    //Refs
    const textInputRef = useRef(null)


    //internal state
    const [showMedia, setShowMedia] = useState(false)





    //calculations functions
    const showParts = () => {
        switch (scriptItem.type) {
            case DIALOGUE: return true;
            default: return false;
        }
    }

    const header = () => {
        switch (scriptItem.type) {
            case DIALOGUE:
                if (scenePartPersons) {
                    log(debug, 'ScriptItem: changePart scriptItem:', scriptItem)
                    log(debug, 'ScriptItem:  changePart scenePartPersons', scenePartPersons)
                    const partPersons = scriptItem.partIds.map(partId => scenePartPersons.partPersons.find(partPerson => partPerson.id === partId))

                    const partNames = partPersons.map(partPersons => partPersons?.name).join(',')

                    return partNames || '-'
                }; break;
            case SCENE:
                return `Scene ${scriptItem.sceneNumber}.` || null
            case STAGING:
                return 'Staging' || null
            case INITIAL_STAGING:
                return 'Initial Staging' || null

            default: return null;
        }

    }
    const label = () => {

        let label = null //default

        if ((scriptItem.type === SCENE) && scriptItem.number) {
            label = `Scene ${scriptItem.number}: `
        }
        //else
        return label
    }
    const handleShowMedia = (value = null) => {

        if (undoDateTime) { onClick('confirmUndo') }

        log(debug, 'handleShowMedia', { showMedia: showMedia, value: value })
        if (value === null) {
            setShowMedia(!showMedia)
        } else {
            setShowMedia(value)
        }
    }

    const handleMedia = (type, media) => {

        if (undoDateTime) { onClick('confirmUndo') }

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

        onChange('attachments', updatedAttachments)
    }

    log(debug, 'ScriptItemProps', props)
    log(debug, 'ScriptItem: showMedia', { showMedia: showMedia })
    log(debug, 'ScriptItem: focus', { focus: focus })

    const { id, type, comment } = scriptItem;



    return (
        <div id={id} className={`script-item ${s['script-item']} ${s[type?.toLowerCase()]} ${type?.toLowerCase()} ${(alignRight) ? s['align-right'] : ''} ${(alignRight) ? 'align-right' : ''}`} >                             

            {showParts() &&
                <div className="script-item-parts">
                    <PartSelector
                        scene={scene}
                        allocatedPartIds={scriptItem.partIds}
                        undoDateTime={undoDateTime}
                        onClick={onClick}
                        onChange={(selectedPartIds) => onChange('partIds', selectedPartIds)}
                    />
                </div>
            }
            <div ref={textInputRef} className={s['script-item-text-area']}>

                <ScriptItemText
                    key={id}
                    label={label()}
                    maxWidth={textInputRef.current?.offsetWidth}
                    scriptItem={scriptItem}
                    header={header()}
                    onClick={onClick}
                    toggleMedia={(value) => handleShowMedia(value)}
                    onChange={onChange}
                    undoDateTime={undoDateTime}
                    moveFocus={moveFocus}
                />

            </div>
            {((showMedia && focus) || (scriptItem.attachments?.length > 0)) &&
                <MediaDropzone
                    existingMediaURLs={scriptItem.attachments}
                    addMedia={(media) => handleMedia('add', media)}
                    removeMedia={(media) => handleMedia('remove', media)}
                    showControls={(showMedia && focus) || (scriptItem.attachments.length > 0 && focus)}
                    autoLoad={true}
                />
            }

            {(comment) && (showComments) &&

                <div id={comment.id} key={comment.id} className="script-item-comment">
                    <Comment comment={comment} />
                </div>

            }

            {/*Elements specific for each scriptItem type*/}

            {(type === SCENE) &&
                <div className="scene-controls">
                    {scriptItem.undoDateTime &&
                        <Button size='xs' color="primary" onClick={() => onClick('confirmUndo')} >confirm undo</Button>
                    }
                    <Icon icon="undo" onClick={() => onClick('undo')} />
                    {scriptItem.undoDateTime &&
                        <Icon icon="redo" onClick={() => onClick('redo')} />
                    }
                    <Icon icon="trash" onClick={() => onClick('deleteScene', null)} />



                </div>
            }

            <div className={`${s['left']} ${s['stage-curtain']} ${(scriptItem.curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
            <div className={`${s['right']} ${s['stage-curtain']} ${(scriptItem.curtainOpen) ? s['curtain-open'] : s['curtain-closed']}`}></div>
        </div>
    )
}

export default ScriptItem;