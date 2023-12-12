import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';


function CheckBox(props) {
    const { strapColor, label, id, checked = false, onChange, ios = false } = props

    const checkboxId = () => {
        return `checkbox-${id}`
    }

    const checkboxKey = () => {
        return `checkbox-${id}`
    }

    return (
        <>
        
        {!ios &&
            <FormGroup className="checkbox abc-checkbox abc-checkbox-success" check>

            <Input type="checkbox" id={checkboxId()} key={checkboxKey()} checked={checked} onChange={onChange} />

            <Label for={checkboxId()} check >
                {label}
            </Label>
        </FormGroup>
        
        
            }
            {ios &&
                <FormGroup className="display-inline-block checkbox-ios">
                    <Label for={checkboxId()} className="switch">
                        <Input type="checkbox" id={checkboxId()} key={checkboxKey()} className="ios" checked={checked} onChange={onChange} /><i />
                    </Label>
                </FormGroup>
            
            }
        
        
        </>
        

    )
}

export default CheckBox