import React from 'react';
import CheckBox from '../../../components/Forms/CheckBox';

function Roles(props) {
   
    const { person = {}, type, strapColor, onChange, className } = props

    const { isActor = false, isSinger = false, isWriter = false, isBand = false, isTechnical = false, isAdmin = false,id } = person

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
                <td className={className}><CheckBox id={`isActor-${id}`} strapColor={strapColor} checked={isActor} onChange={(e)=>onChange('isActor',e.target.checked)} /></td>
                <td className={className}><CheckBox id={`isSinger-${id}`} strapColor={strapColor} checked={isSinger} onChange={(e)=>onChange('isSinger',e.target.checked)} /></td>
                <td className={className}><CheckBox id={`isWriter-${id}`} strapColor={strapColor} checked={isWriter} onChange={(e)=>onChange('isWriter',e.target.checked)} /></td>
                <td className={className}><CheckBox id={`isBand-${id}`} strapColor={strapColor} checked={isBand} onChange={(e)=>onChange('isBand',e.target.checked)} /></td>
                <td className={className}><CheckBox id={`isTechnical-${id}`} strapColor={strapColor} checked={isTechnical} onChange={(e)=>onChange('isTechnical',e.target.checked)} /></td>
                <td className={className}><CheckBox id={`isAdmin-${id}`} strapColor={strapColor} checked={isAdmin} onChange={(e)=>onChange('isAdmin',e.target.checked)} /></td>
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
                    <tr >
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
