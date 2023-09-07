import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import updateFromTo from '../../actions/apiMonitor';

import {
    Row,
    Col,
} from 'reactstrap';

import Widget from '../../components/Widget';
import Datetime from 'react-datetime';

import ResultsTable from './components/ResultsTable';

class TestResults extends React.Component {
 
    //static propTypes = {
    //    dateFrom: PropTypes.instanceof(Date),
    //    dateTo: PropTypes.instanceof(Date),
    //    updateFromTo: PropTypes.func.isRequired,
    //};

    state = {
        isDatePickerOpen: false,
    }

    render() {

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

                <ResultsTable />

            </div>
        );
    }

}
    const mapStateToProps = (state) => {
        return {
            dateFrom: state.apiMonitor.dateFrom,
            dateTo: state.apiMonitor.dateTo
        };
    }
    const mapDispatchToProps = (dispatch) => {
        return {
            updateFromTo: (from,to) => dispatch(updateFromTo({ from, to }))
        };
    }

export default connect(mapStateToProps,mapDispatchToProps)(TestResults);
