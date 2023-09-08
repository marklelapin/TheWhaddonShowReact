import * as dataFormat from './UsersDataFormatters';
import actions from '../../../actions/usersListActions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import { Query, fetchData } from 'components/DataAccess/DataAccess';

import {
    Dropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';

import {
    BootstrapTable,
    TableHeaderColumn,
    SearchField
} from 'react-bootstrap-table';

import Widget from 'components/Widget';

import s from '../Users.module.scss';

class UsersListTable extends Component {
    state = {
        modalOpen: false,
        idToDelete: null,
    }

    handleDelete() {
        const userId = this.props.idToDelete;
        this.props.dispatch(actions.doDelete(userId));
    }

    openModal(cell) {
        const userId = cell;
        this.props.dispatch(actions.doOpenConfirm(userId));
    }

    closeModal() {
        this.props.dispatch(actions.doCloseConfirm());
    }

    actionFormatter(cell) {
        return (
            <div className={`d-flex justify-content-between`}>
                <Button
                    className={s.controBtn}
                    color="info"
                    size="xs"
                    onClick={() => this.props.dispatch(push(`/admin/users/${cell}`))}
                >
                    View
                </Button>
                <Button
                    className={s.controBtn}
                    color="success"
                    size="xs"
                    onClick={() => this.props.dispatch(push(`/admin/users/${cell}/edit`))}
                >
                    Edit
                </Button>
                <Button
                    className={s.controBtn}
                    color="danger"
                    size="xs"
                    onClick={() => this.openModal(cell)}
                >
                    Delete
                </Button>
            </div>
        )
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(actions.doFetch({}));
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

    createCustomSearchField = (props) => {
        return (
            <SearchField
                className="mb-sm-5 me-1"
                placeholder='Search' />
        );
    }


    render() {
        const {
            rows
        } = this.props;

        const options = {
            sizePerPage: 10,
            paginationSize: 5,
            searchField: this.createCustomSearchField,
            sizePerPageDropDown: this.renderSizePerPageDropDown,
        };

        return (
            <div>
                <Widget title="Users" collapse close>
                    <div>
                        < Query queryKey={["persons"]} //if queryKey changes, the query will be re-executed
                            queryFn={() => fetchData("api/persons")}
                            queryOptions={{}}>

                            {({ data, error, isLoading }) => {
                                if (isLoading) return <span>Loading...</span>;
                                if (error) return <span>Error: {error.message}</span>;
                                return (
                                    <>
                                         <BootstrapTable bordered={false} data={data} version="4" pagination options={options} search className="table-responsive" tableContainerClass={`table-responsive table-striped table-hover ${s.usersListTableMobile}`}>
                                            <TableHeaderColumn dataField="pictureRef" dataSort dataFormat={dataFormat.imageFormatter}>
                                                <span className="fs-sm">Avatar</span>
                                            </TableHeaderColumn>

                                            <TableHeaderColumn dataField="firstName" dataSort>
                                                <span className="fs-sm">First Name</span>
                                            </TableHeaderColumn>

                                            <TableHeaderColumn dataField="lastName" dataSort>
                                                <span className="fs-sm">Last Name</span>
                                            </TableHeaderColumn>

                                            <TableHeaderColumn dataField="email" dataSort>
                                                <span className="fs-sm">E-mail</span>
                                            </TableHeaderColumn>

                                            <TableHeaderColumn dataField="isActor" dataSort dataFormat={dataFormat.booleanFormatter}>
                                                <span className="fs-sm">Actor</span>
                                            </TableHeaderColumn>
                                            <TableHeaderColumn dataField="isSinger" dataSort dataFormat={dataFormat.booleanFormatter}>
                                                <span className="fs-sm">Singer</span>
                                            </TableHeaderColumn>
                                            <TableHeaderColumn dataField="isWriter" dataSort dataFormat={dataFormat.booleanFormatter}>
                                                <span className="fs-sm">Writer</span>
                                            </TableHeaderColumn>
                                            <TableHeaderColumn dataField="isBand" dataSort dataFormat={dataFormat.booleanFormatter}>
                                                <span className="fs-sm">Band</span>
                                            </TableHeaderColumn>
                                            <TableHeaderColumn dataField="isTechnical" dataSort dataFormat={dataFormat.booleanFormatter}>
                                                <span className="fs-sm">Technical</span>
                                            </TableHeaderColumn>


                                            <TableHeaderColumn isKey dataField="id" dataFormat={this.actionFormatter.bind(this)}>
                                                <span className="fs-sm">Actions</span>
                                            </TableHeaderColumn>
                                        </BootstrapTable>
                                    </>
                                )
                            }}
                        </Query>
                    </div>
                </Widget>

                <Modal size="sm" isOpen={this.props.modalOpen} toggle={() => this.closeModal()}>
                    <ModalHeader toggle={() => this.closeModal()}>Confirm delete</ModalHeader>
                    <ModalBody className="bg-white">
                        Are you sure you want to delete this item?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => this.closeModal()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.handleDelete()}>Delete</Button>
                    </ModalFooter>
                </Modal>

            </div>
        );
    }
}

function mapStateToProps(store) {
    return {
        loading: store.users.list.loading,
        rows: store.users.list.rows,
        modalOpen: store.users.list.modalOpen,
        idToDelete: store.users.list.idToDelete,
    };
}

export default connect(mapStateToProps)(UsersListTable);
