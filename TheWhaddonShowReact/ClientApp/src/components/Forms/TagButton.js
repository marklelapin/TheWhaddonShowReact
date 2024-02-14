import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from '../../components/Icons/Icons';
import s from './Forms.module.scss';
function TagButton(props) {

    let { tag, tagOptions, strapColor, onClickAdd, onClickRemove} = props

    if (tag === null) {

        return (
            < UncontrolledDropdown className={s.tagButton}> {/*//classsName=tag?*/}
                < DropdownToggle
                    className={`btn-outline-${strapColor}`}
                    size="xs"
                    outline
                >
                    <div className={s.tag}>add</div>
                </DropdownToggle >
                <DropdownMenu className={s.dropdown}>

                    {tagOptions.map((tagOption) => {

                        return <DropdownItem key={tagOption} >
                            <div onClick={()=>onClickAdd(tagOption)}>{tagOption}</div> 
                        </DropdownItem>

                    })}

                </DropdownMenu>

            </UncontrolledDropdown >

        )

    }
    return (
        < UncontrolledDropdown className={s.tagButton} >
            < DropdownToggle
                color={strapColor}
                size="xs"
            >
                <div className={s.tag}>{tag}</div>
                <Icon icon="cross" onClick={() => onClickRemove(tag)} className={s.removeTag} noMargin />
            </DropdownToggle >
        </UncontrolledDropdown >
    )

}

export default TagButton;