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



        function infoFormatter(cell) {
            return (
                <div>
                    <small>
                        Type:&nbsp;<span className="fw-semi-bold">{cell.type}</span>
                    </small>
                    <br />
                    <small>
                        Dimensions:&nbsp;<span className="fw-semi-bold">{cell.dimensions}</span>
                    </small>
                </div>
            );
        }

        function descriptionFormatter(cell) {
            return (
                <button className="btn-link">
                    {cell}
                </button>
            );
        }

        function progressFormatter(cell) {
            return (
                <Progress style={{ height: '15px' }} color={cell.type} value={cell.progress} />
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


                    <Query queryKey={["apiTestResults"]} queryFn = {() => fetchData('/weatherforecast')} queryOptions = {{}}>
                        {({ data, error, isLoading }) => {
                            if (isLoading) return <span>Loading...</span>;
                            if (error) return <span>Error: {error.message}</span>;
                        return (
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                                //<BootstrapTable
                                //    data={JSON.stringify(data, null, 2)}
                                //    version="4"
                                //    pagination
                                //    options={options}
                                //    search
                                //    bordered={false}
                                //    tableContainerClass={`table-striped table-hover ${s.bootstrapTable}`}
                                //>
                                //    <TableHeaderColumn className={`width-50 ${s.columnHead}`} columnClassName="width-50" dataField="id" isKey>
                                //        <span className="fs-sm">ID</span>
                                //    </TableHeaderColumn>
                                //    <TableHeaderColumn className={`${s.columnHead}`} dataField="name" dataSort>
                                //        <span className="fs-sm">Name</span>
                                //    </TableHeaderColumn>
                                //    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell" dataField="info" dataFormat={infoFormatter}>
                                //        <span className="fs-sm">Info</span>
                                //    </TableHeaderColumn>
                                //    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell" dataField="description" dataFormat={descriptionFormatter}>
                                //        <span className="fs-sm">Description</span>
                                //    </TableHeaderColumn>
                                //    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell" dataField="status" dataFormat={progressFormatter} dataSort sortFunc={progressSortFunc}>
                                //        <span className="fs-sm">Status</span>
                                //    </TableHeaderColumn>
                                //    <TableHeaderColumn className={`d-md-table-cell ${s.columnHead}`} columnClassName="d-md-table-cell" dataField="date" dataSort sortFunc={dateSortFunc}>
                                //        <span className="fs-sm">Date</span>
                                //    </TableHeaderColumn>
                                //</BootstrapTable>
                            );
                        }}
                    </Query>



            </div>
        );
    }

}

export default ApiTestResults;
