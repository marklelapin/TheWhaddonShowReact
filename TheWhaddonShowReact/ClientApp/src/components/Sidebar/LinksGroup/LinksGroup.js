import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Link from './Link';
//Components
import { Collapse } from 'reactstrap';



//utils
import classnames from 'classnames';

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

    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(null);

    useEffect(() => {
        setIsCollapsed(true);
    },[])

    useEffect(() => {
        if (location.pathName === link) {
            setIsCollapsed(false);
        } else {
            setIsCollapsed(true);
        }
    }, [location]) //eslint-disable-line react-hooks/exhaustive-deps


    const toggleCollapse = () => {
        console.log('toggleCollapse before:', `${header}-isCollapsed`)
        setIsCollapsed(!isCollapsed);
    }

    console.log(`${header}-isCollapsed: `,isCollapsed)
    return (
        <li className={classnames('link-wrapper', s.headerLink, className)}>
            {<Link
                key={link}
                link={link}
                header={header}
                childrenLinks={childrenLinks}
                onToolClick={onToolClick}
                iconElement={iconElement}
                label={label}
                badge={badge}
                isCollapsed={isCollapsed }
                toggleCollapse={toggleCollapse}
            />
            }
            {childrenLinks &&
                <Collapse className={s.panel} isOpen={!isCollapsed || location.pathname.startsWith(link)}>
                    <ul>
                        {childrenLinks.map((child, index) => (
                            <li className={s.panelLink} key={index}>
                             <Link
                                key={index}
                                link={child.link}
                                header={child.header}
                                childrenLinks={child.childrenLinks}
                                onTooleClick={child.onToolClick}
                                iconElement={child.iconElement}
                                label={child.label}
                                badge={child.badge}
                                indent={36}
                                index={index} />
                            
                            
                            </li>
                           

                        ))}
                    </ul>
                </Collapse>
            }
        </li>
    );
}


export default LinksGroup; //withRouter removed.
