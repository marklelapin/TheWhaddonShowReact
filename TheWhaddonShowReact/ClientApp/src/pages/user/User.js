import React, { Component } from 'react';
import UsersTable from './components/UsersTable';

class UsersListPage extends Component {

  render() {
    return (
    	<div>
        <div className="page-top-line">
          <h2 className="page-title">User - <span className="fw-semi-bold">Management</span></h2>
        </div>
            
            <UsersTable />
      	</div>
    );
  }
}

export default UsersListPage;
