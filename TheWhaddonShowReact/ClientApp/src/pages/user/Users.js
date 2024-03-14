import React from 'react';
import UsersTable from './components/UsersTable';

function UsersListPage() {

    return (
        <>
            <h1>Users</h1>
            <div className="page-content">
                <UsersTable />
            </div>

        </>
    );

}

export default UsersListPage;
