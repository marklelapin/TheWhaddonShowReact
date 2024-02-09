import React from 'react';
import { useSelector } from 'react-redux';
import { userAccessToComponent, WRITE } from '../../../dataAccess/userAccess';
import InputText from '../../../components/Forms/InputText';
import Avatar from '../../../components/Avatar/Avatar';
import s from '../Users.module.scss';
import { log, PERSONAL_DETAILS as logType } from '../../../dataAccess/logging';
import classnames from 'classnames';
function PersonalDetails(props) {

    const authenticatedUser = useSelector(state => state.user.authenticatedUser)
    const hasWriteAccess = userAccessToComponent(authenticatedUser, 'Users') === WRITE

    const { person = {}, type, onChange } = props

    const { firstName = '', lastName = null } = person

    const email = hasWriteAccess ? person.email : '####'

    log(logType, 'PersonalDetails person', { person, hasWriteAccess, authenticatedUser, email })


    let fullName = ''

    if (lastName === null) { fullName = firstName }
    else if (lastName === '') { fullName = firstName + ' ' }
    else { fullName = firstName + ' ' + lastName }



    const headers = () => {
        return (
            <>
                <th className={s.centerHorizontally}>Avatar</th>
                <th className="no-shrink">Personal Details</th>
            </>

        )

    }

    const row = () => {
        return (
            <>
                <td className={classnames(s.avatarCell, s.center)}>
                    <div className={s.avatarContainer}>
                        <Avatar person={person} onChange={(pictureRef) => onChange('avatar', pictureRef)} />
                    </div>
                </td>
                <td className={classnames(s.personalDetailsCell, s.centerVertically)} >
                    <div className={s.personalDetailsContainer}>
                        <InputText className={s.fullName} placeholder="Enter first and last name" value={fullName} onChange={(e) => onChange('name', e.target.value)} />
                        <InputText className={s.email} placeholder="Enter email" value={email} onChange={(e) => onChange('email', e.target.value)} />
                    </div>



                </td>



            </>
        )
    }



    if (type === 'headers') return headers()

    if (type === 'row') return row()

    if (type === 'table') return (
        <table>
            <thead>
                <tr>
                    {headers()}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {row()}
                </tr>
            </tbody>
        </table>
    )

}

export default PersonalDetails;