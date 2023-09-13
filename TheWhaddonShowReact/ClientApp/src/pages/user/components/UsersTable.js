import * as dataFormat from './UsersDataFormatters';
import actions from '../../../actions/usersListActions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { setLocalCopyId, updateLastSyncDate } from 'actions/sync';


import { LocalToServerSyncData } from 'components/DataAccess/LocalServerModel';


import {
    addUpdates,
    processServerToLocalPostbacks,
    clearConflicts
} from 'actions/persons';

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

class UsersTable extends Component {
    state = {
        modalOpen: false,
        idToDelete: null,
        loading: true,
        error: null
    }


    componentDidMount() {
        this.syncPersons();
    }

    syncPersons = async () => {

        const { dispatch } = this.props

        const syncData = this.createSyncData()

        let result = {}
        let disp = ''
        let obj = ''

        console.log("Syncing Data: " + JSON.stringify(syncData))
        try {
            const response = await axios.post('persons/sync', syncData)
            result = await response.data;

            console.log("Server To Local Sync Data: " + JSON.stringify(result))

            if (result.PostBacks.length === 0) {
                console.log('No Postback to process.')
            }
            else {
                console.log('Processing postbacks.')
                dispatch(processServerToLocalPostbacks(result.PostBacks))
            }

            if (result.Updates.length === 0) {
                console.log('No updates to process.')
            }
            else {
                console.log('Processing updates.')
                dispatch(addUpdates(result.Updates))

            }
            if (result.ConflictIdsToClear.length === 0) {
                console.log('No conflicts to clear.')
            }
            else {
                console.log('Clearing conflicts.')
                dispatch(clearConflicts(result.ConflictIdsToClear))
            }
            if (result.LastSyncDate == null) {
                console.log('No last sync date to update.')
            }

            else {
                console.log('Updating last sync date.')

                dispatch(updateLastSyncDate(result.LastSyncDate))
            }

            this.setState({ loading: false })


        }
        catch (err) {
            this.setState({ error: `An error whilst loading data: ${err.message}` })
            console.log("Error whilst dispatching: " + disp + ". " + err.message)
            console.log("Object: " + obj)
        }


    }

    createSyncData = (data) => {

        const localCopyId = this.getLocalCopyId();


        const syncData = new LocalToServerSyncData(
            localCopyId  //identifies the local copy that the data is coming from
            , this.props.persons.filter(x => x.updatedOnServer === false) //local data that hasn't yet been added to server
            , this.props.localToServerPostBacks // confirmation back to server that updates in the post back have been added to Local.
        )

        return syncData;
    }

    getlatestUpdates = (listUpdates) => {
        const latestUpdates = listUpdates.reduce((acc, update) => {
            if (!acc[update.Id] || update.Created > acc[update.Id].Created) {
                acc[update.Id] = update;
            }
            return acc;
        }, {})

        return Object.values(latestUpdates);
    }


    getLocalCopyId = () => {

        let copyId = this.props.localCopyId;

        if (copyId == null) {
            copyId = uuidv4();
            this.props.dispatch(setLocalCopyId(copyId))
        }
        return copyId;
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
            persons
        } = this.props;

        const data = this.getlatestUpdates(persons);


        const { loading, error } = this.state


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
                        {(loading) && <span>Loading...</span>}
                        {(error) && <span>Error: {error}</span>}
                        {!loading && !error &&
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


                                    <TableHeaderColumn isKey dataField="Id" dataFormat={this.actionFormatter.bind(this)}>
                                        <span className="fs-sm">Actions</span>
                                    </TableHeaderColumn>
                                </BootstrapTable>
                            </>

                        }
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

function mapStateToProps(state) {
    return {
        localCopyId: state.sync.localCopyId,
        localToServerPostBacks: state.persons.localToServerPostBacks,
        persons: state.persons.persons
    };
}

export default connect(mapStateToProps)(UsersTable);
