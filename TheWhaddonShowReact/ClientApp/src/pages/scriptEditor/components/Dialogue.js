import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input } from 'reactstrap';
import TextareaAutosize from 'react-autosize-textarea';
import Avatar from 'components/Avatar/Avatar';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';

import s from 'pages/forms/elements/Elements.module.scss';

function Dialogue(props) {


    const { onChange, scriptItem, parts = [], onKeyDown } = props;

    const { id, text, partIds = [] } = scriptItem;

    const [partsArray, setPartsArray] = useState([])


    useEffect(() => {

        const newPartsArray = parts.map(part => partIds.includes(part.id) ? { ...part, allocated: true } : { ...part, allocated: false })

        setPartsArray(newPartsArray)

    }, [])



    const [openPartSelector, setOpenPartSelector] = useState(false);

   
    const handlePartSelectorClick = (event, partId) => {

        if (partId === null) {

            onChange('partIds', [])

        }

        if (event.shiftKey) {

            const updatedPartsArray = partsArray.map(part => {
                if (part.id === partId) {
                    return { ...part, selected: !part.selected }
                }
                else {
                    return part
                }
            })

            setPartsArray(updatedPartsArray)

        } else {

            onChange('partIds', partId)
            setOpenPartSelector(false)

        }

    }

    const handlePartsSelectorConfirm = () => {

        const newPartIds = partsArray.filter(part => part.selected).map(part => part.id)

        onChange('partIds', newPartIds)
        setOpenPartSelector(false)

    }

    const isMultiSelect = () => {

        return partsArray.some(part => part.selected === true)
    }

    const togglePartSelector = () => {
        setOpenPartSelector(!openPartSelector)
    }

    console.log(openPartSelector)
    return (

        <div className="dialogue-container">
            <Dropdown isOpen={openPartSelector} toggle={togglePartSelector} >  {/*className={`${s.notificationsMenu}`}*/}
                <DropdownToggle nav >  {/*className={s.headerSvgFlipColor}*/}
                    <>
                        {partsArray.filter(part => part.allocated === true).map(part => {
                            return (<Avatar key={part.id} person={part} size="xs" avatarInitials={part.avatarInitials || null} />
                            )
                        })}
                        {(partsArray.some(part => part.allocated === true)) === false &&
                            < Avatar person={{ id: 0, firstName: 'clear' }} size="xs" avatarInitials="X" />

                        }
                    </>

                </DropdownToggle>
                (<DropdownMenu className={`super-colors`}>   {/*${s.headerDropdownLinks} */}
                    {(partIds.length > 0) &&
                        <>
                            < Avatar person={{ id: 0, firstName: 'clear' }} size="xs" avatarInitials="X" onClick={(event) => handlePartSelectorClick(event, null)} /><span>Clear all parts</span>
                            <DropdownItem divider />
                        </>
                    }
                    {(partsArray.length === 0) && 
                        <DropdownItem onClick={togglePartSelector} >No parts setup for this scene</DropdownItem>}
                    {partsArray.map(part => {

                        return (
                            <DropdownItem key={part.id} onClick={(event) => handlePartSelectorClick(event, part.id)} className={(part.selected === true) ? 'selected' : ''}>
                                <Avatar person={part} size="xs" avatarInitials={part.avatarInitials || null} />
                                <span>{part.name}</span>
                            </DropdownItem>
                        )

                    })}
                    {isMultiSelect() &&
                        <>
                            <DropdownItem divider />
                            <Button color="danger" sixe='xs' type="submit" onClick={() => handlePartsSelectorConfirm()}>Confirm</Button>
                        </>

                    }
                </DropdownMenu>
            </Dropdown>
            <div className="dialogue-triangle"></div>




            <TextareaAutosize
                key={id}
                placeholder="..."
                className={`form-control ${s.autogrow} transition-height dialogue-input text-input`}
                value={text || ''}
                onChange={(event) => onChange('text', event.target.value)}
                onKeyDown={onKeyDown}
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