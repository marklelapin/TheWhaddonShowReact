
import React from 'react';
import { useDispatch,useSelector } from 'react-redux';
import CheckBox from '../../../components/Forms/CheckBox';
import { Button } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';

import { prepareUpdate } from '../../../dataAccess/localServerUtils'
import { addUpdates } from '../../../actions/localServer';
import { PERSON } from '../../../dataAccess/localServerModels';
import InputText from '../../../components/Forms/InputText';
import axios from 'axios';
import config from '../../../config';
import classnames from 'classnames';
import { log, USER_UPDATE as logType } from '../../../dataAccess/logging';
import s from '../Users.module.scss';
import { isDemoUser } from '../../../dataAccess/userAccess';
function Update(props) {

    const { user, type, userChanged, onChange, className, onClickUpdate, onClickCancel, isNew } = props

    const dispatch = useDispatch()
    /*  const {userChanged,newUser } = props*/

    const authenticatedUser = useSelector(state => state.user.currentUser)
    const isDemo = isDemoUser(authenticatedUser)


    const [showSub, setShowSub] = React.useState(false)

    const onClickGetLoginLink = () => {
        alert('https://www.thewhaddonshow.org/app/loginlink?id=' + user.id)
    }
    const onClickRemoveMsalLink = () => {
        const newUser = { ...user, msalLink: null }
        const preparedUpdate = prepareUpdate(newUser)
        dispatch(addUpdates(preparedUpdate, PERSON))  //saves the user to the redux store where it will be synced separately.
    }
    const onClickSendLoginLink = async () => {
        if (!user.email) return alert('No email address for this user')
        try {
            const response = await sendLoginLink(user)
            if (response.status === 200) {
                alert('Login link sent to ' + user.email)
            } else {
                alert('Failed to send login link to ' + user.email + '. See console for more information.')
            }
        } catch (error) {
            console.error("Error sending login link: " + error.message)
        }
    }
    const sendLoginLink = async (person) => {
        const firstName = person.firstName
        const email = person.email
        const id = person.id
        const appUrl = config.baseURLApp
        const data = { firstName, email, id, appUrl }
        const url = `email/loginlink`
        try {
            const response = await axios.post(url, data);
            log(logType, 'post email/loginlink response: ', { dataSent: data, status: response.status })
            return (response)
        }
        catch (error) {
            console.error("Error posting loginlink: " + error.message)
        }
    }

    const toggleShowSub = (e) => {
        e.preventDefault();

        setShowSub(!showSub)
    }

    const headers = () => {
        return (<th className={className}>Active</th>)
    }

    const row = () => {

        return (
            <td className={classnames(s.center, className,s.updateCell)}>
                <div className={s.updateContainer} >
                    < div className={s.updateSection}>
                        <div className={s.isActive}>isActive:</div>
                        <div className={s.isActiveCheckbox}>
                            <CheckBox id={`isActive-${user.id}`} strapColor="primary" checked={user.isActive} onChange={(e) => onChange('isActive', e.target.checked)} disabled={isDemo} />
                        </div>
                        <div className={s.updateButtons}>
                            {(userChanged && !isNew) && <Button id="update" size='xs' color={'danger'} onClick={onClickUpdate}>Update</Button>}
                            {isNew && <Button id="add" size='xs' color={'danger'} onClick={onClickUpdate}>Add User</Button>}
                            {(isNew || userChanged) && <Button id="cancel" size='xs' color={'secondary'} onClick={onClickCancel}>Cancel</Button>}
                        </div>
                    </div>
                    {!isDemo && <div className={s.loginSection}>
                        <div className='me-2'>loginLink:</div>
                        <Icon icon="search" onClick={onClickGetLoginLink} label='view' className='me-2' noMargin />
                        <Icon icon="paper-plane" onClick={onClickSendLoginLink} label='send' className='me-2' noMargin />
                        <div className={classnames(s.linked, 'ms-2', 'clickable')} onClick={(e) => toggleShowSub(e)}>
                            {user.msalLink ? <Icon icon='tick' strapColor='success' noMargin /> : <Icon icon='add' strapColor='warning' noMargin />}

                        </div>

                    </div>}
                    { showSub &&
                        <div className={s.msalLinkSection}>
                            <InputText className={s.msalLink} label='sub' value={user.msalLink} onChange={(e) => onChange('msalLink', e.target.value)}></InputText>
                            <Icon icon="cross" onClick={onClickRemoveMsalLink} />
                        </div>
                    }

                </div>

            </td >
        )

    }


    if (type === "headers") return headers();
    if (type === "row") return row();
    if (type === "table") {

        return (
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


}

export default Update
