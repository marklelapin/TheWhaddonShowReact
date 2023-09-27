import React from 'react';
import {useState, useEffect} from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import Dialogue from './Dialogue';

function ScriptItem(props) {

    const dispatch = useDispatch()

    const { scriptItem: storedScriptItem , onChange, alignRight = false, parts } = props;

    const { id, type } = storedScriptItem; 


    const [scriptItem, setScriptItem] = useState({})


    useEffect(() => {
        setScriptItem(storedScriptItem)
    },[])

    const handleDialogueChange = (type, value) => {
        switch (type) {
            case 'text': setScriptItem({ ...scriptItem, text: value })
                break;
            case 'partIds': setScriptItem({ ...scriptItem, partIds: value })
                break;
            default: return;

        }
    }


    if (type === "Dialogue") {
        return (
            <Dialogue key={id} scriptItem={scriptItem} onChange={handleDialogueChange} alignRight={alignRight} parts={parts} />
        )
    }

    return (
        <>
            <h5>{type}:</h5><h6>{scriptItem.text}</h6>

        </>


    )
}

export default ScriptItem;