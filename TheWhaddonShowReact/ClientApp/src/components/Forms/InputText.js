import React from 'react';
import { FormGroup, Input, Label, Col } from 'reactstrap';


function InputText(props) {
    const { label, placeholder, onChange, id, labelCols, textCols} = props

    const inputId = () => {
      return  `input-text-${id}`
    }

    if (label === undefined) {
        return (
            <Input type="text" placeholder={placeholder} onChange={onChange} />
        )

    } else {

        return (
            <FormGroup row className="personal-details">
                <Label for={inputId} md={labelCols} className="text-md-right">
                    {label}
                </Label>
                <Col md={textCols}>
                    <Input type="text" id={inputId} placeholder={placeholder}/>
                </Col>
            </FormGroup>
        )
    }





}

export default InputText