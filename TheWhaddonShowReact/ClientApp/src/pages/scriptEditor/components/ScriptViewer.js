//React and REdux
import React from 'react';
import {useState, useEffect} from 'react'; 

//Components
import { Container, Button } from 'reactstrap';
import Scene from './Scene'

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';

function ScriptViewer(props) {

    const { scenes } = props;

    const CLASSIC = 'Classic'
    const CHAT = 'Chat'

    const [viewStyle, setViewStyle] = useState(CHAT)

    const [showComments, setShowComments] = useState(true)

    const toggleViewStyle = () => {
        if (viewStyle === CLASSIC) {
            setViewStyle(CHAT)
        } else {
            setViewStyle(CLASSIC)
        }

    }


    return (

        <Container fluid="md" id="script-viewer" className="draft-border">

            <Button onClick={() => toggleViewStyle()}>{(viewStyle === CHAT) ? 'Switch to Classic' : 'Switch to Chat Mode!'}</Button>

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
    )
}

export default ScriptViewer;