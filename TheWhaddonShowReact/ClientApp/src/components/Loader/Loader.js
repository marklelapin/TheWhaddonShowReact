import React from 'react';
import cx from 'classnames';
import s from './Loader.module.scss';

const Loader = (props) => {

    const { size = 21,className = null,text=null, color='black' } = props;
    return (
        <div className={cx(s.root, className)}>
            {text && <p style={{ fontSize: `${size}px` }}>{text}</p>}

            <i className="fa-solid fa-spinner" style={{ fontSize: `${size}px`, color: color }} />
        </div>
    );

}

export default Loader;
