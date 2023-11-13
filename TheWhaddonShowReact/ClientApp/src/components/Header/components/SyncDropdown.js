import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

//COmponents
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';
import Loader from '../../../components/Loader/Loader';

//utils
import { clearState } from '../../../dataAccess/localStorage'

//Constants
import { PERSON, SCRIPT_ITEM, PART } from '../../../dataAccess/localServerModels';
import { log } from '../../../helper';

//css
import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class

function SyncDropdown(props) {

    const debug = true

    //Set state relating to internal component
    const [syncOpen, setSyncOpen] = useState(false);

    log(debug, 'SyncDropdown: syncOpen', syncOpen)


    //Set state relating to redux store
    const personsSync = useSelector((store) => store.localServer.persons.sync);
    const scriptItemsSync = useSelector((store) => store.localServer.scriptItems.sync);
    const partsSync = useSelector((store) => store.localServer.parts.sync);
    const scriptItems = useSelector((store) => store.localServer.scriptItems.history);
    const persons = useSelector((store) => store.localServer.persons.history);
    const parts = useSelector((store) => store.localServer.parts.history);

    const unsyncedScriptItemUpdates = scriptItems?.filter(item => item.updatedOnServer === null).length || 0
    const unsyncedPersonUpdates = persons?.filter(item => item.updatedOnServer === null).length || 0
    const unsyncedPartUpdates = parts?.filter(item => item.updatedOnServer === null).length || 0
  
    log(debug, 'SyncDropdown: unsyncedUpdates', { parts: unsyncedPartUpdates, persons: unsyncedPersonUpdates, scriptItems: unsyncedScriptItemUpdates })


    const syncSummary = () => {

        const syncArray = [personsSync, scriptItemsSync, partsSync]

        let result = syncArray.reduce((acc, item) => {
            // Check isSyncing
            if (item.isSyncing === true) {
                acc.isSyncing = true;
            }

            // Check error
            if (item.error !== null) {
                acc.error = true;
            }

            // Check lastSyncDate
            if (item.lastSyncDate !== null) {
                if (acc.lastSyncDate === null || item.lastSyncDate > acc.lastSyncDate) {
                    acc.lastSyncDate = item.lastSyncDate;
                }
            }

            return acc;
        }, { //starting item for reduce
            isSyncing: false,
            error: null,
            lastSyncDate: null,
        });

        result.unsyncedUpdates = unsyncedPersonUpdates + unsyncedScriptItemUpdates + unsyncedPartUpdates


        return result;

    }







    const toggleSync = () => {
        setSyncOpen(!syncOpen);
    }



    const timeSince = (date) => {

        if (date === null) return { text: 'Never synced.', seconds: null }

        const now = new Date();
        const secondsPast = Math.floor((now - date) / 1000);


        if (secondsPast < 60) {
            return { text: 'Just synced.', seconds: secondsPast };
        } else
            if (secondsPast < 3600) {
                return { text: 'Last synced ' + (parseInt(secondsPast / 60) + 1) + ' minutes ago.', seconds: secondsPast };
            } else
                if (secondsPast <= 86400) {
                    return { text: 'Last synced ' + (parseInt(secondsPast / 3600) + 1) + ' hours ago.', seconds: secondsPast };
                } else
                    if (secondsPast > 86400) {
                        const daysSince = parseInt(secondsPast / 86400);
                        if (daysSince === 1) {
                            return { text: 'Last synced a day ago.', seconds: secondsPast }
                        } else {
                            return ({ text: 'Last synced ' + parseInt(secondsPast / 86400) + ' days ago', seconds: secondsPast });
                        }
                    } else {
                        return { text: `Error reading date synced: ${date.toString()}`, seconds: null }
                    }

    }

    const getTarget = (type) => {

        let target;

        switch (type) {
            //**LSMTypeinCode**
            case 'Summary': target = syncSummary(); break;
            case PERSON: target = { ...personsSync, unsyncedUpdates: unsyncedPersonUpdates }; break;
            case SCRIPT_ITEM: target = { ...scriptItemsSync, unsyncedUpdates: unsyncedScriptItemUpdates }; break;
            case PART: target = { ...partsSync, unsyncedUpdates: unsyncedPartUpdates }; break;
            default: target = null;
        }

        return target;
    }


    const syncText = (type) => {

        const target = getTarget(type)
        log(debug, 'SyncDropdown: syncTexttarget', { ...target, type: type })

        if (target === null) return (<></>);

        const { text, seconds } = timeSince(target.lastSyncDate)

        if (target.error !== null) {
            return (
                <>
                    <Icon icon="cross" strapColor="danger" /> Syncing error...

                    {(type !== 'Summary') ? <p><small>{target.error}</small></p> : null}
                </>

            )
        }
        
        return (

            <>
                {target.isSyncing && <Loader size={16} />}
                
                {(target.unsyncedUpdates === 0) && <><Icon icon="tick" strapColor="success" />Synced</>}
             
                {target.unsyncedUpdates > 0 &&
                    <>
                        <Icon icon="warning" strapColor="warning" />
                        {target.unsyncedUpdates} unsynced updates
                        {seconds > 60 && {text}}
                    </>

                }
                {(seconds === null && (target.unsyncedUpdates !== 0)) && <><Icon icon="cross" strapColor="danger" /> Never synced</>}
            </>
        )

    }



    return (
        <Dropdown nav isOpen={syncOpen} toggle={toggleSync} id="basic-nav-dropdown">
            <DropdownToggle nav caret className={`${s.headerSvgFlipColor} text-center`} >

                {syncText('Summary')}
            </DropdownToggle>
            <DropdownMenu end className={`py-0 animated animated-fast fadeInUp`}>

                <DropdownItem >Persons: {syncText(PERSON)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >ScriptItems: {syncText(SCRIPT_ITEM)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >Parts: {syncText(PART)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={() => clearState()}>Clear Local Storage</DropdownItem>

            </DropdownMenu>
        </Dropdown>
    )
}
export default SyncDropdown