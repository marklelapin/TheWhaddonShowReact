import React from 'react';
import { push } from 'connected-react-router';

//Redux Hooks
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Formatters
import * as dataFormat from './UsersDataFormatters';
import actions from 'actions/usersListActions';

//Data Access / Local Server Model
import { useSync } from 'dataAccess/localServerUtils';
import { Person } from 'dataAccess/localServerModels';
import { getLatest } from 'dataAccess/localServerUtils';
//Components
import DataLoading from 'components/DataLoading/DataLoading';

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

//SASS
import s from '../Users.module.scss';



export function UsersTable() {

    //Setup state internal to this component
    const [modalOpen, setModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    //Access state from redux store
    const personsHistory = useSelector((state) => state.localServer.persons.history)

    //Access the dispatch function using useDispatch
    const dispatch = useDispatch();


 





    const handleDelete = () => {
        const userId = idToDelete;
        dispatch(actions.doDelete(userId));
    }

    const openModal = (cell) => {
        const userId = cell;
        dispatch(actions.doOpenConfirm(userId));
    }

    const closeModal = () => {
        dispatch(actions.doCloseConfirm());
    }

    const actionFormatter = (cell) => {
        return (
            <div className={`d-flex justify-content-between`}>
                <Button
                    className={s.controBtn}
                    color="info"
                    size="xs"
                    onClick={() => dispatch(push(`/admin/users/${cell}`))}
                >
                    View
                </Button>
                <Button
                    className={s.controBtn}
                    color="success"
                    size="xs"
                    onClick={() => dispatch(push(`/admin/users/${cell}/edit`))}
                >
                    Edit
                </Button>
                <Button
                    className={s.controBtn}
                    color="danger"
                    size="xs"
                    onClick={() => openModal(cell)}
                >
                    Delete
                </Button>
            </div>
        )
    }


    //const renderSizePerPageDropDown = (props) => {
    //    const limits = [];
    //    props.sizePerPageList.forEach((limit) => {
    //        limits.push(<DropdownItem key={limit} onClick={() => changeSizePerPage(limit)}>{limit}</DropdownItem>);
    //    });

    //    return (
    //        <Dropdown isOpen={props.open} toggle={props.toggleDropDown}>
    //            <DropdownToggle color="default" caret>
    //                {props.currSizePerPage}
    //            </DropdownToggle>
    //            <DropdownMenu>
    //                {limits}
    //            </DropdownMenu>
    //        </Dropdown>
    //    );
    //};

    //const createCustomSearchField = (props) => {
    //    return (
    //        <SearchField
    //            className="mb-sm-5 me-1"
    //            placeholder='Search' />
    //    );
    //}


    const data = getLatest(personsHistory);


    const options = {
        sizePerPage: 10,
        paginationSize: 5,
        //searchField: createCustomSearchField,
        //sizePerPageDropDown: renderSizePerPageDropDown,
    };


    return (


        <div>
            <Widget title="Users" collapse close>
                <DataLoading isLoading={isLoading} isError={error !== null} loadingText="Loading..." errorText={`Error loading data: ${error}`}>
                    <>
                        <BootstrapTable bordered={false} data={data} version="4" pagination options={options} search className="table-responsive" tableContainerClass={`table-responsive table-striped table-hover ${s.usersListTableMobile}`}>
                            <TableHeaderColumn dataField="PictureRef" dataSort dataFormat={dataFormat.imageFormatter}>
                                <span className="fs-sm">Avatar</span>
                            </TableHeaderColumn>

                            <TableHeaderColumn dataField="FirstName" dataSort>
                                <span className="fs-sm">First Name</span>
                            </TableHeaderColumn>

                            <TableHeaderColumn dataField="LastName" dataSort>
                                <span className="fs-sm">Last Name</span>
                            </TableHeaderColumn>

                            <TableHeaderColumn dataField="Email" dataSort>
                                <span className="fs-sm">E-mail</span>
                            </TableHeaderColumn>

                            <TableHeaderColumn dataField="IsActor" dataSort dataFormat={dataFormat.booleanFormatter}>
                                <span className="fs-sm">Actor</span>
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField="IsSinger" dataSort dataFormat={dataFormat.booleanFormatter}>
                                <span className="fs-sm">Singer</span>
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField="IsWriter" dataSort dataFormat={dataFormat.booleanFormatter}>
                                <span className="fs-sm">Writer</span>
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField="IsBand" dataSort dataFormat={dataFormat.booleanFormatter}>
                                <span className="fs-sm">Band</span>
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField="IsTechnical" dataSort dataFormat={dataFormat.booleanFormatter}>
                                <span className="fs-sm">Technical</span>
                            </TableHeaderColumn>


                            <TableHeaderColumn isKey dataField="Id" dataFormat={actionFormatter}>
                                <span className="fs-sm">Actions</span>
                            </TableHeaderColumn>
                        </BootstrapTable>
                    </>
                </DataLoading>
            </Widget>

            <Modal size="sm" isOpen={modalOpen} toggle={() => closeModal()}>
                <ModalHeader toggle={() => closeModal()}>Confirm delete</ModalHeader>
                <ModalBody className="bg-white">
                    Are you sure you want to delete this item?
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => closeModal()}>Cancel</Button>
                    <Button color="primary" onClick={() => handleDelete()}>Delete</Button>
                </ModalFooter>
            </Modal>

        </div>
    );
}



export default UsersTable;
