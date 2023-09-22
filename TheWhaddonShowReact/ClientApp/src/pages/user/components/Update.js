import React from 'react';
import { Button } from 'reactstrap'; // eslint-disable-line no-unused-vars }
import CheckBox from 'components/Forms/CheckBox';

function Update(props) {

    const { user, type, userChanged, onChange, className ,onClickUpdate, onClickCancel, isNew} = props


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


    const headers = () => {
        return (<th className={className}>Active</th>)
    }

    const row = () => {

        const button = saveButtonConfig();


        return (
            <td className={className}>
                < div className="user-update">

                    <CheckBox id={`isActive-${user.id}`} strapColor="primary" checked={user.isActive} onChange={onChange} />

                    <Button id="save" type="submit" color={button.color} size="xs" onClick={onClickUpdate} className={(button.disable) ? 'disabled' : ''}>{button.text}</Button>
                    {userChanged && <Button id="cancel" type="button" color="secondary" size="xs" onClick={onClickCancel} >Cancel</Button>}
                </div >
            </td>
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
