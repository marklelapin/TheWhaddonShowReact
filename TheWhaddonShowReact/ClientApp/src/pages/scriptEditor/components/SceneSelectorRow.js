
//React and REdux
import React from 'react';

//Components
import { Button } from 'reactstrap';

//utils
import { log } from '../../../logging';

import { ACT, SCENE } from '../../../dataAccess/scriptItemTypes';
import QuickToolTip from '../../../components/Forms/QuickToolTip';

function SceneSelectorRow(props) {

    const debug = true;

    const { scene, onClick, onDragStart, onDrop, onDragOver, onDragLeave, beingDragged = false} = props;

    log(debug, 'SceneSelectorRow: scene', scene)





    return (
        <>
            <div className="scene-selector-row clickable"
                id={`scene-selector-row-${scene.id}`}
                data-sceneid={scene.id}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                draggable={true}
            >

                <div className="information" onClick={() => onClick('goto', scene.id)}>

                    {(scene.type === ACT) && <h2 key={scene.id}>{scene.text}</h2>}

                    {(scene.type === SCENE) && <h5>{(scene.sceneNumber) ? `${scene.sceneNumber}. ` : ``} {scene.text}</h5>}

                    {scene.tags.map((tag) => <Button key={`${scene.id}-${tag}`} size='xs'>tag</Button>)}

                </div>

            </div>
            {scene.type === SCENE && beingDragged === false && <QuickToolTip id={`scene-selector-row-${scene.id}`} tip={`Click to GoTo / Drag to Move`} />}
        </>


    )
}

export default SceneSelectorRow;