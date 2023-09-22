import React from 'react';
import InputText from 'components/Forms/InputText';
import Avatar from 'components/Avatar/Avatar';



function PersonalDetails(props) {

    const { person = {}, type, onNameChange, onEmailChange, onAvatarChange } = props

    const { firstName = '', lastName ='', email ='' } = person 

    const headers = () => {
        return (
            <>
                <th>Avatar</th>
                <th className="no-shrink">Personal Details</th>
            </>

        )

    }

    const row = () => {
        return (
            <>
                <td>
                    <Avatar person={person} onChange={onAvatarChange} />
                </td>
                <td className="personal-details no-shrink" >

                    <div>
                        <InputText className="full-name" placeholder="Enter first and last name" value={firstName+' '+lastName} onChange={onNameChange} />
                    </div>
                    <div>
                        <InputText className="email" placeholder="Enter email" value={email} onChange={onEmailChange} />
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