import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';

//Components
import { Collapse, Badge } from 'reactstrap';
import CaretPin from './CaretPin'


//utils
import classnames from 'classnames';
import { isScreenSmallerThan } from '../../../core/screenHelper';
import { closeSidebar } from '../../../actions/navigation';
//css
import s from './LinksGroup.module.scss';

const LinksGroup = (props) => {
    const {
        header = null,
        subHeader = null,
        link = '',
        iconElement = null,
        className = '',
        deep = 0,
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

    const handleNavLinkClick = (childrenLinks) => {

        if (!childrenLinks && isScreenSmallerThan('md')) {
            dispatch(closeSidebar())
        }

    }

    const handleToolClick = (e) => {
        e.preventDefault();
        if (onToolClick) { onToolClick(); }
    }

    const titleJSX = (
        <>
                <span className={classnames('icon', s.icon)}>
                    {iconElement}
                </span>
                {header}
                {subHeader}
                {label && <sup className={s.headerLabel}>{label}</sup>}
        </>
    )




    if (onToolClick !== null) return (
        <li className={classnames('link-wrapper', s.headerLink, className)}>
        <NavLink key={header} onClick={(e)=>handleToolClick(e)} >
            {titleJSX}
            </NavLink>
        </li>
        )
    if (onToolClick === null) return (
        <li className={classnames('link-wrapper', s.headerLink, className)}>
            <NavLink
                to={link}
                key={link}
                onClick={() => handleNavLinkClick(childrenLinks)}
                className={({ isActive }) => isActive ? s.headerLinkActive : ''}
            >
                <span className={classnames('icon', s.icon)}>
                    {iconElement}
                </span>
                {titleJSX}
                {badge && <Badge className={s.badge} pill color={"danger"}>9</Badge>}
                {childrenLinks && <CaretPin isCollapsed={isCollapsed} onClick={() => toggleCollapse()} />}
            </NavLink>
            {childrenLinks &&
                <Collapse className={s.panel} isOpen={!isCollapsed}>
                    <ul>
                        {childrenLinks.map((child, ind) => (
                            <NavLink
                                key={link + ind}
                                to={child.link}
                                onClick={() => handleNavLinkClick(childrenLinks)}
                                className={({ isActive }) => isActive ? s.headerLinkActive : ''}
                                style={{ paddingLeft: `${26 + (10 * (deep - 1))}px` }}
                            >
                                <span className={classnames('icon', s.icon)}>
                                    {iconElement}
                                </span>
                                {titleJSX}
                            </NavLink>
                        ))}
                    </ul>
                </Collapse>
            }


        </li>
    );
}


export default LinksGroup; //withRouter removed.
