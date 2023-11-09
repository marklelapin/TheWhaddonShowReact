import React from 'react';
import CheckBox from '../../../components/Forms/CheckBox';

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

                    <Update id="save" hasChanged={userChanged} onClickUpdate={onClickUpdate} onClickCancel={onClickCancel} isNew={isNew} ></Update >
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
