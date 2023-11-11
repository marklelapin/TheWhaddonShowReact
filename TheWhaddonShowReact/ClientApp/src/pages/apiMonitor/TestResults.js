import React from 'react';
import { connect } from 'react-redux';
import {
    updateFromTo
    , toggleShowSuccess
    , toggleShowFailure
    , updateSearch
    , updateIsLoading
} from '../../actions/apiMonitor';
import Datetime from 'react-datetime';

import {
    Row,
    Col,
    Button,
    Label,
    Input,
    FormGroup
} from 'reactstrap';

import Widget from '../../components/Widget';


import ResultsTable from './components/ResultsTable';

class TestResults extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            datePickedFrom: this.props.dateFrom,
            datePickedTo: this.props.dateTo,
            showUpdateButton: false,
        }

    }

    //DatePicker functions
    handleDatePickedFromChange = (newDate) => {
        this.setState({ datePickedFrom: newDate });
        this.setState({ showUpdateButton: true })

    };
    handleDatePickedToChange = (newDate) => {
        this.setState({ datePickedTo: newDate })
        this.setState({ showUpdateButton: true })
    };

    //Update button functions

    handleUpdateButtonClick = () => {
        this.props.dispatch(updateFromTo({ dateFrom: this.state.datePickedFrom, dateTo: this.state.datePickedTo }))
        this.props.dispatch(updateIsLoading(true))
        this.setState({ showUpdateButton: false })
    }

    //Show Success/Failure checkbox functions
    handleSuccessCheckClick = () => {
        this.props.dispatch(toggleShowSuccess());

    }
    handleFailureCheckClick = () => {
        this.props.dispatch(toggleShowFailure())
    }

    //Search box functions
    handleSearchChange = (e) => {
        this.props.dispatch(updateSearch({ search: e.target.value }))
    }


    render() {

        console.log(`datePickedFrom: ${this.state.datePickedFrom} datePickedTo: ${this.state.datePickedTo} search: ${this.props.search} showSuccess: ${this.props.showSuccess} showFailure: ${this.props.showFailure}`)
        return (

            <div>
                <h2 className="page-title">Api Monitor - <span className="fw-semi-bold">Test Results</span></h2>

                <>
                    <Widget title={<h5>Change Dates or Filter Data...</h5>} collapse>
                        <Row >
                            <Col>
                                <legend>Show tests between following dates..</legend>
                                <Row>
                                    <Col>

                                        <Label for="fromdatetimepicker">From</Label>
                                        <div className="datepicker" style={{ display: 'flex' }}>
                                            <Datetime
                                                value={this.state.datePickedFrom}
                                                id="fromdatetimepicker"
                                                //open={this.state.isDatePickerOpen}
                                                viewMode="time"
                                                timeFormat="HH:mm"
                                                onChange={this.handleDatePickedFromChange}
                                                inputProps={{ ref: (input) => { this.refDatePicker = input; } }}
                                            />
                                            <span className="input-group-text" onClick={() => { this.refDatePicker.focus(); }}>
                                                <i className="glyphicon glyphicon-time" />
                                            </span>
                                        </div>
                                    </Col>
                                    <Col >
                                        <Label for="todatetimepicker">To</Label>
                                        <div className="datepicker" style={{ display: 'flex' }}>
                                            <Datetime
                                                value={this.state.datePickedTo}
                                                id="todatetimepicker"
                                                //open={this.state.isTimePickerOpen}
                                                viewMode="time"
                                                timeFormat="HH:mm"
                                                onChange={this.handleDatePickedToChange}
                                                inputProps={{ ref: (input) => { this.refTimePicker = input; } }}
                                            />
                                            <span className="input-group-text" onClick={() => { this.refTimePicker.focus() }} ><i className="glyphicon glyphicon-time" /></span>
                                        </div>

                                    </Col>
                                </Row>
                                <Row>

                                    {(this.state.showUpdateButton &&
                                        <Col className="text-center">
                                            <Button color="primary" className="mr-xs" onClick={this.handleUpdateButtonClick}>Confirm New Dates</Button>
                                        </Col>
                                    )}
                                </Row>
                            </Col>
                            <Col>
                                <legend>Filter the table...</legend>
                                <Row>
                                    <Col>
                                        <Label for="search-field">Search</Label>
                                        <Input type="text" id="search-field" value={this.props.search} placeholder="enter search text..." onChange={this.handleSearchChange}></Input>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <FormGroup className="checkbox abc-checkbox abc-checkbox-success" check >
                                            <Input id="checkbox-success" type="checkbox" checked={this.props.showSuccess} onChange={this.handleSuccessCheckClick} />{' '}
                                            <Label for="checkbox-success" check>
                                                Successfull Tests
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup className="checkbox abc-checkbox abc-checkbox-danger" check>
                                            <Input id="checkbox-failure" type="checkbox" checked={this.props.showFailure} onChange={this.handleFailureCheckClick} />{' '}
                                            <Label for="checkbox-failure" check>
                                                Failed Tests
                                            </Label>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>

                        </Row>


                    </Widget>
                </>

                <ResultsTable />



            </div>
        );
    }

}
const mapStateToProps = (state) => {
    return {
        dateFrom: state.apiMonitor.dateFrom,
        dateTo: state.apiMonitor.dateTo,
        search: state.apiMonitor.search,
        showSuccess: state.apiMonitor.showSuccess,
        showFailure: state.apiMonitor.showFailure,
    };
}


export default connect(mapStateToProps)(TestResults);
