import React from 'react';
import { Button } from 'reactstrap'; // eslint-disable-line no-unused-vars }


function Update(props) {

    const { hasChanged, onClickUpdate, onClickCancel, isNew } = props


    /*  const {userChanged,newUser } = props*/


    //Functionality for both table and modal.

    const buttonConfig = () => {

        if (!hasChanged) {
            return {
                disabled: true,
                text: 'No changes',
                color: 'tertiary'
            }
        }
        if (isNew === true) {
            return {
                disabled: false,
                text: 'Add',
                color: 'danger'
            }
        }

        return {
            disabled: false,
            text: 'Update',
            color: 'danger'
        }
    }


    return (
        <>
            <Button id="save" type="submit" color={buttonConfig().color} size="xs" onClick={onClickUpdate} className={(buttonConfig().disable) ? 'disabled' : ''}>{buttonConfig().text}</Button >
            {hasChanged && <Button id="cancel" type="button" color="secondary" size="xs" onClick={onClickCancel} >Cancel</Button>}

        </>


    )
}

export default Update
