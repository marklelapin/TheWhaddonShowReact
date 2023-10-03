import React from 'react';
import {useState, useEffect} from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import { Input } from 'reactstrap';

function SceneHeader(props) {

    const { scriptItem: scene, onChange, onBlur,onKeyDown} = props;

    return (

        <Input
            id={scene.id}
            className="scene-title script-item text-input"
            type="text"
            key={scene.id}
            placeholder="enter name"
            value={scene.text || ''}
            onChange={(e) => onChange('text',e.target.value)}
            onBlur={onBlur}
            onKeyDown={(e) => onKeyDown(e)} />

                

    )

}

export default SceneHeader;