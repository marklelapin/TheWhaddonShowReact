import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { categorisePersons, addFriendlyName } from 'dataAccess/personScripts';
import Avatar from 'components/Avatar/Avatar';
import Widget from 'components/Widget';

function PersonSelector(props) {

    const { persons = [], tags = [], onClick, closeModal, deselect = true } = props;

    const personsWithFriendlyName = addFriendlyName(persons);

    const categorisedPersons = categorisePersons(personsWithFriendlyName, tags);

    const deselectPerson = { id: null, friendlyName: 'Deselect', avatarInitials: 'X', pictureRef: null }



    const personJSX = (person) => {

        const { id, friendlyName } = person;

        return (
            <div key={id}className="person-button" onClick={() => onClick(id)}>
                <Avatar person={person} avatarInitials={(person.avatarInitials) || null} />
                <span >{friendlyName}</span>
            </div>
        )

    }


    return (

        <Modal isOpen={true} toggle={closeModal}>
            <ModalHeader toggle={closeModal}>Select Person</ModalHeader>
            <ModalBody className="bg-white">


                <Widget
                    widgetType="news"
                    id="news-widget"
                    title={<div><h6> Persons <span className="badge badge-pill badge-success">17</span></h6>
                        <span className="text-muted">select a person from the list below</span>
                    </div>}
                    bodyClass={"pt-3 px-0 py-0"}
                >

                    {(tags.length > 0) &&

                        <>
                            <h5>MATCHING TAGS</h5>
                            <div className="select-person-section">

                                {(categorisedPersons.matchingTags.length === 0) && <p>No matching persons</p>}
                                {categorisedPersons.matchingTags.map(person => {

                                    return personJSX(person)

                                })}
                        
                            </div>
                        </>
                    }
                    <h5>FRONT STAGE</h5>
                    <div className="select-person-section">

                        {categorisedPersons.frontStage.map(person => {

                            return personJSX(person)

                        })}

                    </div>
                    <h5>BACK STAGE</h5>
                    <div className="select-person-section">

                        {categorisedPersons.backStage.map(person => {

                            return personJSX(person)

                        })}

                    </div>

            </Widget>

        </ModalBody>
            <ModalFooter>
                {personJSX(deselectPerson) }
</ModalFooter>
        </Modal >
    )




}

export default PersonSelector;