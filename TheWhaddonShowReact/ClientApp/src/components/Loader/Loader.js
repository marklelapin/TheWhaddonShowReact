import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import s from './Loader.module.scss';

const Loader = (props) => {

    const { size = 21,className = null } = props;
    return (
        <div className={cx(s.root, className)}>
            <i className="la la-spinner la-spin" style={{ fontSize: size }} />
        </div>
    );

}

export default Loader;
