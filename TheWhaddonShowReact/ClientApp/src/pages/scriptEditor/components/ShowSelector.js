//React & Redux
import React from 'react';
import {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';


//Components
import { FormGroup, Input, Button } from 'reactstrap';

//utils

import { SCRIPT_ITEM } from '../../../dataAccess/localServerModels.js';
import { prepareUpdates, getLatest } from '../../../dataAccess/localServerUtils.js';
import { newScriptItemsForCreateShow } from '../scripts/scriptItem.js';
import { addUpdates } from '../../../actions/localServer.js';
//constants
import { SHOW } from '../../../dataAccess/scriptItemTypes.js'

function ShowSelector(props) {

    const dispatch = useDispatch();


    //props
    const { onClick } = props

    //redux
    const scriptItems = useSelector((state) => state.localServer.scriptItems) || []

    const shows = getLatest(scriptItems.filter((item) => item.type === SHOW))


    //local state
    const [newShowName, setNewShowName] = useState('')



    const createNewShow = () => {

        if (newShowName.length === 0) {
            alert('Please enter a show name')
        } else {
            const scriptItems = newScriptItemsForCreateShow(newShowName)
            const preparedUpdates = prepareUpdates(scriptItems)
            dispatch(addUpdates(preparedUpdates, SCRIPT_ITEM))
            setNewShowName('')
        }
    }
    

    return (
        <>
            <h2>Choose a show...</h2>
            <div id="show-selector">
                {shows.map((show) => {
                    return (
                        <Button key={show.id} onClick={() => onClick(show)}>{show.text}</Button>
                    )
                })}
                <FormGroup>
                    <Input type="text" name="newShow" id="newShow" value={newShowName} placeholder="New Show Name" onChange={((e) => setNewShowName(e.target.value))} />
                    <Button type="submit" key={"createNew"} onClick={() => createNewShow()}>Create New Show!</Button>
                </FormGroup>
            </div>
        </>


    )

}
export default ShowSelector;