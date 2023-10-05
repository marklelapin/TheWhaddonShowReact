import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Button } from 'reactstrap';
import { Icon } from 'components/Icons/Icons';
function SceneSelectorRow(props) {

    const { scene, onClick } = props;

    


    const handleAddScene = () => {

        //TODO Add functionality to add a scene
        console.log('AddScene Pressed')
    }


    return (

        <div className="scene-selector-row draft-border" >
            <div className="controls draft-border">

                <div className="information" onClick={()=>onClick('goto',scene.id) }>
                    <h5>{scene.text}</h5>
                    <small>synopsis.text</small>
                    {scene.tags.map((tag) => <Button key={`${scene.id}-${tag}`} size='xs'>tag</Button>)}
                </div>

                <Icon key={scene.id} icon="add" onClick={() => handleAddScene('add',scene.id)}/>

            </div>
        </div>

    )
}

export default SceneSelectorRow;