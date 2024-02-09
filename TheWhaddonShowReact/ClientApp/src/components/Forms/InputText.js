import React from 'react';
import { Input } from 'reactstrap';
import classnames from 'classnames';
import s from './Forms.module.scss';

function InputText(props) {
    const { label, placeholder = '', onChange, id, value = '',className = '' } = props

    const inputId = () => {
        return `input-text-${id}`
    }

    return (
        <div className={classnames(s.inputText, `${ className }`)} >
            {label && <div className={s.label}>{`${label}: `}</div>}
            <Input className={s.input} type="text" id={inputId} value={value || ''} onChange={onChange} placeholder={placeholder} />
        </div>
    )
}


export default InputText