import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from 'components/Icons/Icons';

function TagButton(props) {

    let { tag, tagOptions, strapColor, onClickAdd, onClickRemove} = props

    if (tag === null) {

        return (
            < UncontrolledDropdown > {/*//classsName=tag?*/}
                < DropdownToggle
                    color={strapColor}
                    outline
                >
                    Add tag
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
        < UncontrolledDropdown  >
            < DropdownToggle
                color={strapColor}
            >
                <div onClick={onClickRemove}>{tag}<Icon icon="cross"/></div>
            </DropdownToggle >
        </UncontrolledDropdown >
    )

}

export default TagButton;