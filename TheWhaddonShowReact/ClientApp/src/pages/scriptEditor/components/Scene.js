import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLatest, prepareUpdates } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer'

function Scene(props) {

    const { id, newScene } = props;

    const sceneId = id || newScene.id;

    const storedScriptItemsHistory = useSelector(state =>
        state.localServer.scriptItems.history
            .filter((item) => item.parentId === sceneId || item.id === sceneId)) //could reduce the amount retrieved by only get id,created,type and parentId if no of refreshes was an issue. but would need additiona selector for sceneScriptItems

    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time

    const [scriptItems, setScriptItems] = useState(getLatest(storedScriptItemsHistory,undoDateTime))
    


    useEffect(() => {
        setScriptItems(getLatest(storedScriptItemsHistory, undoDateTime))

    }, [undoDateTime, storedScriptItemsHistory])  


    const dispatch = useDispatch()

    const handleUndo = () => {

        const undoDate = undoDateTime || new Date();

        const dateArray = storedScriptItemsHistory.filter(item => item.created < undoDate).map(item => item.created)

        let latestDateBeforeUndo = dateArray[0]

        for (const date of dateArray) {
            if (date > latestDateBeforeUndo)
                latestDateBeforeUndo = date;
        }

        setUndoDateTime(latestDateBeforeUndo)

    }

    const handleRedo = () => {

        const dateArray = storedScriptItemsHistory.filter(item => item.created > undoDateTime).map(item => item.created)
        let earliestDateAfterRedo = dateArray[0]

        for (const date of dateArray) {
            if (date < earliestDateAfterRedo) 
                earliestDateAfterRedo = date;
        }
        setUndoDateTime(earliestDateAfterRedo)
    }


    const handleSetUndo = () => {

        //get distinct set of ids that have updates after the undoDateTime
        const idsToUpdate = new Set(storedScriptItemsHistory.filter(item => item.created > undoDateTime).map(item => item.id))
        //convert to array
        const arrayIds = [...idsToUpdate];
        //filter the scriptItems matching the ids
        const filterScriptItems = scriptItems.filter((item) => arrayIds.includes(item.id));

        //update these scriptItems
        const updates = prepareUpdates(filterScriptItems);

        dispatch(addUpdates(updates));

    }


return (
    <>
        <div className="scene-header">
            Scene Header
        </div>

        <div className="scene-body">
            Scene Body
        </div>

    </>
)
}

export default Scene;