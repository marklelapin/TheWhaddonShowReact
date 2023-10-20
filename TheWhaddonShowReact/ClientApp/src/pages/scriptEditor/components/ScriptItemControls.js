//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Button, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { Icon } from 'components/Icons/Icons'

//Constants
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN } from 'dataAccess/scriptItemTypes';
import { HEADER_TYPES } from 'dataAccess/scriptItemTypes';
import { CURTAIN_TYPES } from 'dataAccess/scriptItemTypes';
//utils
import { log } from 'helper';
import CheckBox from 'components/Forms/CheckBox';

function ScriptItemControls(props) {

    //utils
    const debug = false;

    //Constants
    const scriptItemTypes = [CURTAIN, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN]
    const attachTypes = [SONG, SOUND, STAGING, INITIAL_STAGING, SYNOPSIS]

    //Props
    const { onClick, scriptItem = null, part = null, header = null, children } = props;

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
    const handleDropdownClick = (e, type) => {
        e.preventDefault()
        onClick('changeType', type)
    }

    const handleClick = (action) => {
        switch (action) {
            case 'attach':
                break;
            case 'link':
                break;
            case 'toggleCurtain':
                onClick('toggleCurtain', !scriptItem.curtainOpen)
                break;

            default:
        }

    }


    return (
        <>
            <div className={`header-controls ${header ? 'header-exists' : ''}`}>

                <div className="header-left-controls">
                    {scriptItem && attachTypes.includes(scriptItem.type) &&
                        <>
                            <Icon icon="attach" onClick={() => handleClick('attach')} />
                            <Icon icon="link" onClick={() => handleClick('link')} />
                        </>
                    }
                    {scriptItem && CURTAIN_TYPES.includes(scriptItem.type) &&

                        <CheckBox checked={scriptItem.curtainOpen} onChange={() => handleClick('toggleCurtain')} ios={true} />
                    }
                </div>
                <div className="header-right-controls">

                    {scriptItem && HEADER_TYPES.includes(scriptItem.type) === false &&
                        < Dropdown isOpen={dropdownOpen} toggle={toggle}>

                            <Icon icon="menu" onClick={() => setDropdownOpen(!dropdownOpen)} />

                            <DropdownMenu>
                                {scriptItemTypes.map((type) => {
                                    return <DropdownItem key={type} onClick={(e) => handleDropdownClick(e, type)}>{type}</DropdownItem>
                                })
                                }
                            </DropdownMenu>
                        </Dropdown>
                    }

                    {undoDateTime &&
                        <div className="confirm-undo-buttons">
                            <Button size='xs' color="primary" onClick={() => onClick('confirmUndo')} >confirm undo</Button>
                            <Button size='xs' color="danger" onClick={() => onClick('cancelUndo')} >cancel</Button>
                        </div>
                    }

                    <Icon icon="undo" onClick={() => onClick('undo')} />
                    {(undoDateTime) &&
                        <Icon icon="redo" onClick={() => onClick('redo')} />
                    }
                    <Icon icon='comment-o' onClick={() => onClick('comment')} />'
                    {/*{(!undoDateTime) &&*/}
                    {/*    <Icon icon="remove" />*/}
                    {/*}*/}

                </div>


            </div>


            <div className="bottom-right-controls">
                {scriptItem && <Icon icon="play" onClick={() => onClick('confirm', null)} />}

                {scriptItem && (!HEADER_TYPES.includes(scriptItem.type) || scriptItem.type === INITIAL_CURTAIN) && <Icon icon="add" onClick={() => onClick('add', null)}  />}


                {scriptItem && !HEADER_TYPES.includes(scriptItem.type) && <Icon icon="trash" onClick={() => onClick('delete', null)} />}

            </div>

            <div className="outside-right-controls">
                {part &&
                    <>
                    <Icon icon="play" onClick={() => onClick('confirm', null)} />
                    <Icon icon="add" onClick={() => onClick('add', null)}/>
                        <Icon icon="search" onClick={(e) => onClick('search',null,e)} />
                        <Icon icon="trash" onClick={() => onClick('delete', null)} />
                    </>
                }
            </div>

            {children}

        </>
    )
}

export default ScriptItemControls;