import React from 'react';
import { FormGroup, Input, Label} from 'reactstrap';


function CheckBox(props) {
    const {  label, id, checked = false, onChange, ios = false} = props

    const checkboxKey = () => {
        return `checkbox-${id}`
    }


    return (
        <>

            {!ios &&
                <div className="form-check" style={{ margin: 'auto', display: 'block' } }>

                    <input className="form-check-input" type="checkbox" id={id} key={checkboxKey()} checked={checked} onChange={onChange} />

                    <label className="form-check-label" htmlFor={id} >
                        {label}
                    </label>
                </div>


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