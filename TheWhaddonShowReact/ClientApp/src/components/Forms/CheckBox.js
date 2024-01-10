import React from 'react';
import { FormGroup, Input, Label} from 'reactstrap';


function CheckBox(props) {
    const {  label, id, checked = false, onChange, ios = false } = props

    const checkboxKey = () => {
        return `checkbox-${id}`
    }


    return (
        <>

            {!ios &&
                <FormGroup className="checkbox abc-checkbox abc-checkbox-success" check>

                    <Input type="checkbox" id={id} key={checkboxKey()} checked={checked} onChange={onChange} />

                    <Label for={id} check >
                        {label}
                    </Label>
                </FormGroup>


            }
            {ios &&
                <FormGroup className="display-inline-block checkbox-ios">
                    <Label for={id} className="switch">
                        <Input type="checkbox" id={id} key={checkboxKey()} className="ios" checked={checked} onChange={onChange} /><i />
                    </Label>
                </FormGroup>

            }

        </>


    )
}

export default CheckBox