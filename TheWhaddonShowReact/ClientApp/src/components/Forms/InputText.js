import React, { useState } from 'react';
import { Input } from 'reactstrap';
import classnames from 'classnames';
import s from './Forms.module.scss';

function InputText(props) {
    const { label, placeholder = '', onChange, value = '', className = '', options = [] } = props;
    const [dropdownValue, setDropdownValue] = useState(value);

    const handleDropdownChange = (e) => {
        setDropdownValue(e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className={classnames(s.inputText, className)}>
            {label && <div className={s.label}>{`${label}: `}</div>}
            <div className={s.inputWrapper}>
                {options.length == 0 &&
                <Input
                    className={s.input}
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                />}
                {options.length > 0 && (
                    <select className={s.input} value={dropdownValue} onChange={handleDropdownChange}>
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}

export default InputText;