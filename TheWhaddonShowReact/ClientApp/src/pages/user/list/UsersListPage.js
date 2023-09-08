import React, { Component } from 'react';
import UsersListTable from './UsersListTable';

class UsersListPage extends Component {

  render() {
    return (
    	<div>
        <div className="page-top-line">
          <h2 className="page-title">User - <span className="fw-semi-bold">Management</span></h2>
        </div>
            
            <UsersListTable />
      	</div>
    );
  }
}

export default UsersListPage;
