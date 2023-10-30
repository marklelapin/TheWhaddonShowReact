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

//localServerModels
import { ScriptItemUpdate, ScriptItem } from 'dataAccess/localServerModels';
import { SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN, DIALOGUE } from 'dataAccess/scriptItemTypes';
import { prepareUpdates } from 'dataAccess/localServerUtils';
import { sortLatestScriptItems } from './scripts/scriptItem';
import { addUpdates } from 'actions/localServer';

//Utils
import { log } from 'helper.js';
import isScreen from 'core/screenHelper';
import ImportFileViewer from './components/ImportFileViewer';
import { convertTextToScriptItems } from './scripts/import';


function ScriptImporter() {



    const [scenes, setScenes] = useState([])
    const [fileText, setFileText] = useState(null)


    useEffect(() => {

        const scriptItems = convertTextToScriptItems(fileText)
        
    }, [fileText])

    const isSmallerScreen = () => {

        return (isScreen('xs') || isScreen('sm'))

    }

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
                                setFileText={setFileText}
                            />
                        </div>
                        <div className="draft-border">
                            {(scenes.length > 0) &&
                                <ScriptViewer scenes={scenes} />
                             }
                             <p>Imported scene will appear here</p>
                        </div>
                        
                    </>
                </div>
            }
        </div>
    )
}

 export default ScriptImporter
