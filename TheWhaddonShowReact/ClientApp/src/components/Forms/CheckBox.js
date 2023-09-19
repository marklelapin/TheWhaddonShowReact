import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';


function CheckBox(props) {
    const { strapColor, label ,id, checked, onChange} = props

    const checkboxId = () => {
        return `checkbox-${id}`
    }


    return (
        <FormGroup className={`checkbox abc-checkbox abc-checkbox-${strapColor}`} check>
            <Label for={checkboxId()} check>
                {label}
            </Label>
            <Input  type="checkbox" checked={checked} onChange={onChange} />{' '}
            
        </FormGroup>
    )
}

export default CheckBox