import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment'
//import DataLoading from '../../../components/DataLoading/DataLoading';
//import { updateIsLoading } from '../../../actions/apiMonitor'

//import {
//    Row,
//    Col,
//} from 'reactstrap';
//import {
//    Progress,
//    Dropdown,
//    DropdownMenu,
//    DropdownToggle,
//    DropdownItem,
//} from 'reactstrap';

//components
import { Icon } from '../../../components/Icons/Icons';

//utilities

//scss
import classnames from 'classnames';
import s from './ResultsTable.module.scss';

//import { TickOrCross } from '../../../components/Icons/Icons'





const ResultsTable = (props) => {

    const { collectionType = 'performance', dateFrom = null, dateTo = null, testOrCollectionId = null } = props;

    const defaultLimit = 100;
    const showAllLimit = 10000;

    const isMobileDevice = useSelector(state => state.device.isMobileDevice)

    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(defaultLimit);
    const [tableData, setTableData] = useState([]);
    const [noOfRecords, setNoOfRecords] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);


    useEffect(() => {
        refreshTableData();
    }, [collectionType, dateFrom, dateTo, skip,limit, testOrCollectionId]) //eslint-disable-line react-hooks/exhaustive-deps

    const refreshTableData = async () => {
        try {
            const response = await axios({
                method: 'get',
                url: 'apimonitor/tableData',
                params: {
                    collectionType,
                    dateFrom,
                    dateTo,
                    skip,
                    limit,
                    testOrCollectionId
                }
            })

            if (response.status === 200) {
             
                setTableData(response.data.data)
                setTotalRecords(response.data.totalRecords)
                setNoOfRecords(Math.min(response.data.data.length, response.data.totalRecords))
            } else {
                throw new Error(`Error code ${response.status} from response. ${JSON.stringify({ collectionType, dateFrom, dateTo, skip, limit, testOrCollectionId })}`)
            }



        } catch (error) {
            console.error(`Error fetching ${collectionType} table data: ${error.message}`)
            return {}
        }
    }

    const showAll = () => {
        setSkip(0);
        setLimit(showAllLimit)
    }
    const showLess = () => {
        setSkip(0);
        setLimit(defaultLimit);

    }



    return (

        <div className={s.resultsTableContainer}>

            <div className={s.resultsTableTitle}>
                <h2 className={s.left}>
                    Test Results
                </h2>
                <div className={s.right}>

                    <div className={s.pagination}>
                        <div className={s.paginationText}>
                            {limit !== showAllLimit && `${skip + 1}-${noOfRecords + skip} of ${totalRecords} records shown.`}
                            {limit === showAllLimit && `All ${totalRecords} records shown.` }
                        </div>

                        {skip !== 0 &&
                            <Icon icon="arrow-left" strapColor={'primary'} onClick={() => setSkip(Math.max(0, skip - limit))} label='previous' labelPlacement='right' />
                        }
                        {skip < (totalRecords - limit) &&
                            <Icon icon="arrow-right" strapColor={'primary'} onClick={() => setSkip(Math.min(totalRecords - limit, skip + limit))} label='next' labelPlacement='left' />
                        }


                    </div>
                    {limit !== showAllLimit && <Icon icon="arrow-down" strapColor={'primary'} onClick={showAll} label='show all' labelPlacement='left' />}
                    {limit === showAllLimit && <Icon icon="arrow-up" strapColor={'primary'} onClick={showLess} label='show less' labelPlacement='left' />}
                </div>
            </div>
            <div className={classnames(s.tableContainer, (isMobileDevice ? s.mobileDevice : null))}>
                <table>
                    <thead>
                        <tr>
                            <th>Test Title</th>
                            <th>Test DateTime</th>
                            <th className={s.centered}>Success or Failure</th>
                            <th className={s.centered}>Time To Complete (ms)</th>
                            <th className={s.hideOnMobile}>Failure Message</th>
                            <th className={s.hideOnMobile}>Expected Result</th>
                            <th className={s.hideOnMobile}>Actual Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => {
                            return (
                                <tr key={index}>
                                    <td className={s.testTitle}>{row.title}</td>
                                    <td className={s.testDateTime}>{moment(row.dateTime).format('YY-MMM-DD hh:mm:ss')}</td>
                                    <td className={s.success}>{row.success ? <Icon icon='tick' strapColor='success' /> : <Icon icon='cross' strapColor='danger' />}</td>
                                    <td className={s.speed}>{row.timeToComplete.speed}</td>
                                    <td className={classnames(s.failureMessage, s.hideOnMobile)}>{row.failureMessage}</td>
                                    <td className={classnames(s.expectedResult, s.hideOnMobile)}>{row.results.expected}</td>
                                    <td className={classnames(s.actualResult, s.hideOnMobile)}>{row.results.actual}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>



    )

}
export default ResultsTable;




