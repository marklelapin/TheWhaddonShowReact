import React from 'react';
import TagButton from './TagButton';
import s from './Forms.module.scss';
function TagsInput(props) {

    let { tags = [], tagOptions, strapColor, onClickRemove, onClickAdd, id, readOnly = false } = props

    /*try {*/

        const dropdownId = () => {
            return `dropdown-${id}`
        }

        const remainingTagOptions = () => {

            return tagOptions.filter((tagOption) => !tags.includes(tagOption))//removes any tagOptions that are already in tags

        }

    return (

        <div key={dropdownId()} className={s.tagsInput} >

                {tags.map((tag) => {
                    return <TagButton key={`${dropdownId()}-${tag}`} tag={tag} strapColor={strapColor} onClickRemove={onClickRemove} onClickAdd={onClickAdd} readOnly={readOnly} />
                })}

                {(remainingTagOptions().length > 0) && !readOnly && (<TagButton tag={null} tagOptions={remainingTagOptions()} onClickAdd={onClickAdd} />)}


            </div>

        )
    //}
    //catch (error) {
    //    throw new Error('TagsInput Error: check tags and tagOptions are arrays and that onClickRemove an onClickAdd functions are present.',error)
    //}


}

export default TagsInput;