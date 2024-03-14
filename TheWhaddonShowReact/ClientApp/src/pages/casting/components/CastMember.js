import React from 'react';


import { useDispatch } from 'react-redux';
import { trigger, ALLOCATE_PERSON_TO_PART, } from '../../../actions/scriptEditor';
//component
import Avatar from '../../../components/Avatar/Avatar';
import { Progress } from 'reactstrap';
import QuickToolTip from '../../../components/Forms/QuickToolTip';
//utils
import { log, CAST_MEMBER as logType } from '../../../dataAccess/logging';
import classnames from 'classnames';
//scss
import s from '../Casting.module.scss';


const CastMember = (props) => {

    const dispatch = useDispatch();

    log(logType, 'props', { props })
    const { castMember, highestWordCount, onClick, active = false, setTempPerson = null } = props

    const wordCount = castMember.wordCount
    const wordCountPercentage = (highestWordCount ? (castMember.wordCount / highestWordCount) * 100 : 0).toFixed(0)
    const sceneCount = castMember.scenes.length
    const lineCount = castMember.lineCount


    const castMemberId = () => {
        return `cast-member-${castMember.person.id}`
    }

    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", `personid:${castMember.person.id}`);
        if (setTempPerson) {
            setTempPerson(castMember.person)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()

        const deallocateDiv = getDeallocateDiv(e)
        log(logType, 'dragOver1', e.dataTransfer.getData("text/plain"))
        const isPartId = (e.dataTransfer.getData("text/plain").substring(0, 6) === "partid")
        if (deallocateDiv && isPartId) {
            //log(logType,'dragOver2',deallocateDiv)
            deallocateDiv.classList.add(s.dragOver)
            setTempPerson(null)
        }
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        const currentElement = e.currentTarget
        const deallocateDiv = getDeallocateDiv(currentElement)
        if (deallocateDiv) {
            deallocateDiv.classList.remove(s.dragOver)
            setTempPerson(false)
        }

    }
    const handleDrop = (e) => {
        e.preventDefault()
        const deallocateDiv = getDeallocateDiv(e)
        const isPartId = (e.dataTransfer.getData("text/plain").substring(0, 6) === "partid")

        if (deallocateDiv && isPartId) {
            const partId = e.dataTransfer.getData("text/plain").substring(7)
            const personId = null;
            log(logType, 'handlePartDrop', { partId, personId })
            dispatch(trigger(ALLOCATE_PERSON_TO_PART, { partId, personId: null }))
            setTempPerson(false)
        }

    }

    const getDeallocateDiv = (e) => {
        let deallocateDiv = null
        let currentElement = e.currentTarget
        while (currentElement) {
            // log(logType,'classList',currentElement.classList)
            if (currentElement.classList.contains('deallocatePartOnDrop')) {
                deallocateDiv = currentElement
                break
            }
            currentElement = currentElement.parentElement
        }
        return deallocateDiv
    }



    return (
        <>
            <div key={castMember.person.id}
                id={castMemberId()}
                className={classnames(s.castMemberContainer, 'clickable', active ? s.active : null)}
                onClick={onClick}
                data-personid={castMember.person.id}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragStart={handleDragStart}
                draggable={true}
            >
                <div className={s.castAvatar}>
                    <Avatar person={castMember.person} avatarInitials={(castMember.person.avatarInitials) || null} color='#e9ecef' />
                </div>

                <div className={s.castSummary}>
                    <div className={s.name}>{castMember.person.friendlyName || castMember.person.name}</div>
                    <div className={s.wordCountLine}>
                        <Progress className="mb-sm" value={wordCountPercentage} style={{ height: '5px' }}></Progress>
                    </div>
                    <div className={s.summaryLine}>
                        <div className={s.castStat}>
                            {`Scenes: ${sceneCount}, `}
                        </div>
                        <div className={s.castStat}>
                            {`Lines: ${lineCount}, `}
                        </div>
                        <div className={s.castStat}>
                            {`Words: ${wordCount}`}
                        </div>
                    </div>
                </div>

            </div>
            <QuickToolTip id={castMemberId()} target={castMemberId()} placement='top' tip='click to view, drag to allocate' />


        </>

    )

}
export default CastMember;

