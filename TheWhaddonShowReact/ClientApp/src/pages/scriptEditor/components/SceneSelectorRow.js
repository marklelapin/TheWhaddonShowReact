
//React and REdux
import React from 'react';

//Components
import { Button } from 'reactstrap';

//utils
import { log } from '../../../helper';

function SceneSelectorRow(props) {

    const debug = true;

    const { scene, onClick, onDragStart,onDrop,onDragOver,onDragLeave} = props;

    log(debug, 'SceneSelectorRow: scene', scene)



   

    return (

        <div className="scene-selector-row clickable draft-border"
            data-sceneid={scene.id}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            draggable={true}
        >

              <div className="information" onClick={()=>onClick('goto',scene.id) }>
                <h5>{(scene.sceneNumber) ? `${scene.sceneNumber}. ` : ``} {scene.text}</h5>
                   {/* <small>{synopsis.text}</small>*/}
                    {scene.tags.map((tag) => <Button key={`${scene.id}-${tag}`} size='xs'>tag</Button>)}
                </div>

        {/*       <Icon key={scene.id} icon="move-up-down" onClick={() => moveFocusToId(scene.id)}/>*/}

        </div>

    )
}

export default SceneSelectorRow;