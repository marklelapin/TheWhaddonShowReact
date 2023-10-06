//React and REdux
import React from 'react';

//Components
import { Container } from 'reactstrap';
import Scene from './Scene'

//utitilites

import { log } from 'helper';

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';
import ScriptViewerHeader from './ScriptViewerHeader';


function ScriptViewer(props) {
    const debug = true;


    //props
    const { scenes } = props; 

    log(debug,'ScriptViewer Rendering')

    return (
        <>
            <ScriptViewerHeader />

            <Container fluid="md" id="script-viewer" className="draft-border">


                {(scenes && scenes.length > 0) && scenes.map(scene => {

                    if (scene.type === SHOW) {
                        return <h1 key={scene.id}>{scene.text}</h1>
                    }
                    else if (scene.type === ACT) {
                        return <h2 key={scene.id} >{scene.text}</h2>
                    }
                    else {
                        return <Scene key={scene.id} scene={scene} />
                    }
                }

                )}


            </Container>

        </>





    )
}

export default ScriptViewer;