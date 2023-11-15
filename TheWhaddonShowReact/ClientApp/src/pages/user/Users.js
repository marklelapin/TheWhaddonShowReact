import React from 'react';
import UsersTable from './components/UsersTable';

function UsersListPage() {

    return (
        <>
            <div className="page-top-line">
                <h2 className="page-title">User - <span className="fw-semi-bold">Management</span></h2>
            </div>
            <div className="page-content">
                <UsersTable />
            </div>

        </>
    );

}

export default UsersListPage;
