import React from 'react';
//import { useDispatch, useSelector } from 'react-redux';
//import axios from 'axios';
import DataLoading from '../../../components/DataLoading/DataLoading';
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


//import s from '../TestResults.modules.scss';

//import { TickOrCross } from '../../../components/Icons/Icons'





const ResultsTable = () => {

    //const { open, sizePerPageList, currSizePerPage, toggleDropDown } = props;




    //const dispatch = useDispatch()

    //const dateFrom = useSelector(state => state.apiMonitor.dateFrom)
    //const dateTo = useSelector(state => state.apiMonitor.dateTo)
    //const showSuccess = useSelector(state => state.apiMonitor.showSuccess)
    //const showFailure = useSelector(state => state.apiMonitor.showFailure)
    //const search = useSelector(state => state.apiMonitor.search)
    //const isLoading = useSelector(state => state.apiMonitor.isLoading)


    //const [error, setError] = useState(null)
    //const [data, setData] = useState([])

    //useEffect(() => {
    //    refreshTableData();

    //}, [])

    //useEffect(() => {
    //    // Check if isLoading prop has changed from false to true
    //    if (isLoading === true) {
    //        refreshTableData();
    //    }
    //}, [isLoading]);


    //refreshTableData = async () => {

    //    dispatch(updateIsLoading(true))

    //    const url = `/apimonitor/results/?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`

    //    try {
    //        const response = await axios.get(url)
    //        this.setData(response.data)
    //        dispatch(updateIsLoading(false))
    //    }
    //    catch (err) {
    //        this.setError(`An error whilst loading data: ${err.message}`)
    //        dispatch(updateIsLoading(false))
    //    }

    //}

    //const renderSizePerPageDropDown = (props) => {

    //    const limits = [];

    //    sizePerPageList.forEach((limit) => {
    //        limits.push(<DropdownItem key={limit} onClick={() => props.changeSizePerPage(limit)}>{limit}</DropdownItem>);
    //    });

    //    return (
    //        <Dropdown isOpen={open} toggle={toggleDropDown}>
    //            <DropdownToggle color="default" caret>
    //                {currSizePerPage}
    //            </DropdownToggle>
    //            <DropdownMenu>
    //                {limits}
    //            </DropdownMenu>
    //        </Dropdown>
    //    );
    //}

    //const options = {
    //    sizePerPage: 10,
    //    paginationSize: 3,
    //    sizePerPageDropDown: renderSizePerPageDropDown,
    //};



    //function resultsFormatter(cell) {
    //    if (cell.expected == null) { return <small>Matched</small> }
    //    return (
    //        <div>
    //            <small>
    //                Expected:&nbsp;<span className="fw-semi-bold">{cell.expected}</span>
    //            </small>
    //            <br />
    //            <small>
    //                Actual:&nbsp;<span className="fw-semi-bold">{cell.actual}</span>
    //            </small>
    //        </div>
    //    );
    //}

    //function dateFormatter(cell) {

    //    const dateObj = new Date(cell);

    //    // Format the date as 'd M yyyy' (e.g., '3 Jul 2023')
    //    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    //    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    //    // Format the time as 'HH:mm' (e.g., '08:15')
    //    const hours = String(dateObj.getHours()).padStart(2, '0');
    //    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    //    const formattedTime = `${hours}:${minutes}`;

    //    return (
    //        <>
    //            <Row>
    //                <Col className="text-center">
    //                    <small className="fw-semi-bold">{formattedDate}</small>
    //                </Col>

    //            </Row>
    //            <Row>
    //                <Col>
    //                    <small>{formattedTime}</small>
    //                </Col>

    //            </Row>

    //        </>


    //    );
    //}

    //function timeToCompleteFormatter(cell) {
    //    return (
    //        <>
    //            <small className="fw-semi-bold">{cell.speed}ms</small>
    //            <Progress style={{ height: '15px' }} color={cell.type} value={cell.progress} />
    //        </>

    //    );
    //}

    //function progressSortFunc(a, b, order) {
    //    if (order === 'asc') {
    //        return a.timeToComplete.speed - b.timeToComplete.speed;
    //    }
    //    return b.timeToComplete.speed - a.timeToComplete.speed;
    //}

    //function dateSortFunc(a, b, order) {
    //    if (order === 'asc') {
    //        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    //    }
    //    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    //}


    //function filteredData(data) {

    //    console.log(`count: ${data.length}, search: ${search}, showSuccess: ${showSuccess}, showFailure: ${showFailure}`)

    //    //filter the data based on the search
    //    const searchFilter = data.filter(x =>
    //        (search ?? '') === ''
    //        || x.title?.toLowerCase().includes(search.toLowerCase())
    //        || x.failureMessage?.toLowerCase().includes(search.toLowerCase())
    //        || x.expected?.toLowerCase().includes(search.toLowerCase())
    //        || x.actual?.toLowerCase().includes(search.toLowerCase()))

    //    // filter the data based on the success/failure checkboxes
    //    const resultFilter = searchFilter.filter(x =>
    //        ((x.success === true) && showSuccess)
    //        || ((x.success === false) && showFailure))

    //    console.log(`count: ${resultFilter.length}`)

    //    return resultFilter;

    //}





    return (
        <DataLoading isLoading={isLoading} error={error !== null} errorText={`Error on loading: ${error}`} labelText="Loading...">

            {/*<BootstrapTable*/}
            {/*    data={filteredData(data)}*/}
            {/*    version="4"*/}
            {/*    pagination*/}
            {/*    options={options}*/}
            {/*    hover*/}
            {/*    bordered={false}*/}
            {/*    tableContainerClass={`table-striped table-hover table-responsive ${s.bootstrapTable}`}*/}
            {/*>*/}
            {/*    <TableHeaderColumn className={`width-50 ${s.columnHead}`} columnClassName="width-50" dataField="key" isKey hidden>*/}
            {/*        <span className="fs-sm" >Id</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`d-sm-table-cell ${s.columnHead}`} columnClassName="d-sm-table-cell align-middle text-wrap" dataField="title" dataSort>*/}
            {/*        <span className="fs-sm">Title</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`width-100 ${s.columnHead} text-center`} columnClassName="width-100 text-center align-middle" dataField="dateTime" dataFormat={dateFormatter} dataSort sortFunc={dateSortFunc}>*/}
            {/*        <span className="fs-sm">Date Time</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`width-100 ${s.columnHead} text-end`} columnClassName="width-100 align-middle text-end" dataField="success" dataFormat={TickOrCross}>*/}
            {/*        <span className="fs-sm">Success?</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`width-150 ${s.columnHead}`} columnClassName="width-150 align-middle" dataField="timeToComplete" dataFormat={timeToCompleteFormatter} dataSort sortFunc={progressSortFunc}>*/}
            {/*        <span className="fs-sm">Time to Complete</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`d-xs-table-cell ${s.columnHead}`} columnClassName="d-xs-table-cell align-middle text-wrap" dataField="failureMessage">*/}
            {/*        <span className="fs-sm text-wrap">Failure Message</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle text-wrap" dataField="results" dataFormat={resultsFormatter}>*/}
            {/*        <span className="fs-sm">Expected vs Actual</span>*/}
            {/*    </TableHeaderColumn>*/}
            {/*</BootstrapTable>*/}



        </DataLoading>

    );
};

export default ResultsTable;
