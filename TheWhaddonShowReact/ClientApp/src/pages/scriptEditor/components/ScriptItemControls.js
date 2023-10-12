//React and redux
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

//Components
import { Button, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import { Icon } from 'components/Icons/Icons'

//Constants
import { SCENE, SYNOPSIS, INITIAL_STAGING, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, INITIAL_CURTAIN, CURTAIN } from 'dataAccess/scriptItemTypes';

//utils
import { log } from 'helper';
import CheckBox from 'components/Forms/CheckBox';

function ScriptItemControls(props) {

    //utils
    const debug = true;


    //Constants
    const scriptItemTypes = [CURTAIN, STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN]

    const attachTypes = [SONG, SOUND, STAGING, INITIAL_STAGING, SYNOPSIS]
    const curtainTypes = [CURTAIN, INITIAL_CURTAIN]

    //Props
    const { onClick, scriptItem = null, part = null, header = null } = props;

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

    const toggleCurtain = () => {

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
                    {scriptItem && curtainTypes.includes(scriptItem.type) &&

                        <CheckBox checked={scriptItem.curtainOpen} onChange={() => handleClick('toggleCurtain')} ios={true} />
                    }
                </div>
                <div className="header-right-controls">
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
                    {/*{(!undoDateTime) &&*/}
                    {/*    <Icon icon="remove" />*/}
                    {/*}*/}

                </div>
                

            </div>


            <div className="bottom-right-controls">
                {scriptItem &&
                    <>
                        <Icon icon="play" onClick={() => onClick('confirm')} />
                        <Icon icon="add" onClick={() => onClick('add')} />
                    </>
                }
            </div>

            <div className="outside-right-controls">
                {part &&
                    <>
                        <Icon icon="play" onClick={() => onClick('confirm',null)} />
                        <Icon icon="search" onClick={() => onClick('search',null)} />
                        <Icon icon="trash" onClick={() => onClick('delete',null)} />
                    </>
                }
            </div>




        </>
    )
}

export default ScriptItemControls;