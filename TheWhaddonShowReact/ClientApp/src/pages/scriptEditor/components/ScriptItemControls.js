//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Button, Dropdown,DropdownToggle,DropdownItem,DropdownMenu } from 'reactstrap';
import { Icon } from 'components/Icons/Icons'

//Constants
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN} from 'dataAccess/scriptItemTypes';

//utils
import { log } from 'helper';

function ScriptItemControls(props) {

    //utils
    const debug = true;


    //Constants
    const scriptItemTypes = [CURTAIN, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN]

    //Props
    const { onClick, addAudio, addVideo, openCurtain = null } = props;

    log(debug, 'ScriptItemControlsProps', props)

    //Redux
    //const undoDateTime = useSelector(state => state.scriptEditor.undoDateTime)
    const undoDateTime = null
    
    //Internal State
    const [dropdownOpen, setDropdownOpen] = useState(false);




    //event handlers
    const toggle = () => {

        setDropdownOpen(prevState => !prevState);
    }
    const handleDropdownClick = (type) => {
     
        onClick('changeType', type)
    }

    const handleAudioClick = () => {
        onClick('addAudio')
    }

    const handleVideoClick = () => {

    }

    const toggleCurtain = () => {
        onClick('toggleCurtain', !openCurtain)
    }


    return (
        <>
            <div className="script-item-type-controls">
                {addAudio &&
                      <Icon icon="audio-file" onClick={() => handleAudioClick()} />  
                }
                {addVideo &&
                    <Icon icon="video-file" onClick={() => handleVideoClick()} />  
                }
                {(openCurtain !== null) &&
                    <div className="curtain-toggle clickable" onClick={() => toggleCurtain()} >
                        {(openCurtain) ? <small>close curtain</small> : <small>open curtain</small>}

                    </div>
                }
            </div>

            <div className="script-item-control-buttons">
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    {/*<DropdownToggle>*/}
                       <Icon icon="menu" onClick={() => setDropdownOpen(!dropdownOpen)} />
                   {/* </DropdownToggle>*/}
                    <DropdownMenu>
                        {scriptItemTypes.map((type) => {
                            return <DropdownItem onClick={() => handleDropdownClick(type)}>{type}</DropdownItem>
                        })
                        }
                    </DropdownMenu>
                </Dropdown>-

                    
                    <Icon icon="add" onClick={() => onClick('add')} />
                    <Icon icon="undo" onClick={() => onClick('undo')} />
                    {(undoDateTime) &&
                        <Icon icon="redo" onClick={() => onClick('redo')} />
                    }
                    {/*{(!undoDateTime) &&*/}
                    {/*    <Icon icon="remove" />*/}
                    {/*}*/}
                    
            </div>


            {undoDateTime &&
                <div className="confirm-undo-buttons">
                    <Button size='xs' color="primary" onClick={() => onClick('confirmUndo')} >confirm undo</Button>
                    <Button size='xs' color="danger" onClick={() => onClick('cancelUndo')} >cancel</Button>
                </div>
            }
        </>
    )
}

export default ScriptItemControls;