
//React and REdux
import React, { useState} from 'react';
import { useSelector } from 'react-redux';
//Components
import { Button } from 'reactstrap';

//utils
import { log, SCENE_SELECTOR_ROW as logType } from '../../../dataAccess/logging';
import classnames from 'classnames';
import { ACT, SCENE } from '../../../dataAccess/scriptItemTypes';
import QuickToolTip from '../../../components/Forms/QuickToolTip';
import { isScriptReadOnly } from '../../../dataAccess/userAccess';

import s from '../Script.module.scss'

function SceneSelectorRow(props) {

    const { scene, onClick, onDragStart, onDrop, onDragOver, onDragLeave, isInFocus, highlight = false, isMobileDevice = false } = props;

    log(logType, 'props', { highlight })

    const currentUser = useSelector(state => state.user.currentUser)
    const readOnly = isScriptReadOnly(currentUser, isMobileDevice)

    const deviceType = isMobileDevice ? 'mobile' : 'desktop'

    const [beingDragged, setBeingDragged] = useState(false)
    const [beingDraggedOver, setBeingDraggedOver] = useState(false)


    const handleDragStart = (e) => {
        setBeingDragged(true)
        onDragStart(e)
    }

    const handleDrop = (e) => {
        setBeingDragged(false)
        setBeingDraggedOver(false)
        onDrop(e)
    }

    const handleDragOver = (e) => {
        setBeingDraggedOver(true)
        onDragOver(e)
    }

    const handleDragLeave = (e) => {
        setBeingDraggedOver(false)
        onDragLeave(e)
    }

    

    return (
        <>
            <div className={classnames(s.sceneSelectorRow,
                'clickable', (highlight === true) ? s.highlight : null,
                s[deviceType],
                beingDragged ? s.beingDragged : null,
                beingDraggedOver ? s.beingDraggedOver : null)
                }
                id={`scene-selector-row-${scene.id}`}
                data-sceneid={scene.id}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                draggable={!readOnly}
            >

                <div className="information" onClick={() => onClick('goto', scene.id)}>

                    {(scene.type === ACT) && <h2 key={scene.id}>{scene.text}</h2>}

                    {(scene.type === SCENE) && <h5 className={`${isInFocus ? s.inFocus : ''}`} >{(scene.sceneNumber) ? `${scene.sceneNumber}. ` : ``} {scene.text}</h5>}

                    {scene.tags.map((tag) => <Button key={`${scene.id}-${tag}`} size='xs'>tag</Button>)}

                </div>

            </div>
            {scene.type === SCENE && beingDragged === false && <QuickToolTip id={`scene-selector-row-${scene.id}`} tip={(readOnly) ? 'Click to GoTo' : 'Click to GoTo / Drag to Move'} />}
        </>


    )
}

export default SceneSelectorRow;