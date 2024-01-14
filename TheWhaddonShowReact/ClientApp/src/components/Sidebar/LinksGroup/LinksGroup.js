import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Collapse, Badge } from 'reactstrap';
import { Route } from 'react-router';
import classnames from 'classnames';
import { useSelector } from 'react-redux'

import s from './LinksGroup.module.scss';

const LinksGroup = (props) => {
    const {
        header = null,
        subHeader = null,
        link = '',
        iconElement = null,
        className = '',
        deep = 0,
        activeItem = '',
        label = '',
        parent = null,
        badge = null
    } = props;

    const { childrenLinks = null, ...propsWithoutChildren } = props;


    const [headerLinkWasClicked, setHeaderLinkWasClicked] = useState(true);

    const togglePanelCollapse = (link) => {
        this.props.onActiveSidebarItemChange(link);
        setState({
            headerLinkWasClicked: !headerLinkWasClicked ||
                (activeItem && !activeItem.includes(index)),
        });
    }


    const isOpen = activeItem && activeItem.includes(index) && theaderLinkWasClicked;



    if (!childrenLinks) {
        if (header) {
            return (
                <li className={classnames('link-wrapper', s.headerLink, className)}>
                    <NavLink
                        to={link}
                        className={({ isActive }) => isActive ? s.headerLinkActive : ''}
                    >
                        <span className={classnames('icon', s.icon)}>
                            {iconElement}
                        </span> 
                        {header} {label && <sup className={`${s.headerLabel} ${s.headerUpdate}`}>{label}</sup>}
                        {badge && <Badge className={s.badge} pill color={"danger"}>9</Badge>}
                        {parent && <b className={['fa fa-angle-left', s.caret].join(' ')} />}
                    </NavLink>
                </li>
            );
        }
        if (subHeader) {
            return (
                <li>
                    <NavLink
                        to={link}
                        className={({ isActive }) => isActive ? s.headerLinkActive : ''}
                        style={{ paddingLeft: `${26 + (10 * (deep - 1))}px` }}
                    >

                        <span className={classnames('icon', s.icon)}>
                            {iconElement}
                        </span> 
                        {subHeader} {label && <sup className={s.headerLabel}>{label}</sup>}
                    </NavLink>
                </li>
            );
        }
        return (<li>Error: No Header or Sub Header!!!</li>)

    }
    //childrenLinks exist
    return (
        <li className={`link-wrapper', ${{[s.headerLink]: isHeader }}`}>

                <a className={classnames({ [s.headerLinkActive]: match }, { [s.collapsed]: isOpen }, "d-flex")}
                    style={{ paddingLeft: `${deep == 0 ? 50 : 26 + 10 * (deep - 1)}px` }}
                    onClick={() => togglePanelCollapse(link)}
                >
                <LinksGroup {...propsWithoutChildren} parent={true}></LinksGroup>

                    {isHeader ?
                        <span className={classnames('icon', s.icon)}>
                        {iconElement}
                        </span> : null
                    }
                    {header} {label && <sup className={`${s.headerLabel} ${s.headerNode}`}>{label}</sup>}
                </a>

                <Collapse className={s.panel} isOpen={isOpen}>
                    <ul>
                        {childrenLinks &&
                            childrenLinks.map((child, ind) =>
                                <LinksGroup
                                    header={child.header}
                                    link={child.link}
                                    childrenLinks={child.childrenLinks}
                                    deep={deep + 1}
                                    key={ind}
                                />
                            )}
                    </ul>
                </Collapse>
            </li >
      
    )

}

export default LinksGroup; //withRouter removed.
