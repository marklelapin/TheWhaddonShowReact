import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';

//Components
import { Collapse, Badge } from 'reactstrap';
import CaretPin from './CaretPin'


//utils
import classnames from 'classnames';
import { isMobileDevice } from '../../../core/screenHelper';
import { closeSidebar } from '../../../actions/navigation';
//css
import s from './LinksGroup.module.scss';

const LinksGroup = (props) => {
    const {
        header = null,
        link = null,
        iconElement = null,
        className = '',
        label = '',
        badge = null,
        childrenLinks = null,
        onToolClick = null,
    } = props;

    const dispatch = useDispatch();

    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(true);


    useEffect(() => {
        if (location.pathName === link) {
            setIsCollapsed(false);
        } else {
            setIsCollapsed(true);
        }
    }, [location]) //eslint-disable-line react-hooks/exhaustive-deps


    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    }

    const handleCloseSidebar = () => {
        if (isMobileDevice) {
            dispatch(closeSidebar())
        }
    }

    const handleToolClick = (e) => {
        e.preventDefault();
        if (onToolClick) { onToolClick(); }
        handleCloseSidebar()
    }

    const linkJSX = (link, header, childrenLinks, onToolClick, iconElement, label, badge, indent = 36, key = null) => (
        <>
            {((link === null) || childrenLinks || onToolClick) &&
                <div
                    className={classnames(s.listItem, isCollapsed ? null : s.headerLinkActive)}
                    onClick={(childrenLinks) ? () => toggleCollapse() : (onToolClick) ? (e) => handleToolClick(e) : () => handleCloseSidebar()}
                    style={{ paddingLeft: `${indent}px` }}
                >
                    {linkContentJSX(header, childrenLinks, iconElement, label, badge)}
                </div>

            }
            {link !== null && !childrenLinks && !onToolClick &&
                <NavLink
                    to={link}
                    key={key ? key : header + (link)}
                    onClick={() => handleCloseSidebar()}
                    className={classnames(s.listItem,location.pathname ===link ? s.headerLinkActive : null)}
                    style={{ paddingLeft: `${indent}px` }}
                >
                    {linkContentJSX(header, childrenLinks, iconElement, label, badge)}
                </NavLink>
            }
        </>
    )

    const linkContentJSX = (header, childrenLinks, iconElement, label, badge) => (
        <>
            <div className={s.icon}>
                {iconElement}
            </div>
            <div className={s.header}>
                {header}
                {label && <sup className={s.headerLabel}>{label}</sup>}
                {badge && <Badge className={s.badge} pill color={"danger"}>{badge}</Badge>}
            </div>
            {childrenLinks && <CaretPin isCollapsed={isCollapsed} />}

        </>
    )

    return (
        <li className={classnames('link-wrapper', s.headerLink, className)}>
            {linkJSX(link, header, childrenLinks, onToolClick, iconElement, label, badge)}
            {childrenLinks &&
                <Collapse className={s.panel} isOpen={!isCollapsed || location.pathname.startsWith(link)}>
                    <ul>
                        {childrenLinks.map((child, index) => (
                            linkJSX(child.link, child.header, child.childrenLinks, child.onToolClick, child.iconElement, child.label, child.badge, 36, index)
                        ))}
                    </ul>
                </Collapse>
            }
        </li>
    );
}


export default LinksGroup; //withRouter removed.
