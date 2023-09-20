import React from 'react';
import CheckBox from 'components/Forms/CheckBox';

import TagsInput from 'components/Forms/TagsInput';

function Update(props) {

    const {className, user, tagOptions, onClickAdd, onClickRemove, type } = props

    const headers = () => {
        return (<th className={className}>Tags</th>)
    }

    const row = () => {
        return (

            <td className={className}>
                <TagsInput tags={user.tags} strapColor="primary" tagOptions={tagOptions}
                    onClickAdd={onClickAdd}
                    onClickRemove={onClickRemove} />
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
