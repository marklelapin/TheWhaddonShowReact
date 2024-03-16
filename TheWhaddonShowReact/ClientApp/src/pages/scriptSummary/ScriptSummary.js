import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { trigger, MOVE_SCENE, updatePersonSelectorConfig, ALLOCATE_PERSON_TO_PART } from '../../actions/scriptEditor';

//components
import Avatar from '../../components/Avatar/Avatar';
import QuickToolTip from '../../components/Forms/QuickToolTip';
import { Button } from 'reactstrap';
import { Icon } from '../../components/Icons/Icons';
//utils
import classnames from 'classnames';
import { ACT, SCENE, SYNOPSIS, LIGHTING, SOUND, INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING } from '../../dataAccess/scriptItemTypes';
import { PART } from '../../dataAccess/localServerModels';
import { getLineStats, isQuickChange, isPersonInMultipleParts } from '../../pages/casting/scripts';

//scss
import s from './ScriptSummary.module.scss';
import { isScriptReadOnly } from '../../dataAccess/userAccess';
import { log, SCRIPT_SUMMARY as logType } from '../../dataAccess/logging';


//SummaryTypes
export const SHOW = 'show'
export const TECHNICAL = 'technical'
export const STAGE_MANAGEMENT = 'stageManagement'
export const CASTING = 'casting'
export const CURTAINS = 'curtains'

const ScriptSummary = (props) => {

    const { summaryType = 'SHOW',
        showErrors = false,
        showHighlights = false,
        viewAsPerson = null,
        showFilters = true,
        //onDropPart = null, //TODO-implement drag and drop for parts
        allowPartAllocation = false,
        allowSceneOrderChanges = false,
        setTempPartId = null
    } = props

    const typeMap = new Map([
        [SHOW, [PART, SYNOPSIS]],
        [TECHNICAL, [LIGHTING, SOUND]],
        [CASTING, [PART]],
        [STAGE_MANAGEMENT, [INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING]],
        [CURTAINS, [INITIAL_CURTAIN, CURTAIN]],
        [STAGING, [INITIAL_STAGING, STAGING]],
        ['None', []]
    ]);

    const dispatch = useDispatch();

    const [scenes, setScenes] = useState([])
    const [filter, setFilter] = useState([])

    const show = useSelector(state => state.scriptEditor.show)
    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id])
    const sceneOrders = useSelector((state) => state.scriptEditor.sceneOrders)
    const previousCurtainOpen = useSelector((state) => state.scriptEditor.previousCurtainOpen)
    const currentPartPersons = useSelector((state) => state.scriptEditor.currentPartPersons)
    const currentScriptItems = useSelector((state) => state.scriptEditor.currentScriptItems)

    const currentUser = useSelector(state => state.user.currentUser)
    const isMobileDevice = useSelector(state => state.device.isMobileDevice)
    const readOnly = isScriptReadOnly(currentUser, isMobileDevice)

    const isSceneDraggable = (allowSceneOrderChanges && !readOnly)
    const isPartAllocatable = (allowPartAllocation && !readOnly)
    // const isPartDraggable = (!readOnly) //TODO-implement drag and drop for parts



    useEffect(() => {
        resetFilter(summaryType)
    }, [summaryType]) //eslint-disable-line react-hooks/exhaustive-deps

    const resetFilter = (summaryType) => {
        const newFilter = typeMap.get(summaryType)
        setFilter(newFilter)
        resetScenes(newFilter)
    }

    const toggleFilter = (type) => {
        const typesToCheck = typeMap.get(type) || []
        typesToCheck.push(type)

        const newFilter = typesToCheck.some(type => filter.includes(type))
            ? filter.filter(item => !typesToCheck.includes(item))
            : [...filter, ...typesToCheck];
        setFilter(newFilter)
        resetScenes(newFilter)

    }

    const resetScenes = (newFilter) => {
        //SETUP SCENES
        const initialScenes = showOrder?.map(item => ({ ...currentScriptItems[item.id], sceneNumber: item.sceneNumber, act: item.act, curtainOpen: item.curtainOpen }))

        if (!scenes) setScenes(null)

        const scenesWithParts = (newFilter.includes(PART)) ? addParts(initialScenes) : initialScenes
        const scenesWithScriptItems = addScriptItems(scenesWithParts, newFilter)
        setScenes(scenesWithScriptItems)
    }

    const addParts = (scenes) => {
        const output = scenes.map(scene => ({ ...scene, parts: [...scene.partIds.map(partId => currentPartPersons[partId]).filter(part => part !== undefined)] }))
        return output
    }

    const addScriptItems = (scenes, filter) => {

        const output = scenes.map(scene => {

            const sceneOrder = sceneOrders[scene.id] ? Object.values(sceneOrders[scene.id]) : []

            const sceneScriptItems = sceneOrder.filter(item => filter.includes(item.type))

            return { ...scene, scriptItems: sceneScriptItems }

        })

        return output
    }


    const showCurtain = filter.includes(CURTAIN) || filter.includes(INITIAL_CURTAIN)


    //Errors
    const error = () => {
        return showErrors ? s.error : null
    }
    const unallocatedLineError = (sceneId) => {

        const unallocatedLines = getLineStats(currentScriptItems, sceneId).filter(item => item.partIds[0] === 'unallocated').length || 0;
        log(logType, 'unallocatedLineError', { getLineStats: getLineStats(currentScriptItems, sceneId), sceneId, unallocatedLines })
        return (unallocatedLines > 0) ? `${unallocatedLines} unallocated line(s).` : null
    }

    //highlights
    const partHighlight = (scene, part) => {
        if (!showHighlights) return null
        return highlightViewAsPartPerson(part) || highlightUnallocatedPart(part) || highlightMultipleParts(scene, part) || highlightQuickChange(scene, part)
    }

    const highlightViewAsPartPerson = (part) => {

        return (part.personId === viewAsPerson?.id) ? { class: 'viewAsPartPerson', text: null } : null
    }
    const highlightUnallocatedPart = (part) => {

        return (part.personId === null) ? { class: 'unallocated', text: null } : null
    }

    const highlightQuickChange = (scene, part) => {
        return (isQuickChange(scene, part, currentScriptItems, currentPartPersons)) ? { class: 'quickChange', text: 'quick change!' } : null
    }

    const highlightMultipleParts = (scene, part) => {
        return (isPersonInMultipleParts(scene, part, currentPartPersons)) ? { class: 'multipleParts', text: 'multiple parts!' } : null
    }



    //SCENE DRAG AND DROP
    const handleSceneDragStart = (e) => {
        log(logType, 'hadnleSCeneDragStart', e.currentTarget.dataset.sceneid)
        e.dataTransfer.setData("text/plain", `sceneid:${e.currentTarget.dataset.sceneid}`)

    }
    const handleSceneDragOver = (e) => {
        e.preventDefault()
        if (e.dataTransfer.getData("text/plain").startsWith("sceneid")) {
            e.currentTarget.classList.add(s.dragOver)
        }
    }
    const handleSceneDragLeave = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove(s.dragOver)
    }
    const handleSceneDrop = (e) => {
        e.preventDefault()
        const newPreviousId = e.currentTarget.dataset.sceneid
        const isSceneId = (e.dataTransfer.getData("text/plain").substring(0, 8) === "sceneid")
        const sceneId = e.dataTransfer.getData("text/plain").substring(8)
        if (!isSceneId) {
            alert(`Cant drop that against the scene. If you're trying to allocate cast member drop the cast member on the individual part.`)
        }

        if (isSceneId && sceneId && newPreviousId) {
            dispatch(trigger(MOVE_SCENE, { sceneId, value: newPreviousId }))
        }
    }

    //PART CLICK, DRAG AND DROP

    const handlePartClick = (e, scene, part) => {
        e.preventDefault()
        if (!readOnly) { dispatch(updatePersonSelectorConfig({ sceneId: scene.id, partId: part.id })) }
    }

    const handlePartDragStart = (e) => {
        e.dataTransfer.setData("text/plain", `partid:${e.currentTarget.dataset.partid}`)
        if (setTempPartId) {
            setTempPartId(e.currentTarget.dataset.partid)
        }
    }
    const handlePartDragOver = (e) => {
        log(logType, 'handlePartDragOver')
        e.preventDefault()
        const allocateDiv = getAllocateDiv(e)
        if (allocateDiv) {
            allocateDiv.classList.add(s.dragOver)
            const partId = allocateDiv.dataset.partid;
            log(logType, 'handlePartDragOver', { partId })
            setTempPartId(partId)
        }
    }
    const handlePartDragLeave = (e) => {
        e.preventDefault()
        const allocateDiv = getAllocateDiv(e)
        if (allocateDiv) {
            allocateDiv.classList.remove(s.dragOver)
        }
        setTempPartId(null)
    }

    const handlePartDrop = (e) => {
        e.preventDefault()
        const isPersonId = (e.dataTransfer.getData("text/plain").substring(0, 8) === "personid")
        const allocateDiv = getAllocateDiv(e)
        if (allocateDiv && isPersonId) {
            allocateDiv.classList.remove(s.dragOver)
            const partId = allocateDiv.dataset.partid;
            const personId = e.dataTransfer.getData("text/plain").substring(9)
            log(logType, 'handlePartDrop', { partId, personId })
            dispatch(trigger(ALLOCATE_PERSON_TO_PART, { partId, personId }))
            setTempPartId(null)
        }
    }


    const getAllocateDiv = (e) => {
        let allocateDiv = null
        let currentElement = e.currentTarget
        while (currentElement) {
            if (currentElement.classList.contains('allocatePersonOnDrop')) {
                allocateDiv = currentElement
                break;
            }
            currentElement = currentElement.parentElement
        }
        return allocateDiv
    }
    //--END OF PART DRAG AND DROP------------------------------------------------------------------------------


    const scriptSummarySceneId = (scene) => {
        return `script-summary-scene-${scene.id}`
    }
    const scriptSummaryScenePartId = (scene, part) => {
        return `script-summary-scene-part-${scene.id}-${part.id}`
    }

    const act1Scenes = scenes.filter(scene => scene.act === 1)
    const act2Scenes = scenes.filter(scene => scene.act === 2)

    const actJsx = (scenes) => (
        scenes.map(scene => (

            <div key={scene.id}
                className={s.scene}

            >
                {scene.type === ACT &&
                    <div className={s.actHeader}>
                        <h3>{scene.text}</h3><span className={error()}>{unallocatedLineError(scene.id)}</span>
                    </div>}
                {scene.type === SCENE &&
                    <>
                        <div id={scriptSummarySceneId(scene)}
                            className={classnames(
                                s.sceneHeader,
                                isSceneDraggable ? s.clickable : null,
                                previousCurtainOpen[scene.id] ? s.curtainOpen : s.curtainClosed,
                                showCurtain ? s.showCurtain : null

                            )}
                            data-sceneid={scene.id}
                            onDragOver={isSceneDraggable ? handleSceneDragOver : null}
                            onDragLeave={isSceneDraggable ? handleSceneDragLeave : null}
                            onDrop={isSceneDraggable ? handleSceneDrop : null}
                            onDragStart={isSceneDraggable ? handleSceneDragStart : null}
                            draggable={isSceneDraggable}
                        >
                            {`${scene.sceneNumber}. ${scene.text}`}
                        </div>
                        {allowSceneOrderChanges && <QuickToolTip id={scriptSummarySceneId(scene)} tip={'drag to move scene'} placement={'left'} />}

                        {filter.includes(SYNOPSIS) &&
                            <div className={classnames(
                                s.synopsis,
                                (previousCurtainOpen[scene.id]) ? s.curtainOpen : s.curtainClosed,
                                showCurtain ? s.showCurtain : null
                            )}>
                                {scene.scriptItems?.find(item => item.type === SYNOPSIS)?.text || null}
                            </div>
                        }
                        {filter.includes(PART) &&
                            <div className={classnames(
                                s.sceneParts,
                                (previousCurtainOpen[scene.id]) ? s.curtainOpen : s.curtainClosed,
                                showCurtain ? s.showCurtain : null
                            )} >
                                {scene.parts.map((part, idx) => (

                                    <div key={idx}>
                                        <div id={scriptSummaryScenePartId(scene, part)}
                                            className={classnames(
                                                s.part,
                                                s[partHighlight(scene, part)?.class],
                                                isPartAllocatable ? s.clickable : null,
                                                'allocatePersonOnDrop'
                                            )}
                                            onClick={readOnly ? null : (e) => handlePartClick(e, scene, part)}
                                            data-partid={part.id}
                                            onDragOver={isPartAllocatable ? handlePartDragOver : null}
                                            onDragLeave={isPartAllocatable ? handlePartDragLeave : null}
                                            onDrop={isPartAllocatable ? handlePartDrop : null}
                                            onDragStart={isPartAllocatable ? handlePartDragStart : null}
                                            draggable={isPartAllocatable}
                                        >
                                            <div className={s.partAvatar}>
                                                {part.personId && <Avatar partId={part.id} size='xs' />}
                                            </div>
                                            <div className={classnames(s.partName)} >
                                                {part.name}
                                                {(idx !== scene.parts.length - 1) ? ',' : ''}
                                            </div>
                                            <div className={classnames(s.highlightText, s[partHighlight(scene, part)?.class])}>
                                                {partHighlight(scene, part)?.text}
                                            </div>
                                        </div>
                                        {isPartAllocatable && <QuickToolTip id={scriptSummaryScenePartId(scene, part)} tip={'reallocate part'} placement={'top'} />}
                                    </div>


                                ))}

                            </div>
                        }
                        {scene.scriptItems?.map(scriptItem =>
                            (scriptItem.type !== SYNOPSIS) &&
                            <div key={scriptItem.id}
                                className={classnames(
                                    s[scriptItem.type],
                                    s.scriptItem,
                                    (scriptItem.text?.length > 0) ? null : s.error,
                                    (scriptItem.curtainOpen) ? s.curtainOpen : s.curtainClosed,
                                    showCurtain ? s.showCurtain : null
                                )}>

                                {scriptItem.type === LIGHTING && <Icon icon="lightbulb" className={s.scriptItemIcon} />}
                                {scriptItem.type === SOUND && <Icon icon="sound" className={s.scriptItemIcon} />}
                                {[STAGING, INITIAL_STAGING].includes(scriptItem.type) && <Icon icon="staging" className={s.scriptItemIcon} />}

                                {<span >{(scriptItem.text?.length > 0) ? scriptItem.text : 'Needs adding!'}</span>}
                            </div>

                        )
                        }
                    </>
                }
            </div >

        ))
    )


    const buttonColor = (type) => {


        return filter.includes(type) ? 'primary' : 'secondary'
    }

    log(logType, 'sceneOrder', previousCurtainOpen)

    return (
        <>
            {showFilters &&

                <div className={s.filter}>
                    <Button size="xs" color={buttonColor(SYNOPSIS)} onClick={() => toggleFilter(SYNOPSIS)}>Synopsis</Button>
                    <Button size="xs" color={buttonColor(PART)} onClick={() => toggleFilter(PART)}>Casting</Button>
                    <Button size="xs" color={buttonColor(STAGING)} onClick={() => toggleFilter(STAGING)}>Staging</Button>
                    <Button size="xs" color={buttonColor(CURTAINS)} onClick={() => toggleFilter(CURTAINS)}>Curtains</Button>
                    <Button size="xs" color={buttonColor(LIGHTING)} onClick={() => toggleFilter(LIGHTING)}>Lighting</Button>
                    <Button size="xs" color={buttonColor(SOUND)} onClick={() => toggleFilter(SOUND)}>Sound</Button>

                    {filter.includes(STAGING) &&
                        <div className={s.summaryKey}>
                            <Icon icon="staging" className={s.scriptItemIcon} />Staging
                        </div>}
                    {filter.includes(LIGHTING) &&
                        <div className={s.summaryKey}>
                            <Icon icon="lightbulb" className={s.scriptItemIcon} />Lighting
                        </div>}
                    {filter.includes(SOUND) &&
                        <div className={s.summaryKey}>
                            <Icon icon="sound" className={s.scriptItemIcon} />Sound
                        </div>}
                    {(filter.includes(CURTAIN) || filter.includes(INITIAL_CURTAIN)) &&
                        <>
                            <div className={classnames(s.curtainKey, s.curtainClosed, showCurtain ? s.showCurtain : null)}>Curtain Closed</div>
                            <div className={classnames(s.curtainKey, s.curtainOpen, showCurtain ? s.showCurtain : null)}>Curtain Open</div>
                        </>

                    }

                </div >

            }
            <div className={s.container}>

                <div className={s.programmeSection}>
                    <div id="Act1" key="Act1" className={s.act}>
                        {actJsx(act1Scenes)}
                    </div>
                    <div id="Act2" key="Act2" className={s.act}>
                        {actJsx(act2Scenes)}
                    </div>
                </div>
            </div>
        </ >
    )

}
export default ScriptSummary;

