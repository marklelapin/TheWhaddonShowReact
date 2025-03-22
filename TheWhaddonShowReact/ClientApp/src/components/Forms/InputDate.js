import React from 'react';
import { Input } from 'reactstrap';
import classnames from 'classnames';
import s from './Forms.module.scss';

function InputDate(props) {
    const { label, placeholder = '', onChange, value = '', className = '' } = props;

    return (
        <div className={classnames(s.inputDate, className)}>
            {label && <div className={s.label}>{`${label}:`}</div>}
            <Input
                className={s.input}
                type="date"
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}

export default InputDate;