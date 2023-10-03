import React from 'react';
import TextareaAutosize from 'react-autosize-textarea';


import { log } from 'helper';
import PartSelector from './PartSelector';

import s from 'pages/forms/elements/Elements.module.scss';

function Dialogue(props) {

    const debug = true;

    const { onChange, onBlur, scriptItem,  scenePartIds = [], onKeyDown, } = props;

    const { id, text, partIds: allocatedPartIds = [] } = scriptItem;

    log(debug, 'DialogueProps', props)
    log(debug, 'Dialogue scriptItem', scriptItem)

    return (

        <div className="dialogue">
            
            <PartSelector
                scriptItem={scriptItem}
                scenePartIds={scenePartIds}
                allocatedPartIds={allocatedPartIds}
                onChange={(partIds) => onChange('partIds', partIds)}
            /> 

            <TextareaAutosize
                key={id}
                placeholder="..."
                className={`form-control ${s.autogrow} transition-height dialogue-input text-input`}
                value={text || ''}
                onChange={(event) => onChange('text', event.target.value)}
                onBlur={onBlur}
                onKeyDown={(e) => onKeyDown(e)}
            />

        </div>

    )



    //<div className={`${s.chatMessage} ${owner ? s.owner : ''}`}>
    //    {showAvatar
    //        ? <div className={`${s.messageAvatar}`}><Avatar user={user} size={size} showStatus={showStatus} /></div>
    //        : null}
    //    {message.text ?
    //        <p className={s.messageBody}>
    //            {message.text}
    //        </p> : ''}

    //    {message.attachments ? message.attachments.map(attachment => (
    //        <p key={uuid()} className={`${s.messageBody} ${s.messageAttachment}`}>
    //            {attachment.type === 'image' ?
    //                <img src={attachment.src} alt="attachment" />
    //                : null}
    //        </p>
    //    )) : null}

    //    <small className="d-block text-muted">
    //        {this.messageDate(message)}
    //    </small>
    //</div>



}

export default Dialogue;