import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';


function CheckBox(props) {
    const { strapColor, label ,id, key, checked = false, onChange} = props

    const checkboxId = () => {
        return `checkbox-${id || key}`
    }

    const checkboxKey = () => {
        return `checkbox-${key || id}`
    }

    return (


        <FormGroup className={`checkbox abc-checkbox abc-checkbox-success`} check> 
            <>
                <Input type="checkbox" id={checkboxId()} key={checkboxKey()}  checked={checked} onChange={onChange} />
                <Label for={checkboxId()} check>
                    {label}
                </Label>    
       </>
       
            
       </FormGroup>
    )
}

export default CheckBox