//React & Redux
import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { store } from 'index'

//Components
import SceneSelector from './components/SceneSelector';
import ScriptViewer from './components/ScriptViewer';
import TextDropzone from 'components/Uploaders/TextDropzone';
import { Button } from 'reactstrap';

//localServerModels
import { ScriptItemUpdate, ScriptItem } from 'dataAccess/localServerModels';
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN, DIALOGUE, COMMENT } from 'dataAccess/scriptItemTypes';
import { prepareUpdates } from 'dataAccess/localServerUtils';
import { sortLatestScriptItems } from './scripts/scriptItem';
import { addUpdates } from 'actions/localServer';
import { clearImportUpdates } from 'actions/scriptEditor';

//Utils
import { log } from 'helper.js';
import isScreen from 'core/screenHelper';
import ImportFileViewer from './components/ImportFileViewer';
import { convertTextToScriptItems } from './scripts/import';
import { getLatest } from 'dataAccess/localServerUtils'

import s from './ScriptImporter.module.css';

export const IMPORT_GUID = 'd0ca06f0-4ad5-4c82-80b8-96ab3f9c0751'
function ScriptImporter() {

    // constants
    const dispatch = useDispatch()
    const debug = true;

    //REdux
    const sceneHistory = useSelector((state) => state.scriptEditor.sceneHistory)



    //Internal STate
    const [scenes, setScenes] = useState([])
    const [fileText, setFileText] = useState(null)

    useEffect(() => {
        //do nothing on mount but on dismount clear all import scriptItems
        return () => {
            dispatch(clearImportUpdates())
        }
    }, [])


    useEffect(() => {
        async function getScriptItems() {

            if (fileText && fileText.length > 0) {

                try {
                    const response = await convertTextToScriptItems(fileText)

                    if (response.status === 200) {
                        const { newPartUpdates, newScriptItemUpdates } = response.data
                        if (newPartUpdates.length > 0) {
                            newPartUpdates.map(item => ({ ...item, isImport: true }))
                            dispatch(addUpdates(newPartUpdates, 'Part'))
                        }
                        if (newScriptItemUpdates.length > 0) {
                            newScriptItemUpdates.map(item => ({ ...item, parentId: IMPORT_GUID }))
                            dispatch(addUpdates(newScriptItemUpdates, 'ScriptItem'))
                        }

                    };

                }
                catch (error) {
                    console.error(error)
                }
            }
        }

        getScriptItems()

    }, [fileText])

    const isSmallerScreen = () => {
        return (isScreen('xs') || isScreen('sm'))
    }

    const confirmImport = () => {
        const latestScenes = sortLatestScriptItems(sceneHistory)
        const lastScene = latestScenes.filter(item => item.nextId === null && item.type !== COMMENT)
        const importScene = getLatest(latestScenes.filter(item => item.id === IMPORT_GUID))

        const newUpdates = importScene.map(item => {

            if (item.type === SCENE) {
                return { ...item, previousId: lastScene.id, parentId: lastScene.parentId }
            }
            return { ...item, parentId: importScene.id }

        })

        dispatch(addUpdates(newUpdates, 'ScriptItem'))

        dispatch(clearImportUpdates())
    }

    const handleChange = (newFileText) => {

        setFileText(newFileText)
    }


    log(debug, 'SCriptImporter TextDropzone props', { fileText: fileText, setFileText: setFileText })
    //-----------------------------------------------------------------------
    return (

        <div id="script-importer" className="draft-border">
            <h1 className="page-title">Script - <span className="fw-semi-bold">Importer</span></h1>
            {(isSmallerScreen()) &&
                <p> Sorry, the script importer is not available on smaller screens</p>
            }

            {!isSmallerScreen() &&

                <div id="script-importer-content">

                    <>
                        <div id="importFileViewer">
                            <h3>Import File</h3>
                            <TextDropzone
                                fileText={fileText}
                                onChange={(newFileText) => handleChange(newFileText)}
                            />
                        </div>
                        <div className="draft-border">
                            {(scenes.length > 0) &&
                                <ScriptViewer scenes={scenes} />
                            }
                            <p>Imported scene will appear here</p>
                            <Button onClick={() => confirmImport()}>Send To Script</Button> }
                        </div>

                    </>
                </div>
            }
        </div>
    )
}

export default ScriptImporter
