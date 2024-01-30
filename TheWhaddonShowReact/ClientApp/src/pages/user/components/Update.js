
import React from 'react';
import {useDispatch } from 'react-redux';
import CheckBox from '../../../components/Forms/CheckBox';
import { Button } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';

import { prepareUpdate } from '../../../dataAccess/localServerUtils'
import { addUpdates } from '../../../actions/localServer';
import { PERSON } from '../../../dataAccess/localServerModels';

import axios from 'axios';
import config from '../../../config';

import { log, USER_UPDATE as logType } from '../../../dataAccess/logging';
import s from '../Users.module.scss';
function Update(props) {

    const { user, type, userChanged, onChange, className, onClickUpdate, isNew } = props

    const dispatch = useDispatch()
    /*  const {userChanged,newUser } = props*/


    //Functionality for both table and modal.

    const saveButtonConfig = () => {

        if (!userChanged) {
            return {
                disabled: true,
                text: 'No changes',
                color: 'tertiary'
            }
        }
        if (isNew === true) {
            return {
                disabled: false,
                text: 'Add User',
                color: 'danger'
            }
        }

        return {
            disabled: false,
            text: 'Update',
            color: 'danger'
        }
    }



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
                console.error("Error sending login link: " + error.message)
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





    const headers = () => {
        return (<th className={className}>Active</th>)
    }

    const row = () => {

        const button = saveButtonConfig();


        return (
            <td className={className}>
                < div className="user-update">

                    <CheckBox id={`isActive-${user.id}`} strapColor="primary" checked={user.isActive} onChange={(e) => onChange('isActive', e.target.checked)} />
                    <Button id="save" color={button.color} disabled={button.disabled} onClick={onClickUpdate}>{button.text}</Button></div>
                    <div className={s.loginSection}>
                    <div className={s.msalLink}>{user.msalLink ? `sub: ${user.msalLink.substring(0, 5)}...` : 'sub: none'}</div>
                        loginLink:
                        {user.msalLink && <Icon icon="cross" onClick={onClickRemoveMsalLink} />}
                    <Icon icon="search" onClick={onClickGetLoginLink} />
                        <Icon icon="paper-plane" onClick={onClickSendLoginLink} />
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
