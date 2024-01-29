import React from 'react';


//component
import Avatar from '../../../components/Avatar/Avatar';
import { Progress } from 'reactstrap';

//utils
import { log, CAST_MEMBER as logType } from '../../../dataAccess/logging';
import classnames from 'classnames';
//scss
import s from '../Casting.module.scss';


const CastMember = (props) => {
    log(logType, 'props', { props })
    const { castMember, highestWordCount, onClick, active } = props

    const wordCount = castMember.wordCount
    const wordCountPercentage = (highestWordCount ? (castMember.wordCount / highestWordCount) * 100 : 0).toFixed(0)
    const sceneCount = castMember.scenes.length
    const lineCount = castMember.lineCount

    return (

        <div key={castMember.person.id} className={classnames(s.castMemberContainer, 'clickable', active ? s.active : null)} onClick={onClick} >
            <div className={s.castAvatar}>
                <Avatar person={castMember.person} avatarInitials={(castMember.person.avatarInitials) || null} color= '#e9ecef' />
            </div>
           
            <div className={s.castSummary}>
                <div className={s.name}>{castMember.person.friendlyName || castMember.person.name}</div>
                <div className={s.wordCountLine}>
                    <Progress className="mb-sm" value={wordCountPercentage} style={{height: '5px'} }></Progress>
                </div>
                <div className={s.summaryLine}>
                    <div className={s.castStat}>
                        {`Scenes: ${sceneCount}, `}
                    </div>
                    <div className={s.castStat}>
                        {`Lines: ${lineCount}, `}
                    </div>
                    <div className={s.castStat}>
                        {`Words: ${wordCount}` }
                    </div>
                </div>
            </div>

        </div>
    )

}
export default CastMember;

