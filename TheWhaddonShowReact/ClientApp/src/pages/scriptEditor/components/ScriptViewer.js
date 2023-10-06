//React and REdux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { toggleSceneSelector, updateShowComments, updateViewAsPerson, updateViewAsPartId } from 'actions/scriptEditor';

//Components
import { Container, Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import Scene from './Scene'
import { Icon } from 'components/Icons/Icons'
import  Avatar  from 'components/Avatar/Avatar'
import PartSelector  from './PartSelector'
//utitilites
import { isSmallerScreen } from 'components/Sidebar/Sidebar'
import { log } from 'helper';

//Constants
import { SHOW, ACT } from 'dataAccess/scriptItemTypes';
import ScriptViewerHeader from './ScriptViewerHeader';


function ScriptViewer(props) {
    const debug = true;


    //props
    const { scenes, onClick } = props; 

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