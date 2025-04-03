import React from 'react';
import { Input } from 'reactstrap';
import classnames from 'classnames';
import s from './Forms.module.scss';


function InputDateTime(props) {
    const { label, placeholder = '', onChange, value = '', className = '' } = props;

    // Ensure the value is correctly formatted for "datetime-local" input
    const dateTime = value
        ? new Date(value).toISOString().slice(0, 16)  // Format YYYY-MM-DDTHH:MM
        : '';

    return (
        <div className={classnames(s.inputDate, className)}>
            {label && <div className={s.label}>{`${label}:`}</div>}
            <Input
                className={s.input}
                type="datetime-local"
                value={dateTime}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}

export default InputDateTime;

