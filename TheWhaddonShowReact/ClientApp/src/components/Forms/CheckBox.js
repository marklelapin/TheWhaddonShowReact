import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';


function CheckBox(props) {
    const { strapColor, label ,id, checked, onChange} = props

    const checkboxId = () => {
        return `checkbox-${id}`
    }


    return (
        <FormGroup className={`checkbox abc-checkbox abc-checkbox-${strapColor}`} check>
            <Input id={checkboxId()} type="checkbox" checked={checked} onChange={onChange}/>{' '}
            <Label for={checkboxId()} check>
                {label}
            </Label>
        </FormGroup>
    )
}

export default CheckBox