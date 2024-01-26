import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//components
import Avatar from '../../components/Avatar/Avatar';

//utils
import classnames from 'classnames';
import { ACT, SCENE, SYNOPSIS, LIGHTING, SOUND, INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING } from '../../dataAccess/scriptItemTypes';
import { PART } from '../../dataAccess/localServerModels';
//scss
import s from './ScriptSummary.module.scss';

//SummaryTypes
export const SHOW = 'show'
export const TECHNICAL = 'technical'
export const STAGE_MANAGEMENT = 'stageManagement'
export const CASTING = 'casting'

const ScriptSummary = (props) => {

    const { summaryType = 'None' } = props

    const typeMap = new Map([
        [SHOW, [PART, SYNOPSIS]],
        [TECHNICAL, [LIGHTING, SOUND]],
        [CASTING, [PART]],
        [STAGE_MANAGEMENT, [INITIAL_CURTAIN, CURTAIN, INITIAL_STAGING, STAGING]],
        ['None', []]
    ]);

    const [types, setTypes] = useState([])

    const show = useSelector(state => state.scriptEditor.show)

    const showOrder = useSelector((state) => state.scriptEditor.sceneOrders[show.id])

    const currentParts = useSelector((state) => state.scriptEditor.currentPartPersons)

    const currentScriptItems = useSelector((state) => state.scriptEditor.currentScriptItems)

    useEffect(() => {
        setTypes(typeMap.get(summaryType))
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    console.log(showOrder)

    //SETUP SCENES
    let scenes = showOrder.map(item => ({ ...currentScriptItems[item.id], sceneNumber: item.sceneNumber, act: item.act,curtainOpen: item.curtainOpen }))

    const addParts = (scenes) => {
        return scenes.map(scene => ({ ...scene, parts: [...scene.partIds.map(partId => currentParts[partId]).filter(part => part !== undefined)] }))
    }
    const addSynopses = (scenes) => {
        const synopses = Object.values(currentScriptItems).filter(item => item.type === SYNOPSIS)
        return scenes.map(scene => ({ ...scene, synopsis: synopses.find(synopsis => synopsis.parentId === scene.id)?.text }))
    }

    if (types.includes(PART)) scenes = addParts(scenes)
    if (types.includes(SYNOPSIS)) scenes = addSynopses(scenes)


    const act1Scenes = scenes.filter(scene => scene.act === 1)
    const act2Scenes = scenes.filter(scene => scene.act === 2)

    console.log(act1Scenes)
    console.log(act2Scenes)
    const actJsx = (scenes) => (
        scenes.map(scene => (
            <div key={scene.id} className={s.scene}>
                {scene.type === ACT &&
                    <div className={s.actHeader}>
                        {scene.text}
                    </div>}
                {scene.type === SCENE &&
                    <>
                        <div className={s.sceneHeader}>
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
                                    <div key={part.id} className={classnames(s.part, (part.personId) ? s.allocated : null)}>
                                        <div className={s.partAvatar}>
                                            {part.personId && <Avatar partId={part.id} size='xs' />}
                                        </div>
                                        <div className={classnames(s.partName)} >
                                            {part.name}
                                            {(idx !== scene.parts.length - 1) ? ',' : ''}
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

