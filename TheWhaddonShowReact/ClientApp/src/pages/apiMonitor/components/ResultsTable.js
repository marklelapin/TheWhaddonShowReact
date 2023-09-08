import React from 'react';
import { connect } from 'react-redux';


import {
    Row,
    Col,
} from 'reactstrap';
import {
    Progress,
    Dropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
} from 'reactstrap';

import {
    BootstrapTable,
    TableHeaderColumn,
} from 'react-bootstrap-table';

import s from '../TestResults.modules.scss';

import { Query, fetchData } from '../../../components/DataAccess/DataAccess';
import TickCross from '../../../mycomponents/TickCross/TickCross'





class ResultsTable extends React.Component {


    renderSizePerPageDropDown = (props) => {

        const limits = [];

        props.sizePerPageList.forEach((limit) => {
            limits.push(<DropdownItem key={limit} onClick={() => props.changeSizePerPage(limit)}>{limit}</DropdownItem>);
        });

        return (
            <Dropdown isOpen={props.open} toggle={props.toggleDropDown}>
                <DropdownToggle color="default" caret>
                    {props.currSizePerPage}
                </DropdownToggle>
                <DropdownMenu>
                    {limits}
                </DropdownMenu>
            </Dropdown>
        );
    }

   



    render() {

        const { showSuccess, showFailure, search, dateFrom,dateTo } = this.props

        const options = {
            sizePerPage: 10,
            paginationSize: 3,
            sizePerPageDropDown: this.renderSizePerPageDropDown,
        };



        function resultsFormatter(cell) {
            if (cell.expected == null) { return <small>Matched</small> }

            return (

                <div>
                    <small>
                        Expected:&nbsp;<span className="fw-semi-bold">{cell.expected}</span>
                    </small>
                    <br />
                    <small>
                        Actual:&nbsp;<span className="fw-semi-bold">{cell.actual}</span>
                    </small>
                </div>
            );
        }

        function dateFormatter(cell) {

            const dateObj = new Date(cell);

            // Format the date as 'd M yyyy' (e.g., '3 Jul 2023')
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);

            // Format the time as 'HH:mm' (e.g., '08:15')
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            return (
                <>
                    <Row>
                        <Col className="text-center">
                            <small className="fw-semi-bold">{formattedDate}</small>
                        </Col>

                    </Row>
                    <Row>
                        <Col>
                            <small>{formattedTime}</small>
                        </Col>

                    </Row>

                </>


            );
        }

        function timeToCompleteFormatter(cell) {
            return (
                <>
                    <small className="fw-semi-bold">{cell.speed}ms</small>
                    <Progress style={{ height: '15px' }} color={cell.type} value={cell.progress} />
                </>

            );
        }

        function progressSortFunc(a, b, order) {
            if (order === 'asc') {
                return a.timeToComplete.speed - b.timeToComplete.speed;
            }
            return b.timeToComplete.speed - a.timeToComplete.speed;
        }

        function dateSortFunc(a, b, order) {
            if (order === 'asc') {
                return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
            }
            return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
        }







        

        function filteredData(data) {

            console.log(`count: ${data.length}, search: ${search}, showSuccess: ${showSuccess}, showFailure: ${showFailure}`)

            //filter the data based on the search
            const searchFilter = data.filter(x =>
                (search ?? '') === ''
                || x.title?.toLowerCase().includes(search.toLowerCase())
                || x.failureMessage?.toLowerCase().includes(search.toLowerCase())
                || x.expected?.toLowerCase().includes(search.toLowerCase())
                || x.actual?.toLowerCase().includes(search.toLowerCase()))

            // filter the data based on the success/failure checkboxes
            const resultFilter = searchFilter.filter(x =>
                ((x.success === true) && showSuccess)
                || ((x.success === false) && showFailure))

            console.log(`count: ${resultFilter.length}`)

            return resultFilter;

        }

        function generateUrl() {
            return `/apimonitor/results/?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`
        }

        function generateKey() {
            return [generateUrl()]
        }
       

        return (

            < Query queryKey={generateKey()} //if queryKey changes, the query will be re-executed
                queryFn={() => fetchData(generateUrl())}
                queryOptions={{}}>

                {({ data, error, isLoading }) => {
                    if (isLoading) return <span>Loading...</span>;
                    if (error) return <span>Error: {error.message}</span>;
                    return (
                        <>
                            <BootstrapTable
                                data={filteredData(data)}
                                version="4"
                                pagination
                                options={options}
                                hover
                                bordered={false}
                                tableContainerClass={`table-striped table-hover table-responsive ${s.bootstrapTable}`}
                            >
                                <TableHeaderColumn className={`width-50 ${s.columnHead}`} columnClassName="width-50" dataField="key" isKey hidden>
                                    <span className="fs-sm" >Id</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`d-sm-table-cell ${s.columnHead}`} columnClassName="d-sm-table-cell align-middle text-wrap" dataField="title" dataSort>
                                    <span className="fs-sm">Title</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`width-100 ${s.columnHead} text-center`} columnClassName="width-100 text-center align-middle" dataField="dateTime" dataFormat={dateFormatter} dataSort sortFunc={dateSortFunc}>
                                    <span className="fs-sm">Date Time</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`width-100 ${s.columnHead} text-end`} columnClassName="width-100 align-middle text-end" dataField="success" dataFormat={TickCross}>
                                    <span className="fs-sm">Success?</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`width-150 ${s.columnHead}`} columnClassName="width-150 align-middle" dataField="timeToComplete" dataFormat={timeToCompleteFormatter} dataSort sortFunc={progressSortFunc}>
                                    <span className="fs-sm">Time to Complete</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`d-xs-table-cell ${s.columnHead}`} columnClassName="d-xs-table-cell align-middle text-wrap" dataField="failureMessage">
                                    <span className="fs-sm text-wrap">Failure Message</span>
                                </TableHeaderColumn>
                                <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle text-wrap" dataField="results" dataFormat={resultsFormatter}>
                                    <span className="fs-sm">Expected vs Actual</span>
                                </TableHeaderColumn>
                            </BootstrapTable>


                        </>
                        /*<pre>{JSON.stringify(data, null, 2)}</pre>*/

                    );
                }}
            </Query>
        );
    };

}

const mapStateToProps = (state) => {
    return {
        dateFrom: state.apiMonitor.dateFrom,
        dateTo: state.apiMonitor.dateTo,
        showSuccess: state.apiMonitor.showSuccess,
        showFailure: state.apiMonitor.showFailure,
        search: state.apiMonitor.search,
    };

}

export default connect(mapStateToProps)(ResultsTable);