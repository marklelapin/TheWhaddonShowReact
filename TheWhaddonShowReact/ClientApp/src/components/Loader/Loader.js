import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import s from './Loader.module.scss';

const Loader = (props) => {

    const { size = 21 } = props;
    return (
        <div className={cx(s.root, this.props.className)}>
            <i className="la la-spinner la-spin" style={{ fontSize: this.props.size }} />
        </div>
    );

}

export default Loader;
