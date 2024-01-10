import React from 'react';
import InputText from '../../../components/Forms/InputText';
import Avatar from '../../../components/Avatar/Avatar';



function PersonalDetails(props) {

    const { person = {}, type, onChange } = props

    const { firstName = '', lastName = null, email = '' } = person

    let fullName = ''

    if (lastName === null) { fullName = firstName }
    else if (lastName === '') { fullName = firstName + ' ' }
    else {fullName = firstName + ' ' + lastName }


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
                    <Avatar person={person} onChange={(pictureRef)=>onChange('avatar',pictureRef)} />
                </td>
                <td className="personal-details no-shrink" >

                    <div>
                        <InputText className="full-name" placeholder="Enter first and last name" value={fullName} onChange={(e)=>onChange('name',e.target.value)} />
                    </div>
                    <div>
                        <InputText className="email" placeholder="Enter email" value={email} onChange={(e)=>onChange('email',e.target.value)} />
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