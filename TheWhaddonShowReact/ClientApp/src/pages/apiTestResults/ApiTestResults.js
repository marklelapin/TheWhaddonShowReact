import React from 'react';
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


import { reactTableData, reactBootstrapTableData } from './data';
import Widget from '../../components/Widget';
import s from './ApiTestResults.modules.scss';
import Datetime from 'react-datetime';

import { Query, fetchData } from '../../components/DataAccess/DataAccess';
import { TickCross } from '../../mycomponents/TickCross/TickCross';

class ApiTestResults extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            reactTable: reactTableData(),
            reactBootstrapTable: reactBootstrapTableData(),
        };
    }

    


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
    };



    render() {
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

        //function descriptionFormatter(cell) {
        //    return (
        //        <button className="btn-link">
        //            {cell}
        //        </button>
        //    );
        //}

     

        function timeToCompleteFormatter(cell) {
            return (
                <>
                <span>{cell.speed}ms</span>
                <Progress style={{ height: '15px' }} color={cell.type} value={cell.progress} />
                </>
                
            );
        }

        function progressSortFunc(a, b, order) {
            if (order === 'asc') {
                return a.status.progress - b.status.progress;
            }
            return b.status.progress - a.status.progress;
        }

        function dateSortFunc(a, b, order) {
            if (order === 'asc') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        return (
            <div>
                <h2 className="page-title">Api Monitor - <span className="fw-semi-bold">Test Results</span></h2>
                <Widget title={<h4>The <span className="fw-semi-bold">React</span> Way</h4>} collapse close>
                    <p>
                        The test results below are a record of the on going monitoring of  <a href="/api/documentation" rel="noopener noreferrer">The Whaddon Show Api</a>
                    </p>
                </Widget>
                    <Row>
                        <Col md={1} xs={12} className="text-end">
                            From
                        </Col>
                        <Col md={3} xs={12}>
                            <Datetime className="text-center"
                                id="date-from"
                                open={this.state.isDatePickerOpen}
                                viewMode="days" timeFormat={true}
                            />
                        </Col>
                        <Col md={1} xs={12} className="text-end">
                            To
                        </Col>
                        <Col md={3} xs={12}>
                            <Datetime className="text-center"
                                id="date-to"
                                open={this.state.isDatePickerOpen}
                                viewMode="days" timeFormat={true}
                               
                            />
                        </Col>
                    </Row>


                    <Query queryKey={["apiTestResults"]} queryFn = {() => fetchData('/apimonitor')} queryOptions = {{}}>
                        {({ data, error, isLoading }) => {
                            if (isLoading) return <span>Loading...</span>;
                            if (error) return <span>Error: {error.message}</span>;
                        return (
                            /*<pre>{JSON.stringify(data, null, 2)}</pre>*/
                            <BootstrapTable
                                    data={data}
                                    version="4"
                                    pagination
                                    options={options}
                                    search
                                    bordered={false}
                                    tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}
                            >
                                <TableHeaderColumn className={`width-50 ${s.columnHead}`} columnClassName="width-50" dataField="key" isKey hidden>
                                    <span className="fs-sm">Title</span>
                                </TableHeaderColumn>
                                    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="title" dataSort>
                                        <span className="fs-sm">Title</span>
                                    </TableHeaderColumn>
                                <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="dateTime" dataSort sortFunc={dateSortFunc}>
                                        <span className="fs-sm">Date Time</span>
                                    </TableHeaderColumn>
                                <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="success" dataFormat={TickCross}>
                                        <span className="fs-sm">Success?</span>
                                    </TableHeaderColumn>
                                <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="timeToComplete" dataFormat={timeToCompleteFormatter} dataSort sortFunc={progressSortFunc}>
                                        <span className="fs-sm">Time to Complete</span>
                                    </TableHeaderColumn>
                                    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="failureMessage">
                                        <span className="fs-sm">Failure Message</span>
                                    </TableHeaderColumn>
                                <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell align-middle" dataField="results" dataFormat={resultsFormatter}>
                                        <span className="fs-sm">Expected vs Actual</span>
                                    </TableHeaderColumn>
                                </BootstrapTable>
                            );
                        }}
                    </Query>



            </div>
        );
    }

}

export default ApiTestResults;
