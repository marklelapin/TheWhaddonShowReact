import React from 'react';

import TagsInput from '../../../components/Forms/TagsInput';

import classnames from 'classnames'
import s from '../Users.module.scss';

function Update(props) {

    const { className, user, tagOptions, onChange, type } = props


    const headers = () => {
        return (<th className={className}>Tags</th>)
    }

    const row = () => {
        return (

            <td className={classnames(s.center, className)}>
                <div className={s.tagsContainer}>
                    <TagsInput tags={user.tags} strapColor="primary" tagOptions={tagOptions}
                        onClickAdd={(tag) => onChange('addTag', tag)}
                        onClickRemove={(tag) => onChange('removeTag', tag)} />
                </div>
            </td>
        )
    }

    if (type === "headers") return headers();

    if (type === "row") return row();

    if (type === "table") return (
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

export default Update
