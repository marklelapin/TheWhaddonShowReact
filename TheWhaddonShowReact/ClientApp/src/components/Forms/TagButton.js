import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from '../../components/Icons/Icons';

function TagButton(props) {

    let { tag, tagOptions, strapColor, onClickAdd, onClickRemove} = props

    if (tag === null) {

        return (
            < UncontrolledDropdown className="tag-button"> {/*//classsName=tag?*/}
                < DropdownToggle
                    className={`btn-outline-${strapColor}`}
                    size="xs"
                    outline
                >
                    Add Tag
                </DropdownToggle >
                <DropdownMenu>

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
        < UncontrolledDropdown className="tag-button " >
            < DropdownToggle
                color={strapColor}
                size="xs"
            >
                <div onClick={()=>onClickRemove(tag)}>{tag}<Icon icon="cross"/></div>
            </DropdownToggle >
        </UncontrolledDropdown >
    )

}

export default TagButton;