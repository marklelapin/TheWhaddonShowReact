import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index.js';
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

    const dispatch = useDispatch()

    //Get stored scriptItems from Redux Store
    const getScriptItems = (state) => state.localServer.scriptItems.history
    const refreshStore = () => Math.random();
    const storedScriptItemsSelector = createSelector(
        [getScriptItems,refreshStore],
        (item,_) => item.filter((item) => (item.parentId === sceneId || item.id === sceneId)))

    const storedScriptItems = storedScriptItemsSelector(store.getState())


    debug && console.log('storedScriptItems: ')
    debug && console.log(storedScriptItems)


    //set internal state for scriptItems that are not yet synced with the redux store
    const [undoDateTime, setUndoDateTime] = useState(null); //if this is null then will just show latest version other wise will show all updates before this date time
    const [scriptItemsToAdd, setScriptItemsToAdd] = useState([]);


    //COMBINED SCRIPT ITEMS State processing
    ///combines stored scriptItems with scriptItemsToAdd filters for the latest versions before undoDate and then sorts them into the correct order
    const [combinedScriptItems, setCombinedScriptItems] = useState([])
    useEffect(() => {
        debug && console.log('USe effect for combinedScriptItems from Scene.js')
        setCombinedScriptItems(sortLatestScriptItems([...storedScriptItems, ...scriptItemsToAdd], undoDateTime))

    }, [scriptItemsToAdd, undoDateTime])


    //SCENE HEADER State processing
    // find any scene, synosis, staging items that are directly beneath and including scene id and create scene Header
    const createSceneHeader = () => {

        if (combinedScriptItems.length === 0) return ({ header: {}, bodyStartIndex: 0 })

        let header = {}
        let complete = false;
        let i = 0

        while (complete === false) {
            const type = combinedScriptItems[i].type
            if (type === 'Scene') {
                header.title = combinedScriptItems[i].text
                header.partIds = combinedScriptItems[i].parts
            }
            else if (type === 'Synopsis') header.synopsis = combinedScriptItems[i].text
            else if (type === 'Staging') header.staging = combinedScriptItems[i].text
            else complete = true;
            i++
        }

        return ({ title: header.title, synopsis: header.synopsis, staging: header.staging, partIds: header.partIds, bodyStartIndex: i-1 })
    }
    const [sceneHeader, setSceneHeader] = useState({})

    useEffect(() => {
        debug && console.log('USerEffect for sceneHeader from Scene.js')
        setSceneHeader(createSceneHeader())
    }, [combinedScriptItems]) //eslint-disable-line react-hooks/exhaustive-deps

    //BODY SCRIPT ITEMS State processing
    //get the scriptItems that are not part of the scene header and add them to Internal Statebod
    const filterBodyScriptItems = () => {

        const { bodyStartIndex } = sceneHeader

        const body = [...combinedScriptItems].slice(bodyStartIndex)

        return body;
    }
    const [bodyScriptItems, setBodyScriptItems] = useState([])
    useEffect(() => {
        debug && console.log('UseEffect for bodyScriptItems from Scene.js')
        setBodyScriptItems(filterBodyScriptItems())
    }, [sceneHeader]) //eslint-disable-line react-hooks/exhaustive-deps 









    const handleUndo = () => {

        const undoDate = undoDateTime || new Date();

        const dateArray = [...storedScriptItems, ...scriptItemsToAdd].filter(item => item.created < undoDate).map(item => item.created)

        let latestDateBeforeUndo = dateArray[0]

        for (const date of dateArray) {
            if (date > latestDateBeforeUndo)
                latestDateBeforeUndo = date;
        }

        setUndoDateTime(latestDateBeforeUndo)

    }

    const handleRedo = () => {

        const dateArray = [...storedScriptItems, ...scriptItemsToAdd].filter(item => item.created > undoDateTime).map(item => item.created)
        let earliestDateAfterRedo = dateArray[0]

        for (const date of dateArray) {
            if (date < earliestDateAfterRedo)
                earliestDateAfterRedo = date;
        }
        setUndoDateTime(earliestDateAfterRedo)
    }


    const handleSetUndo = () => {

        //process scriptItemsToAdd

        const idsToUpdate = new Set([...storedScriptItems, ...scriptItemsToAdd].filter(item => item.created > undoDateTime).map(item => item.id))


        //convert to array
        const arrayIds = [...idsToUpdate];
        //filter the scriptItems matching the ids
        const filterScriptItems = combinedScriptItems.filter((item) => arrayIds.includes(item.id));

        //update these scriptItems
        const updates = prepareUpdates(filterScriptItems);

        dispatch(addUpdates(updates));

    }

    const handlePartEditorChange = () => {

        //Part Editor updates partIds against ehe scene SCript Item within the component itself.
        //This fucntion forces a refresh of the data from the REdux Story
        refreshStore();

    }



    //---------------------------------
    console.log('SceneHeader.partIds from Scene.js')
    console.log(sceneHeader.partIds)

    return (
        (sceneHeader) &&
        <>

            <div className="scene-header">
                <h1>{sceneHeader.title}</h1>
                <h2>{sceneHeader.synopsis}</h2>
                <h3>{sceneHeader.staging}</h3>
                <PartEditor partIds={sceneHeader.partIds} onChange={() => handlePartEditorChange()} />
            </div>

            <div className="scene-body">
                {bodyScriptItems.map((scriptItem) => {
                    return (
                        <ScriptItem key={scriptItem.id} scriptItem={scriptItem} parts={sceneHeader.partIds} />
                    )
                })
                }
            </div>

        </>
    )
}

export default Scene;