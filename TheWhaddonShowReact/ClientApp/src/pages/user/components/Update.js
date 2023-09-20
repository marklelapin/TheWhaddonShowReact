import React from 'react';
import { Button } from 'reactstrap'; // eslint-disable-line no-unused-vars }
import CheckBox from 'components/Forms/CheckBox';

function Update(props) {

    const { user, type, userChanged, onChange, className } = props

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
        if (user.id === null) {
            return {
                disabled: false,
                text: 'Add',
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

                    <CheckBox id="isActive" strapColor="primary" checked={user.isActive} onChange={onChange} />

                    <Button id="save" type="submit" color={button.color} size="xs" className={(button.disable) ? 'disabled' : ''}>{button.text}</Button>

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
