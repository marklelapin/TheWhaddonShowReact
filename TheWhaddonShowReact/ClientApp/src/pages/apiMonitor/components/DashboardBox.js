import React from 'react'
import classnames from 'classnames';
import s from './DashboardBox.module.scss'

const DashboardBox = (props) => {

    const {id, title, note, children = null, bigContent = null, triggerRefresh = 1 } = props;

    const isNoData = (children === null && bigContent === null)

    return (
        (triggerRefresh > 0) && (

            <div id={id} className={s.box} >
                <h4 className={s.header}>{title}</h4>
                {!isNoData &&
                    <div className={classnames(s.content, bigContent ? s.big : null)}>
                        {children || bigContent}
                    </div>
                }
                {isNoData &&
                    <div className={s.big}>
                        no data
                    </div>
                }
                    <div className={s.footer}>{note}</div>
                </div>

        )
    )

}

export default DashboardBox