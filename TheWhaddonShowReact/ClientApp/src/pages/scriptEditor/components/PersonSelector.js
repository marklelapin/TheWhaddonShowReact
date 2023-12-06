//React and Redux
import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
    trigger, ALLOCATE_PERSON_TO_PART, UPDATE_VIEW_AS_PART_PERSON,
    updatePersonSelectorConfig
} from '../../../actions/scriptEditor'

//Components
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Avatar from '../../../components/Avatar/Avatar';
import Widget from '../../../components/Widget';

//utilities
import { categorisePersons, addFriendlyName } from '../../../dataAccess/personScripts';
import { getLatest } from '../../../dataAccess/localServerUtils';
import { moveFocusToId, END } from '../scripts/utility';

import s from '../Script.module.scss'

function PersonSelector(props) {

    const dispatch = useDispatch();

    //props 
    const { onSelect = null, closeModal, viewAs } = props;


    //Redux state
    const config = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const { persons = null, personIds = null, sceneId = null, tags = [], additionalCategory = null, partId } = config || {};


    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId]) || {}
    const scenePartIds = scene.partIds || []

    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)



    //calcs

    const scenePartPersonIds = scenePartIds.map(partId => partPersons[partId]) || []

    const allocatedPersonIds = scenePartPersonIds.filter(item => item.personId !== null).map(person => person.id)

    const finalPersons = (persons) ? persons
        : ((personIds) ? getLatest(storedPersons.filter(person => personIds.includes(person.id)))
            : (allocatedPersonIds.length>0) ? getLatest(storedPersons.filter(person => allocatedPersonIds.includes(person.id) === false))
                : getLatest(storedPersons) || [])

    const personsWithFriendlyName = addFriendlyName(finalPersons);

    const categorisedPersons = categorisePersons(personsWithFriendlyName, tags);

    const deselectPerson = { id: null, friendlyName: 'Deselect', avatarInitials: 'X', pictureRef: null }


    const handleClick = (person) => {

        if (partId) {
            dispatch(trigger(ALLOCATE_PERSON_TO_PART, { partId, personID: person.id }))

        } else if (viewAs) {
            dispatch(trigger(UPDATE_VIEW_AS_PART_PERSON, { person }))
        } else {
            onSelect(person)
        }
        dispatch(updatePersonSelectorConfig(null))
        moveFocusToId(partId,END)
    }

    const personJSX = (person) => {

        const { id, friendlyName } = person;

        return (
            <div key={id} className="person-button" >
                <Avatar onClick={() => handleClick(person)} person={person} avatarInitials={(person.avatarInitials) || null} />
                <span >{friendlyName}</span>
            </div>
        )

    }


    return (
        (config) &&
        <Modal isOpen={true} toggle={closeModal} className={s['person-selector']}>
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
                    {(additionalCategory && additionalCategory.persons) &&
                        <>
                            <h5>{additionalCategory.name.toUpperCase()}</h5>
                            <div className="select-person-section">
                                {additionalCategory.persons.map(person => {
                                    return personJSX(person)
                                })}

                            </div>

                        </>

                    }

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
                {personJSX(deselectPerson)}
            </ModalFooter>
        </Modal >
    )




}

export default PersonSelector;