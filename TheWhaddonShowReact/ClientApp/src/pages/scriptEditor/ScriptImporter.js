////React & Redux
//import React from 'react';
//import { useEffect, useState } from 'react';
//import { useDispatch, useSelector } from 'react-redux';

////Components
//import ScriptViewer from './components/ScriptViewer';

//import TextDropzone from '../../components/Uploaders/TextDropzone';
//import { Button } from 'reactstrap';

////localServerModels

//import { SCENE, COMMENT } from '../../dataAccess/scriptItemTypes';
//import { prepareUpdates } from '../../dataAccess/localServerUtils';
//import { sortLatestScriptItems } from './scripts/scriptItem';
//import { addUpdates } from '../../actions/localServer';
//import { clearImportUpdates } from '../../actions/scriptEditor';

////Utils
//import { log } from '../../helper.js';
//import isScreen from '../../core/screenHelper';
//import { convertTextToHeaderScriptItems, getScriptItem, filterNonEmptyStrings } from './scripts/import';
//import { getLatest } from '../../dataAccess/localServerUtils'

//import s from './ScriptImporter.module.scss';

//export const IMPORT_GUID = 'd0ca06f0-4ad5-4c82-80b8-96ab3f9c0751'
//function ScriptImporter() {

//    // constants
//    const dispatch = useDispatch()
//    const debug = true;

//    //REdux
//    const sceneHistory = useSelector((state) => state.scriptEditor.sceneHistory)

//    const scenes = sceneHistory.filter(item => item.id === IMPORT_GUID)

//    //Internal State
//    const [fileText, setFileText] = useState(null)
//    const [error, setError] = useState(null)
//    const [inProgress, setInProgress] = useState(false)
//    const [headerUploaded, setHeaderUploaded] = useState(false)
//    const [lineInProgress, setLineInProgress] = useState(null)

//    useEffect(() => {
//        //do nothing on mount but on dismount clear all import scriptItems
//        return () => {
//            dispatch(clearImportUpdates())
//        }
//    }, [])

//    useEffect(() => {
//        dispatch(clearImportUpdates())
//        setHeaderUploaded(false)
//    }, [fileText])


//    useEffect(() => {

//        const convert = async () => {

//            dispatch(clearImportUpdates());

//            let { currentScriptItem, headerTexts, parts } = await createHeaderScriptItems(fileText)

//            setHeaderUploaded(true)

//            if (!headerTexts || headerTexts.length === 0) {
//                alert('No headers found in text')
//                setInProgress(false)
//            }

//            const linesOfText = filterNonEmptyStrings(fileText.split('\n'))


//            for (const lineOfText of linesOfText) {

//                if (inProgress === true && !headerTexts.includes(lineOfText) && lineOfText !== "" && lineOfText !== "\r") {

//                    setLineInProgress(lineOfText)

//                    const newScriptItem = await getScriptItem(lineOfText, parts)

//                    const appendedScriptItem = await appendAndDispatchScriptItem(currentScriptItem, newScriptItem)

//                    currentScriptItem = appendedScriptItem;

//                }
//            }

//            if (inProgress === true) {
//                alert('Conversion Complete')
//                setInProgress(false)
//            }
//            else {
//                alert('Conversion Cancelled')
//            }

//        }
//        if (inProgress === true) {
//            convert()
//        }

//    }, [inProgress])


//    const startConversion = async () => {
//        setInProgress(true);
//        setHeaderUploaded(false)
//    }



//    const createHeaderScriptItems = async (fileText) => {

//        try {
//            const response = await convertTextToHeaderScriptItems(fileText)

//            let parts = []


//            if (response.status === 200) {
//                const { partUpdates, scriptItemUpdates } = response.data
//                if (partUpdates && partUpdates.length > 0) {
//                    parts = partUpdates.map(item => ({ ...item, isImport: true }))
//                    dispatch(addUpdates(parts, 'Part'))
//                }
//                if (scriptItemUpdates && scriptItemUpdates.length > 0) {
//                    scriptItemUpdates.map(item => ({ ...item, parentId: IMPORT_GUID }))
//                    dispatch(addUpdates(scriptItemUpdates, 'ScriptItem'))
//                }
//                const currentScriptItem = scriptItemUpdates.find(item => item.nextId === null);
//                const headerTexts = scriptItemUpdates.map(item => item.text)

//                return { currentScriptItem, headerTexts, parts };
//            }
//            else {
//                throw new Error(response.data.ToString())
//            }
//        }
//        catch (error) {
//            const errorMessage = `Error converting text to header script items. ${error.message}`
//            console.log(errorMessage)
//            alert(errorMessage)
//            return {};
//        }
//    }

//    const appendAndDispatchScriptItem = (currentScriptItem, scriptItemToAppend) => {

//        const newCurrentScriptItemUpdate = { ...currentScriptItem, nextId: scriptItemToAppend.id }
//        const newScriptItemUpdate = { ...scriptItemToAppend, previousId: currentScriptItem.id }

//        const newScriptItemUpdates = prepareUpdates([newCurrentScriptItemUpdate, newScriptItemUpdate])

//        dispatch(addUpdates(newScriptItemUpdates, 'ScriptItem'))

//        return newScriptItemUpdate
//    }

//    const cancelConversion = () => {
//        setInProgress(false)
//    }

//    const isSmallerScreen = () => {
//        return (isScreen('xs') || isScreen('sm'))
//    }

//    const sendToScript = () => {
//        throw new error('sendToScript needs to be changed to reflect head requirement in sortLatestScriptItems')
//        const latestScenes = sortLatestScriptItems(sceneHistory)
//        const lastScene = latestScenes.filter(item => item.nextId === null && item.type !== COMMENT)
//        const importScene = getLatest(latestScenes.filter(item => item.id === IMPORT_GUID))

//        const newUpdates = importScene.map(item => {

//            if (item.type === SCENE) {
//                return { ...item, previousId: lastScene.id, parentId: lastScene.parentId }
//            }
//            return { ...item, parentId: importScene.id }

//        })

//        dispatch(addUpdates(newUpdates, 'ScriptItem'))

//        dispatch(clearImportUpdates())
//    }

//    const handleChange = (newFileText) => {

//        setFileText(newFileText)
//    }


//    log(debug, 'SCriptImporter TextDropzone props', { fileText: fileText, setFileText: setFileText })
//    log(debug, 'ScriptImporter :', {scenes, error, inProgress, headerUploaded, lineInProgress})
//    //-----------------------------------------------------------------------
//    return (

//        <div id="script-importer" className="draft-border">
//            <h1 className="page-title">Script - <span className="fw-semi-bold">Importer</span></h1>
//            {(isSmallerScreen()) &&
//                <p> Sorry, the script importer is not available on smaller screens</p>
//            }

//            {!isSmallerScreen() &&

//                <div className={s['script-importer-content']}>

//                    <>
//                        <div className={s["import-file"]}>
//                            <h3>Import File Text</h3>
//                            <TextDropzone
//                                fileText={fileText}
//                                onChange={(newFileText) => handleChange(newFileText)}
//                            />
//                        </div>
//                        <div className={s['file-converter']}>
//                            <div className={s['file-converter-header']}>
//                                <h3>Text Converter</h3>
//                                {(!inProgress && fileText && fileText.length > 0) && <Button color="success" onClick={() => startConversion()}>StartConversion</Button>}
//                                {(inProgress) && <Button color="warning" onClick={() => cancelConversion()}>Cancel</Button>}
//                                <Button color="primary" onClick={() => sendToScript()} disabled={(scenes.length === 0)}>Send To Script</Button>
//                            </div>
//                            <div className={s['file-converter-content']}>
//                                {(scenes.length > 0) && headerUploaded && error === null &&
//                                    <ScriptViewer scenes={scenes} />
//                                }
//                                {(!fileText || fileText.length === 0) &&
//                                    <p>Imported scene will appear here</p>
//                                }
//                                {error &&
//                                    <p>{error}</p>
//                                }
//                                {inProgress && !headerUploaded &&
//                                    <p>Finding header elements...</p>
//                                }
//                                {
//                                    inProgress && headerUploaded &&
//                                    <>
//                                        <p>Converting text to script items...</p>
//                                        <p>{lineInProgress}</p>
//                                    </>
                                    

//                                }
//                            </div>

//                        </div>

//                    </>
//                </div>
//            }
//        </div>
//    )
//}

//export default ScriptImporter
