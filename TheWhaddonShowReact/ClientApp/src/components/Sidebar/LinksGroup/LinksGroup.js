import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Collapse, Badge } from 'reactstrap';
import { Route } from 'react-router';
import classnames from 'classnames';
import { useSelector } from 'react-redux'

import s from './LinksGroup.module.scss';

const LinksGroup = (props) => {
    const {
        link = '',
        childrenLinks = null,
        className = '',
        isHeader = false,
        deep = 0,
        activeItem = '',
        label = '',
        exact = true
    } = props;



    const sidebarColor = useSelector(state => state.layout.sidebarColor);

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
        if (isHeader) {
            return (
                <li className={classnames('link-wrapper', s.headerLink, className)}>
                    <NavLink
                        to={link}
                        activeClassName={s.headerLinkActive}
                        exact={exact}
                        target={target}
                    >
                        <span className={classnames('icon', s.icon)}>
                            {iconElement ? iconElement : <i className={`fi ${iconName}`} />}
                        </span>
                        {header} {label && <sup className={`${s.headerLabel} ${s.headerUpdate}`}>{label}</sup>}
                        {badge && <Badge className={s.badge} pill color={"danger"}>9</Badge>}
                    </NavLink>
                </li>
            );
        }
        return (
            <li>
                <NavLink
                    to={link}
                    activeClassName={s.headerLinkActive}
                    style={{ paddingLeft: `${26 + (10 * (deep - 1))}px` }}
                    onClick={(e) => {
                        // able to go to link is not available(for Demo)
                        if (link.includes('menu')) {
                            e.preventDefault();
                        }
                    }}
                    exact={exact}
                >
                    {header} {label && <sup className={s.headerLabel}>{label}</sup>}
                </NavLink>
            </li>
        );
    }

    return (
        <Route
            path={link}//eslint-disable-next-line
            children={(params) => {
                const { match } = params;
                
                return (
                    <li className={classnames('link-wrapper', { [s.headerLink]: isHeader }, className)}>
                        <a className={classnames({ [s.headerLinkActive]: match }, { [s.collapsed]: isOpen }, "d-flex")}
                            style={{ paddingLeft: `${deep == 0 ? 50 : 26 + 10 * (deep - 1)}px` }}
                            onClick={() => togglePanelCollapse(link)}
                        >
                            {isHeader ?
                                <span className={classnames('icon', s.icon)}>
                                    {iconElement ? iconElement : <i className={`fi ${iconName}`} />}
                                </span> : null
                            }
                            {header} {label && <sup className={`${s.headerLabel} ${s.headerNode}`}>{label}</sup>}
                            <b className={['fa fa-angle-left', s.caret].join(' ')} />
                        </a>

                        <Collapse className={s.panel} isOpen={isOpen}>
                            <ul>
                                {childrenLinks &&
                                    childrenLinks.map((child, ind) =>
                                        <LinksGroup
                                            onActiveSidebarItemChange={onActiveSidebarItemChange}
                                            activeItem={activeItem}
                                            header={child.header}
                                            link={child.link}
                                            index={child.index}
                                            childrenLinks={child.childrenLinks}
                                            deep={deep + 1}
                                            key={ind}
                                        />,
                                    )}
                            </ul>
                        </Collapse>
                    </li>
                );
            }}
        />
    );
}

export default LinksGroup; //withRouter removed.
