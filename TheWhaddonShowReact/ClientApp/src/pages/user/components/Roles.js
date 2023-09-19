import React from 'react';
import CheckBox from '../../../components/Forms/CheckBox';

function Roles(props) {

    const { person, type, strapColor, onIsActorChange, onIsSingerChange, onIsWriterChange, onIsBandChange, onIsTechnicalChange, onIsAdminChange, className} = props


    const headers = () => {

        return (
            <>
                <th className={className} >Actor</th>
                <th className={className}>Singer</th>
                <th className={className}>Writer</th>
                <th className={className}>Band</th>
                <th className={className}>Technical</th>
                <th className={className}>Admin</th>
            </>
        )
    }

   

    const row = () => {

        return (
            <>
                <td className={className}><CheckBox id="isActor" strapColor={strapColor} checked={person.isActor} onChange={onIsActorChange}  /></td>
                <td className={className}><CheckBox id="isSinger" strapColor={strapColor} checked={person.isSinger} onChange={onIsSingerChange} /></td>
                <td className={className}><CheckBox id="isSinger" strapColor={strapColor} checked={person.isSinger} onChange={onIsSingerChange} /></td>
                <td className={className}><CheckBox id="isBand" strapColor={strapColor} checked={person.isBand} onChange={onIsBandChange}/></td>
                <td className={className}><CheckBox id="isTechnical" strapColor={strapColor} checked={person.isTechnical} onChange={onIsTechnicalChange} /></td>
                <td className={className}><CheckBox id="isAdmin" strapColor={strapColor} checked={person.isAdmin} onChange={onIsAdminChange} /></td>
            </>
        )
    }
    if (type === 'headers') return headers()

    if (type === 'row') return row()

    if (type === 'table') {


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

    return null;
}

export default Roles

    ;

 //can you give me the syntax for a table with one row and the following headers: Personal Details, Actor, Singer, Writer, Band, Technical, Admin, Tags, Update  
