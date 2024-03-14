import React from 'react'
import DataLoading from '../../../components/DataLoading/DataLoading'

import classnames from 'classnames';
import s from './DashboardBox.module.scss'

const DashboardBox = (props) => {

    const { id, title, note, children = null, bigContent = null, triggerRefresh = 1, loading = false } = props;

    const isNoData = (children === null && bigContent === null)

    const errorText = (typeof loading === 'string' && loading.startsWith('error') ? loading : null)


    return (
        (triggerRefresh > 0) && (

            <div id={id} className={s.box} >
                <h4 className={s.header}>{title}</h4>

                <DataLoading
                    isLoading={loading !== false}
                    spinnerSize={21}
                    loadingText="Loading..."
                    isError={errorText !==null}
                    errorText={errorText}
                >


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
                </DataLoading>
                <div className={s.footer}>{note}</div>
            </div>


        )
    )
}

export default DashboardBox