/*import React, { useState } from 'react';*/
import { useSelector} from 'react-redux';
//import {
//    updateFromTo
//    , toggleShowSuccess
//    , toggleShowFailure
//    , updateSearch
//    , updateIsLoading
//} from '../../actions/apiMonitor';
//import Datetime from 'react-datetime';

//import {
//    Row,
//    Col,
//    Button,
//    Label,
//    Input,
//    FormGroup
//} from 'reactstrap';

//import Widget from '../../components/Widget';


//import ResultsTable from './components/ResultsTable';

const ApiMonitor = () => {

    //const dispatch = useDispatch();

    const dateFrom = useSelector((state) => state.apiMonitor.dateFrom)
    const dateTo = useSelector(state => state.apiMonitor.dateTo)
    const search = useSelector(state => state.apiMonitor.search)
    const showSuccess = useSelector(state => state.apiMonitor.showSuccess)
    const showFailure = useSelector(state => state.apiMonitor.showFailure)


    //const [showUpdateButton, setShowUpdateButton] = useState(false)

    //handleUpdateButtonClick = () => {
    //    dispatch(updateFromTo({ dateFrom, dateTo }))
    //    dispatch(updateIsLoading(true))
    //    setShowUpdateButton(false) 
    //}

    ////Show Success/Failure checkbox functions
    //handleSuccessCheckClick = () => {
    //    dispatch(toggleShowSuccess());

    //}
    //handleFailureCheckClick = () => {
    //    dispatch(toggleShowFailure())
    //}

    ////Search box functions
    //handleSearchChange = (e) => {
    //    dispatch(updateSearch({ search: e.target.value }))
    //}



    console.log(`datePickedFrom: ${dateFrom} datePickedTo: ${dateTo} search: ${search} showSuccess: ${showSuccess} showFailure: ${showFailure}`)
    return (
        null
        //<div>
        //    <h2 className="page-title">Api Monitor - <span className="fw-semi-bold">Test Results</span></h2>

        //    <>
        //        <Widget title={<h5>Change Dates or Filter Data...</h5>} collapse>
        //            <Row >
        //                <Col>
        //                    <legend>Show tests between following dates..</legend>
        //                    <Row>
        //                        <Col>

        //                            <Label for="fromdatetimepicker">From</Label>
        //                            <div className="datepicker" style={{ display: 'flex' }}>
        //                                <Datetime
        //                                    value={dateFrom}
        //                                    id="fromdatetimepicker"
        //                                    //open={this.state.isDatePickerOpen}
        //                                    viewMode="time"
        //                                    timeFormat="HH:mm"
        //                                    onChange={handleDatePickedFromChange}
        //                                    inputProps={{ ref: (input) => { refDatePicker = input; } }}
        //                                />
        //                                <span className="input-group-text" onClick={() => { refDatePicker.focus(); }}>
        //                                    <i className="glyphicon glyphicon-time" />
        //                                </span>
        //                            </div>
        //                        </Col>
        //                        <Col >
        //                            <Label for="todatetimepicker">To</Label>
        //                            <div className="datepicker" style={{ display: 'flex' }}>
        //                                <Datetime
        //                                    value={dateTo}
        //                                    id="todatetimepicker"
        //                                    //open={this.state.isTimePickerOpen}
        //                                    viewMode="time"
        //                                    timeFormat="HH:mm"
        //                                    onChange={handleDatePickedToChange}
        //                                    inputProps={{ ref: (input) => { refTimePicker = input; } }}
        //                                />
        //                                <span className="input-group-text" onClick={() => { refTimePicker.focus() }} ><i className="glyphicon glyphicon-time" /></span>
        //                            </div>

        //                        </Col>
        //                    </Row>
        //                    <Row>

        //                        {(this.state.showUpdateButton &&
        //                            <Col className="text-center">
        //                                <Button color="primary" className="mr-xs" onClick={handleUpdateButtonClick}>Confirm New Dates</Button>
        //                            </Col>
        //                        )}
        //                    </Row>
        //                </Col>
        //                <Col>
        //                    <legend>Filter the table...</legend>
        //                    <Row>
        //                        <Col>
        //                            <Label for="search-field">Search</Label>
        //                            <Input type="text" id="search-field" value={search} placeholder="enter search text..." onChange={handleSearchChange}></Input>
        //                        </Col>
        //                    </Row>
        //                    <Row>
        //                        <Col>
        //                            <FormGroup className="checkbox abc-checkbox abc-checkbox-success" check >
        //                                <Input id="checkbox-success" type="checkbox" checked={showSuccess} onChange={handleSuccessCheckClick} />{' '}
        //                                <Label for="checkbox-success" check>
        //                                    Successfull Tests
        //                                </Label>
        //                            </FormGroup>
        //                        </Col>
        //                        <Col>
        //                            <FormGroup className="checkbox abc-checkbox abc-checkbox-danger" check>
        //                                <Input id="checkbox-failure" type="checkbox" checked={showFailure} onChange={handleFailureCheckClick} />{' '}
        //                                <Label for="checkbox-failure" check>
        //                                    Failed Tests
        //                                </Label>
        //                            </FormGroup>
        //                        </Col>
        //                    </Row>
        //                </Col>

        //            </Row>


        //        </Widget>
        //    </>

        //    <ResultsTable />



        //</div>
    );

}


export default ApiMonitor;
