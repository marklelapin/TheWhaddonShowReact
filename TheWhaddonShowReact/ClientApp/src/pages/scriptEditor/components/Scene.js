import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function Scene(props) {

    const {id, newScene } = props;

    const sceneId = id || newScene.id;

    const sceneHeader = useSelector(state => state.scenes[sceneId].header);


    return (
        <>
            <div className="scene-header">
                Scene Header
            </div>

            <div className="scene-body">
                Scene Body
            </div>

        </>
    )
}

export default Scene;