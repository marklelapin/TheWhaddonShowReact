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

    //dateFrom, dateTo, originalData and updateData are passed in as props using react-redux connect function at the bottom of this file






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

        const options = {
            sizePerPage: 10,
            paginationSize: 3,
            sizePerPageDropDown: this.renderSizePerPageDropDown,
        };

        const fetchUrl = `/apimonitor/results/?dateFrom=${this.props.dateFrom.toISOString()}&dateTo=${this.props.dateTo.toISOString()}`

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

        

        

 




        function filteredData(data,search,showSuccess,showFailure) {

            //filter the data based on the search and showSuccess props
            data.filter(x => (search ?? '') === ''
                || x.title.includes(search)
                || x.failureMessage.includes(search)
                || x.expected.includes(search)
                || x.actual.includes(search))

            data.filter(x => ((x.success === true) && showSuccess) 
            || ((x.success === false) && showFailure))

            return data;

        }

        return (
           
            <Query queryKey={["apiTestResults"]} queryFn={() => fetchData(fetchUrl)} queryOptions={{}}>
                {({ data, error, isLoading }) => {
                    if (isLoading) return <span>Loading...</span>;
                    if (error) return <span>Error: {error.message}</span>;
                    return (
                        /*<pre>{JSON.stringify(data, null, 2)}</pre>*/
                        <BootstrapTable
                            data={filteredData(data,this.props.search,this.props.showSuccess,this.props.showFailure)}
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
