
import React from 'react';
import { useDispatch } from 'react-redux';

import { closeSidebar } from '../../../actions/navigation';


import { NavLink } from 'react-router-dom';

//Components
import { Badge } from 'reactstrap';
import CaretPin from './CaretPin'
import classnames from 'classnames';
//utils
import { isMobileDevice } from '../../../core/screenHelper';
import s from './LinksGroup.module.scss';


const Link = (props) => {

    const dispatch = useDispatch()
    
    const { link, header, childrenLinks, onToolClick, iconElement, label, badge, isCollapsed, toggleCollapse } = props;

    



    const handleCloseSidebar = () => {
        if (isMobileDevice()) {
            console.log('Linkhandleclosesidebar')
            dispatch(closeSidebar())
        }
    }

    const handleToolClick = (e) => {
        e.preventDefault();
        if (onToolClick) { onToolClick(); }
        handleCloseSidebar()
    }

    const handleToggleCollapse = (e) => {
        e.preventDefault();
        if (toggleCollapse) { toggleCollapse(); }
    }

    return (

        <>
            {((link === null) || childrenLinks || onToolClick) &&
                <NavLink
                    className={classnames(s.listItem, isCollapsed ? null : s.headerLinkActive)}
                    onClick={(childrenLinks) ? (e) => handleToggleCollapse(e) : (onToolClick) ? (e) => handleToolClick(e) : (e) => handleCloseSidebar(e)}
                  
                >
                    {linkContentJSX(header, childrenLinks, iconElement, label, badge, isCollapsed)}
                </NavLink>

            }
            {link !== null && !childrenLinks && !onToolClick &&
                <NavLink
                    to={link}
                    onClick={() => handleCloseSidebar()}
                    className={classnames(s.listItem, location.pathname === link ? s.headerLinkActive : null)}
                   
                >
                    {linkContentJSX(header, childrenLinks, iconElement, label, badge, isCollapsed)}
                </NavLink>
            }
        </>

    )
}

export default Link;


const linkContentJSX = (header, childrenLinks, iconElement, label, badge, isCollapsed) => (
    <>
        <div className={s.icon}>
            {iconElement}
        </div>
        <div className={classnames(s.header,isMobileDevice() ? s.mobile : null)}>
            {header}
            {label && <sup className={s.headerLabel}>{label}</sup>}
            {badge && <Badge className={s.badge} pill color={"danger"}>{badge}</Badge>}
        </div>
        {childrenLinks && <CaretPin isCollapsed={isCollapsed} />}

    </>
)