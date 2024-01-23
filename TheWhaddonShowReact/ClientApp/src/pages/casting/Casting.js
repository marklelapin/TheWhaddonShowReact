import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//component
import Avatar from '../../components/Avatar/Avatar';

//utilities
import classnames from 'classnames';
import { getLatest } from '../../dataAccess/localServerUtils';
import { addFriendlyName } from '../../dataAccess/personScripts';

//scss
import './Casting.module.scss';
import ScriptSummary from '../scriptSummary/ScriptSummary';

const Casting = (props) => {

    const personsHistory = useSelector(state => state.localServer.persons.history)
    const persons = getLatest(personsHistory)
    const scriptItems = useSelector(state => state.scriptEditor.currentScriptItems)
    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    const cast = addFriendlyName(persons.filter(person => person.isActor || person.isSinger))

    const castWithParts = cast //getCastWithParts(cast,partPersons,scriptItems)


    return (
        <>
            <h1>Casting</h1>
            <div className={s.castingContainer}>

                <div className={s.castSection}>
                    {castWithParts.map(castMember => 
                        <>
                            <Avatar person={castMember} avatarInitials={(castMember.avatarInitials) || null} />
                            <span >{castMemeber.friendlyName || castMember.name}</span>
                        </>
                    )
                    }
                </div>
                <div className={s.summarySection}>
                    <ScriptSummary summaryType={CASTING} />
                </div>
            </div>
        </>


    )



}
export default Casting;

