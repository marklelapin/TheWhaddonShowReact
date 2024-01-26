import React from 'react';


//component
import Avatar from '../../../components/Avatar/Avatar';
import { Progress } from 'reactstrap';

//scss
import s from '../Casting.module.scss';


const CastMember = (props) => {

    const { castMember, highestWordCount } = props

    const wordCount = castMember.person.wordCount
    const wordCountPercentage = (highestWordCount ? (castMember.person.wordCount / highestWordCount) * 100 : 100).toFixed(0)
    const sceneCount = castMember.scenes.length
    const lineCount = castMember.parts.reduce((acc, part) => acc + part.lineCount, 0)

    return (

        <div key={castMember.person.id} className={s.castMemberContainer}>

            <Avatar person={castMember.person} avatarInitials={(castMember.person.avatarInitials) || null} />
            <div className={s.castSummary}>
                <div className={s.name}>{castMember.person.friendlyName || castMember.person.name}</div>
                <div className={s.wordCountLine}>
                    <Progress className="mb-sm" value={wordCountPercentage}></Progress>
                </div>
                <div className={s.summaryLine}>
                    <div className={s.castStat}>
                        <div className={s.castStatLabel}>Scenes:</div>
                        <div className={s.castStatValue}>{sceneCount}</div>
                    </div>
                    <div className={s.castStat}>
                        <div className={s.castStatLabel}>Lines:</div>
                        <div className={s.castStatValue}>{lineCount}</div>
                    </div>
                    <div className={s.castStatLine}>
                        <div className={s.castStatLabel}>Words:</div>
                        <div className={s.castStatValue}>{wordCount}</div>
                    </div>
                </div>
            </div>

        </div>
    )

}
export default CastMember;

