import React from 'react';
import {useSelector} from 'react-redux'; 
import CheckBox from '../../../components/Forms/CheckBox';
import classnames from 'classnames';
import { isDemoUser } from '../../../dataAccess/userAccess';
import s from '../Users.module.scss';

function Roles(props) {

    const { person = {}, type, strapColor, onChange, className } = props

    const { isActor = false, isSinger = false, isWriter = false, isBand = false, isTechnical = false, isAdmin = false, id } = person


    const authenticatedUser = useSelector(state => state.user.currentUser)

    const isDemo = isDemoUser(authenticatedUser)



    const headers = () => {

        return (
            <>
                <th className={classnames(s.centerHorizontally, className)}>Actor</th>
                <th className={classnames(s.centerHorizontally, className)}>Singer</th>
                <th className={classnames(s.centerHorizontally, className)}>Writer</th>
                <th className={classnames(s.centerHorizontally, className)}>Band</th>
                <th className={classnames(s.centerHorizontally, className)}>Technical</th>
                <th className={classnames(s.centerHorizontally, className)}>Admin</th>
            </>
        )
    }

    

    const row = () => {

        return (
            <>
                <td className={classnames(s.center, className)} >
                    <div className={s.checkboxContainer}>
                        <CheckBox id={`isActor-${id}`} strapColor={strapColor} checked={isActor} onChange={(e) => onChange('isActor', e.target.checked)} centered />
                    </div>
                </td>
                <td className={classnames(s.center, className)}>
                    <div className={s.checkboxContainer}>
                            <CheckBox id={`isSinger-${id}`} strapColor={strapColor} checked={isSinger} onChange={(e) => onChange('isSinger', e.target.checked)} centered />
                </div>
                </td>
                <td className={classnames(s.center, className)}>
                    <div className={s.checkboxContainer}>
                        <CheckBox id={`isWriter-${id}`} strapColor={strapColor} checked={isWriter} onChange={(e) => onChange('isWriter', e.target.checked)} centered disabled={isDemo} />
                    </div>
                </td>
                <td className={classnames(s.center, className)}>
                    <div className={s.checkboxContainer}>
                        <CheckBox id={`isBand-${id}`} strapColor={strapColor} checked={isBand} onChange={(e) => onChange('isBand', e.target.checked)} centered />
                    </div>
                </td>
                <td className={classnames(s.center, className)}>
                    <div className={s.checkboxContainer}>
                        <CheckBox id={`isTechnical-${id}`} strapColor={strapColor} checked={isTechnical} onChange={(e) => onChange('isTechnical', e.target.checked)} centered />
                    </div>
                </td>
                <td className={classnames(s.center, className)}>
                    <div className={s.checkboxContainer}>
                        <CheckBox id={`isAdmin-${id}`} strapColor={strapColor} checked={isAdmin} onChange={(e) => onChange('isAdmin', e.target.checked)} centered disabled={isDemo} />
                    </div>
                </td>
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
