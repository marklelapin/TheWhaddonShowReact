import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLatest, prepareUpdates, useSortLatestScriptItems, sortLatestScriptItems, sortScriptItems } from 'dataAccess/localServerUtils';
import { addUpdates } from 'actions/localServer';
import ScriptItem from 'pages/scriptEditor/components/ScriptItem.js';
import PartEditor from 'pages/scriptEditor/components/PartEditor.js';
import { Act, Synopsis, Staging, Dialogue, Action } from 'dataAccess/localServerModels';

function Scene(props) {

    const debug = true;

    const { sceneId } = props;

    debug && console.log('Id Passed into Scene')
    debug && console.log(sceneId)

    //Get child scriptItems from Redux Store
    const storedScriptItemsHistory = useSelector((state) =>
        state.localServer.scriptItems.history
            .filter((item) => (item.parentId === sceneId || item.id === sceneId))) //could reduce the amount retrieved by only get id,created,type and parentId if no of refreshes was an issue. but would need additiona selector for sceneScriptItems

    debug && console.log('storedScriptItemsHistory: ')
    debug && console.log(storedScriptItemsHistory)

    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time


    
    const [scriptItems, setScriptItems] = useState(sortLatestScriptItems(storedScriptItemsHistory,undoDateTime));


    useEffect(() => {
        console.log('useEffect in Scene.js')
        console.log(undoDateTime)
        console.log(storedScriptItemsHistory)
        // Assuming getLatest and sortScriptItems functions are defined elsewhere
        setScriptItems(sortLatestScriptItems(storedScriptItemsHistory,undoDateTime));

    }, [undoDateTime,storedScriptItemsHistory]); 



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

    // find any scene, synosis, staging items that are directly beneath and including scene id and create scene Header
    const sceneHeader = () => {

        if (scriptItems.length === 0) return ({ header: {}, bodyStartIndex: 0 })

        let header = {}
        let complete = false;
        let i = 0

        while (complete === false) {
            const type = scriptItems[i].type
            if (type === 'Scene') {
                header.title = scriptItems[i].text
                header.partIds = scriptItems[i].parts
            }
            else if (type === 'Synopsis') header.synopsis = scriptItems[i].text
            else if (type === 'Staging') header.staging = scriptItems[i].text
            else complete = true;
            i++
        }

        return ({ title: header.title, synopsis: header.synopsis, staging: header.staging, bodyStartIndex: i })
    }

    //get the scriptItems that are not part of the scene header and add them to Internal State
    //--------------------------------------------------------------------------------------
    const bodyScriptItems = () => {

        const { bodyStartIndex } = sceneHeader()

        const body = scriptItems.slice(bodyStartIndex)

        return body;

    }
    //---------------------------------


    return (

        <>
            <div className="scene-header">
                <h1>{sceneHeader().title}</h1>
                <h2>{sceneHeader().synopsis}</h2>
                <h3>{sceneHeader().staging}</h3>
                <PartEditor partIds={sceneHeader().partIds} />
            </div>

            <div className="scene-body">
                {bodyScriptItems().map((scriptItem) => {
                    return (
                        <ScriptItem key={scriptItem.id} scriptItem={scriptItem} />
                    )
                })
                }
            </div>

        </>
    )
}

export default Scene;