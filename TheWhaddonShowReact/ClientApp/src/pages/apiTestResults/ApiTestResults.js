import React from 'react';
import {
    Row,
    Col,
} from 'reactstrap';

import Widget from '../../components/Widget';
import Datetime from 'react-datetime';

import ResultsTable from './components/ResultsTable';

class ApiTestResults extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dateFrom: new Date("2023/09/01"),
            dateTo: new Date("2023/09/06"),
        };
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

export default ApiTestResults;
