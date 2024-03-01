import React, { useState, useEffect } from 'react';
/*import { useSelector } from 'react-redux';*/
import axios from 'axios';


//Components
import Chart from '../../components/Chart/Chart';
import DashboardBox from './components/DashboardBox';
import { Icon } from '../../components/Icons/Icons';

//utilties
import classnames from 'classnames';
import { log, API_MONITOR as logType } from '../../dataAccess/logging'
import moment from 'moment';
import s from './ApiMonitor.module.scss';
//import ResultsTable from './components/ResultsTable';

const ApiMonitor = () => {

    //const dispatch = useDispatch();

    //Dates setup
    const dashboardPeriod = 7
    const calculateDateFrom = (date) => {
        const refDate = new Date(date)
        console.log('calculated date to', refDate)
        const newDateFrom = new Date(refDate.setDate(refDate.getDate() - dashboardPeriod))
        console.log('calculated newDatefrom', newDateFrom)
        return newDateFrom
    }
    const defaultDateTo = new Date();
    const defaultDateFrom = calculateDateFrom(defaultDateTo);
    const [dateFrom, setDateFrom] = useState(null)
    const [dateTo, setDateTo] = useState(null)

    const goBack = () => {
        console.log('goBack before', { dateTo, dateFrom })
        const refDate = new Date(dateTo)
        const newDateTo = new Date(refDate.setDate(refDate.getDate() - dashboardPeriod))
        const newDateFrom = calculateDateFrom(newDateTo)
        console.log('goBack after', {newDateTo,newDateFrom})
        setDateTo(newDateTo)
        setDateFrom(newDateFrom)
    }
    const goForward = () => {
        const refDate = new Date(dateTo)
        let newDateTo = new Date(refDate.setDate(refDate.getDate() + dashboardPeriod))

        const newDateFrom = calculateDateFrom(newDateTo)
        setDateTo(newDateTo)
        setDateFrom(newDateFrom)
    }

    //Charts Setup
    const [resultsChartConfig, setResultsChartConfig] = useState(null)
    const [speedChartConfig, setSpeedChartConfig] = useState(null)
    const [resultAndSpeedChartConfig, setResultAndSpeedChartConfig] = useState(null)
    const [availabilityChartConfig, setAvailabilityChartConfig] = useState(null)
    const [reliability, setReliability] = useState(null)
    const [averageSpeed, setAverageSpeed] = useState(null)
    //const layoutHeight = useSelector(state => state.device.layoutHeight);
    //const layoutWidth = useSelector(state => state.device.layoutWidth);

    //const [refreshTrigger, setRefreshTrigger] = useState(1)


    //useEffect(() => {
    //    setRefreshTrigger(refreshTrigger + 1)   
    //}, [layoutHeight, layoutWidth]) //eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        setDateFrom(new Date(defaultDateFrom))
        setDateTo(new Date(defaultDateTo))
        loadPerformanceData()
        loadAvailabilityData()
    }, []) //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadPerformanceData()
    }, [dateTo, dateFrom]) //eslint-disable-line react-hooks/exhaustive-deps


    const loadPerformanceData = async () => {
        const chartData = await getChartData('performance')

        if (chartData) {
            const { reliability = null, averageSpeed = null, resultsChartConfig = null, speedChartConfig = null, resultAndSpeedChartConfig = null } = chartData
            setAverageSpeed(averageSpeed)
            setReliability(reliability)
            setResultsChartConfig(resultsChartConfig)
            setSpeedChartConfig(speedChartConfig)
            setResultAndSpeedChartConfig(resultAndSpeedChartConfig)
        } else {
            setAverageSpeed(null)
            setReliability(null)
            setResultsChartConfig(null)
            setSpeedChartConfig(null)
            setResultAndSpeedChartConfig(null)
        } 
    }

    const loadAvailabilityData = async () => {
        const chartData = await getChartData('availability')
        if (chartData) {
            setAvailabilityChartConfig(chartData)
        } else {
            setAvailabilityChartConfig(null)
        }
    }

    const getChartData = async (chartType) => {
        try {
            const response = await axios({
                method: 'get',
                url: 'apimonitor/chartData',
                params: {
                    chartType: chartType,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    skip: 0,
                    limit: 10000
                }
            })
            return response.data
        } catch (error) {
            console.error(`Error fetching ${chartType} config: ${error.message}`)
            return null
        }
    }

    const resultAndSpeedChartClickHandler = (event) => { //eslint-disable-line no-unused-vars

        alert('resultAndSpeedChartClickHandler')
        //const activeElements = resultChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true)

        //if (activeElements.length) {
        //    const firstElement = activeElements[0];
        //    const id = resultAndSpeedChart.data.datasets[firstElement.datasetIndex].data[firstElement.index].Id;


        //    window.location.href = '/Results/' + id + '/@Model.DateFrom.ToString("o")/@Model.DateTo.ToString("o")';
        //}
    }

    function resultChartClickHandler(event) { //eslint-disable-line no-unused-vars

        alert('resultChartClickHandler')
        //const activeElements = resultChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true)

        //if (activeElements.length) {
        //    const firstElement = activeElements[0];
        //    const testDateString = resultChart.data.labels[firstElement.index];

        //    window.location.href = '/Results/@Model.CollectionId/' + testDateString + '/' + testDateString
        //}

    }

    function speedChartClickHandler(event) { //eslint-disable-line no-unused-vars
        alert('speedChartClickHandler')
        // resultChartClickHandler(event)
    }




    const isLatest = () => {
        return dateTo - defaultDateTo >= -200000
    }
    console.log('dates', dateFrom, dateTo)
    log(logType, 'ResultsChartConfig', resultsChartConfig)
    return (
        <>
            <div className={s.apiMonitorPage}>
                <h1>Api Monitor


                </h1>
                <div className={s.dateSelectors}>
                    <Icon icon="arrow-left"
                        id="go-back"
                        strapColor='primary'
                        onClick={goBack}
                        tooltip={`Go Back ${dashboardPeriod} days`}
                        label='previous week'
                        labelPlacement='right' />
                    {(!isLatest()) &&
                        <Icon icon="arrow-right"
                            strapColor='primary'
                            onClick={goForward}
                            tooltip={`Go Forward ${dashboardPeriod} days`}
                            label='next week'
                            labelPlacement='left'
                        />
                    }

                </div>
                <div className={s.subHeader}>
                    <p>{`The dashboard below summarises the performance of the The Whaddon Show Api between ${moment(dateFrom).format("MMM-DD")} and ${moment(dateTo).format("MMM-DD")}`}</p>

                </div>




                <div className={classnames(s.dashboardContainer)}>

                    <div className={s.section}>
                        <div className={s.column}>
                            <div className={s.row}>

                                <DashboardBox id="percentage-reliability"
                                    title="Reliability"
                                    note="Total successes and failures when controller test run every 4 hours."
                                    bigContent={reliability ? `${reliability}%` : null} />

                                <DashboardBox id="average-speed"
                                    title="Average Speed"
                                    note="The average speed of all succesful tests conducted in period."
                                    bigContent={averageSpeed ? `${averageSpeed}ms` : null} />

                            </div>

                            <DashboardBox id="availability-chart-box"
                                title="Availability (last 30 minutes)"
                                note="Chart shows speed of simple get call every 4 seconds.">
                                <Chart id="availability-chart" config={availabilityChartConfig} />
                            </DashboardBox>

                        </div >

                    </div >

                    <div className={s.section}>
                        <div className={s.column}>

                            <DashboardBox id="result-chart-box"
                                title="Reliability"
                                note="Test Success and Failures for Controller Test Run every 4 hours"
                            >
                                <Chart id="result-chart" config={resultsChartConfig} onClick={resultChartClickHandler} />
                            </DashboardBox>

                            <DashboardBox id="speed-chart-dashboard-box"
                                title="Speed"
                                note="Shows the average time to complete test calls to the api(black line) and the range of times in green."
                            >
                                <Chart id="speedChart" config={speedChartConfig} onClick={speedChartClickHandler} />
                            </DashboardBox>

                        </div>
                    </div>

                    <div className={s.section}>
                        <div className={s.row}>
                            <DashboardBox id="result-speed-chart-box"
                                title="Breakdown By Controller and Test"
                                note="Shows average time (size of bubble) and reliability (color) for combinations of controller and test actions."
                            >
                                <Chart id="result-speed-chart" config={resultAndSpeedChartConfig} onClick={resultAndSpeedChartClickHandler} />
                            </DashboardBox>

                        </div>

                    </div>

                </div >
            </div >

        </>



    )

}

export default ApiMonitor;
//<Modal isOpen={modalData !== null} toggle={toggleModal} className={s.modalResultsTable}>
//    {/* <Icon icon="cross" id="close-modal-sidebar-toggle" onClick={toggleCloseSidebar} />*/}
//    <div className={s.modal}>
//        <ResultsTable />
//    </div>
//</Modal>
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