//React and Redux
import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
    trigger, ALLOCATE_PERSON_TO_PART, UPDATE_VIEW_AS_PART_PERSON,
    updatePersonSelectorConfig
} from '../../../actions/scriptEditor'

//Components
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Avatar from '../../../components/Avatar/Avatar';

//utilities
import { categorisePersons, addFriendlyName } from '../../../dataAccess/personScripts';
import { getLatest } from '../../../dataAccess/localServerUtils';
import { moveFocusToId, END } from '../scripts/utility';
import { log, PERSON_SELECTOR as logType } from '../../../dataAccess/logging';

import s from '../Script.module.scss'

function PersonSelector(props) {

    const dispatch = useDispatch();

    //props 
    const { onSelect = null, closeModal, viewAs, backStage = true, frontStage = true } = props;


    //Redux state
    const config = useSelector(state => state.scriptEditor.personSelectorConfig) || null
    const storedPersons = useSelector(state => state.localServer.persons.history)
    const { persons = null, personIds = null, sceneId = null, tags = [], additionalCategory = null, partId } = config || {};

    const scene = useSelector(state => state.scriptEditor.currentScriptItems[sceneId]) || {}
    const scenePartIds = scene?.partIds || []

    const partPersons = useSelector(state => state.scriptEditor.currentPartPersons)

    let additionalCategoryPersons = additionalCategory?.persons || additionalCategory?.partIds?.map(partId => partPersons[partId]) || null
    if (additionalCategoryPersons) additionalCategoryPersons = additionalCategoryPersons.sort((a, b) => (a.friendlyName || a.name || '').localeCompare(b.friendlyName || a.name || ''))
    //calcs

    const scenePartPersonIds = scenePartIds.map(partId => partPersons[partId]) || []

    const allocatedPersonIds = scenePartPersonIds.filter(item => item?.personId !== null).map(person => person?.id)

    const finalPersons = (persons) ? persons
        : ((personIds) ? getLatest(storedPersons.filter(person => personIds.includes(person.id)))
            : (allocatedPersonIds.length > 0) ? getLatest(storedPersons.filter(person => allocatedPersonIds.includes(person?.id) === false))
                : getLatest(storedPersons) || [])

    const personsWithFriendlyName = addFriendlyName(finalPersons);

    const categorisedPersons = categorisePersons(personsWithFriendlyName, tags);

    const deselectPerson = { id: null, friendlyName: 'Deselect', avatarInitials: 'X', pictureRef: null }


    const handleClick = (person) => {

        if (partId) {
            log(logType, 'handleClick ALLOCATE_PERSON_TO_PART', { partId, person })
            dispatch(trigger(ALLOCATE_PERSON_TO_PART, { partId, personId: person.id }))

        } else if (viewAs) {
            log(logType, 'handleClick UPDATE_VIEW_AS_PART_PERSON', { person })
            dispatch(trigger(UPDATE_VIEW_AS_PART_PERSON, { partPerson: person }))
        } else {
            onSelect(person)
        }
        dispatch(updatePersonSelectorConfig(null))
        moveFocusToId(partId, END)
    }

    const personJSX = (person) => {

        const { id, friendlyName, name } = person;

        return (
            <div key={id} className={s['person-selector-button']} onClick={() => handleClick(person)} >
                <Avatar onClick={() => handleClick(person)} person={person} avatarInitials={(person.avatarInitials) || null} />
                <span >{friendlyName || name}</span>
            </div>

        )

    }


    return (
        (config) &&
        <Modal isOpen={true} toggle={closeModal} className={s['person-selector']}>
            <ModalHeader toggle={closeModal}>Select Person</ModalHeader>
            <ModalBody className="bg-white">


                <div className={s['person-selector-body']} >
                    {(additionalCategory && additionalCategoryPersons) &&
                        <>
                            <h5>{additionalCategory.name.toUpperCase()}</h5>
                            <div className={s['person-selector-section']}>
                                {additionalCategoryPersons.map(person => {
                                    return personJSX(person)
                                })}

                            </div>

                        </>

                    }

                    {(tags.length > 0) &&

                        <>
                            <h5>MATCHING TAGS</h5>
                            <div className={s['person-selector-section']}>

                                {(categorisedPersons.matchingTags.length === 0) && <p>No matching persons</p>}
                                {categorisedPersons.matchingTags.map(person => {

                                    return personJSX(person)

                                })}

                            </div>
                        </>
                    }
                    {frontStage &&

                        <>
                            <h5>FRONT STAGE</h5>
                            <div className={s['person-selector-section']}>

                                {categorisedPersons.frontStage.map(person => {

                                    return personJSX(person)

                                })}

                            </div>
                        </>}

                    {backStage &&
                        <>
                            <h5>BACK STAGE</h5>
                            <div className={s['person-selector-section']}>

                                {categorisedPersons.backStage.map(person => {

                                    return personJSX(person)

                                })}

                            </div>
                        </>

                    }


                </div>

            </ModalBody>
            <ModalFooter>
                <div className={s['person-selector-section']}>
                    {personJSX(deselectPerson)}
                    <div key={'cancel-person-selector-button'} className={s['person-selector-button']} >
                        <Button onClick={() => dispatch(updatePersonSelectorConfig(null))}>Cancel</Button>
                    </div>
                </div>
            </ModalFooter>
        </Modal >
    )




}

export default PersonSelector;