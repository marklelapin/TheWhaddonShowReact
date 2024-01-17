
//React and REdux
import React from 'react';
import { useSelector } from 'react-redux';
//Components
import { Button } from 'reactstrap';

//utils
import { log } from '../../../logging';

import { ACT, SCENE } from '../../../dataAccess/scriptItemTypes';
import QuickToolTip from '../../../components/Forms/QuickToolTip';
import { finalReadOnly } from '../scripts/layout';

import s from '../Script.module.scss'

function SceneSelectorRow(props) {

    const debug = true;

    const { scene, onClick, onDragStart, onDrop, onDragOver, onDragLeave, beingDragged = false, isInFocus} = props;

    log(debug, 'SceneSelectorRow: scene', scene)

    
    const isWriter = useSelector(state => state.user.currentUser?.isWriter)
    const readOnly = !isWriter

    return (
        <>
            <div className="scene-selector-row clickable"
                id={`scene-selector-row-${scene.id}`}
                data-sceneid={scene.id}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                draggable={!readOnly}
            >

                <div className="information" onClick={() => onClick('goto', scene.id)}>

                    {(scene.type === ACT) && <h2 key={scene.id}>{scene.text}</h2>}

                    {(scene.type === SCENE) && <h5 className={`${isInFocus ? s['highlight'] : ''}`} >{(scene.sceneNumber) ? `${scene.sceneNumber}. ` : ``} {scene.text}</h5>}

                    {scene.tags.map((tag) => <Button key={`${scene.id}-${tag}`} size='xs'>tag</Button>)}

                </div>

            </div>
            {scene.type === SCENE && beingDragged === false && <QuickToolTip id={`scene-selector-row-${scene.id}`} tip={(readOnly) ? 'Click to GoTo' : 'Click to GoTo / Drag to Move'} />}
        </>


    )
}

export default SceneSelectorRow;