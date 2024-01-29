import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { trigger, MOVE_SCENE } from '../../actions/scriptEditor';

//components
import Avatar from '../../components/Avatar/Avatar';

//utils
import classnames from 'classnames';
import { ACT, SCENE, SYNOPSIS, LIGHTING, SOUND, INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING } from '../../dataAccess/scriptItemTypes';
import { PART } from '../../dataAccess/localServerModels';
import { getLineStats, isQuickChange, isPersonInMultipleParts } from '../../pages/casting/scripts';

//scss
import s from './ScriptSummary.module.scss';
import { isScriptReadOnly } from '../../dataAccess/userAccess';

//SummaryTypes
export const SHOW = 'show'
export const TECHNICAL = 'technical'
export const STAGE_MANAGEMENT = 'stageManagement'
export const CASTING = 'casting'

const ScriptSummary = (props) => {

    const { summaryType = 'None',
        showErrors = false,
        showHighlights = false,
        viewAsPerson = null,
        onClickPart = null,
        onDropPart = null,
        allowSceneOrderChanges = false
    } = props

    const typeMap = new Map([
        [SHOW, [PART, SYNOPSIS]],
        [TECHNICAL, [LIGHTING, SOUND]],
        [CASTING, [PART]],
        [STAGE_MANAGEMENT, [INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING]],
        ['None', []]
    ]);

    const dispatch = useDispatch();


    const [types, setTypes] = useState([])

    const show = useSelector(state => state.scriptEditor.show)
    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id])

    const currentPartPersons = useSelector((state) => state.scriptEditor.currentPartPersons)
    const currentScriptItems = useSelector((state) => state.scriptEditor.currentScriptItems)

    const currentUser = useSelector(state => state.user.currentUser)
    const readOnly = isScriptReadOnly(currentUser)

    const isSceneDraggable = (allowSceneOrderChanges && !readOnly)
    const isPartDraggable = (!readOnly)


    const [beingDragged, setBeingDragged] = useState(false)

    useEffect(() => {
        setTypes(typeMap.get(summaryType))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    console.log(showOrder)

    //SETUP SCENES
    let scenes = showOrder.map(item => ({ ...currentScriptItems[item.id], sceneNumber: item.sceneNumber, act: item.act, curtainOpen: item.curtainOpen }))

    const addParts = (scenes) => {
        return scenes.map(scene => ({ ...scene, parts: [...scene.partIds.map(partId => currentPartPersons[partId]).filter(part => part !== undefined)] }))
    }
    const addSynopses = (scenes) => {
        const synopses = Object.values(currentScriptItems).filter(item => item.type === SYNOPSIS)
        return scenes.map(scene => ({ ...scene, synopsis: synopses.find(synopsis => synopsis.parentId === scene.id)?.text }))
    }

    if (types.includes(PART)) scenes = addParts(scenes)
    if (types.includes(SYNOPSIS)) scenes = addSynopses(scenes)


    //Errors
    const error = () => {
        return showErrors ? s.error : null
    }
    const unallocatedLineError = (sceneId) => {

        const unallocatedLines = getLineStats(currentScriptItems, sceneId).filter(item => item.partIds[0] === 'unallocated').length || 0;
        console.log('unallocatedLineError', { getLineStats: getLineStats(currentScriptItems, sceneId), sceneId, unallocatedLines })
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
        e.dataTransfer.setData("text/plain", `sceneId:${e.currentTarget.dataset.sceneid}`)
        setBeingDragged(true)
    }
    const handleSceneDragOver = (e) => {
        e.preventDefault()
        console.log(e.dataTransfer.getData("text/plain"))
        if (e.dataTransfer.getData("text/plain").startsWith("sceneId")) {
            e.currentTarget.classList.add(s.dragOver)
        }
    }
    const handleSceneDragLeave = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove(s.dragOver)
    }
    const handleSceneDrop = (e) => {
        e.preventDefault()
        setBeingDragged(false)
        const newPreviousId = e.currentTarget.dataset.sceneid

        const sceneId = e.dataTransfer.getData("text/plain").substring(8)

        dispatch(trigger(MOVE_SCENE, { sceneId, value: newPreviousId }))
    }




    const act1Scenes = scenes.filter(scene => scene.act === 1)
    const act2Scenes = scenes.filter(scene => scene.act === 2)

    const actJsx = (scenes) => (
        scenes.map(scene => (
            <div key={scene.id}
                className={s.scene}
                data-sceneId={scene.id}
                onDragOver={isSceneDraggable ? handleSceneDragOver : null}
                onDragLeave={isSceneDraggable ? handleSceneDragLeave : null}
                onDrop={isSceneDraggable ? handleSceneDrop : null}
                onDragStart={isSceneDraggable ? handleSceneDragStart : null}
                draggable={isSceneDraggable}
            >
                {scene.type === ACT &&
                    <div className={s.actHeader}>
                        <span>{scene.text}</span><span className={error()}>{unallocatedLineError(scene.id)}</span>
                    </div>}
                {scene.type === SCENE &&
                    <>
                        <div className={classnames(s.sceneHeader, isSceneDraggable ? 'clickable' : null)}

                        >
                            {`${scene.sceneNumber}. ${scene.text}`}
                        </div>

                        {types.includes(SYNOPSIS) &&
                            <div className={s.synopsis}>
                                {scene.synopsis}
                            </div>
                        }
                        {types.includes(PART) &&
                            <div className={s.sceneParts}>
                                {scene.parts.map((part, idx) => (
                                    <div key={part.id}
                                        className={classnames(s.part, s[partHighlight(scene, part)?.class], (onClickPart && !readOnly) ? 'clickable' : null)}
                                        onClick={readOnly ? null : (e) => onClickPart(e, scene, part)}
                                        data-partId={part.id}
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
                                ))}
                            </div>
                        }
                    </>
                }
            </div>
        ))
    )

    return (
        <>
            <div className={s.container}>
                <div className={s.castSection}>
                </div>
                <div className={s.programmeSection}>
                    <div id="Act1" className={s.act}>
                        {actJsx(act1Scenes)}
                    </div>
                    <div id="Act2" className={s.act}>
                        {actJsx(act2Scenes)}
                    </div>
                </div>
            </div>
        </>
    )

}
export default ScriptSummary;

