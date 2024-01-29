import React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//COmponents
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Icon } from '../../../components/Icons/Icons';
import Loader from '../../../components/Loader/Loader';

//utils
import { clearStateFromBrowserStorage } from '../../../dataAccess/browserStorage'
import { setPauseSync, refreshSync } from '../../../actions/localServer';
//Constants
import { PERSON, SCRIPT_ITEM, PART } from '../../../dataAccess/localServerModels';
import { log, SYNC_DROPDOWN as logType } from '../../../dataAccess/logging';

//css
import s from '../Header.module.scss';

function SyncDropdown(props) {

    const debug = true
    const dispatch = useDispatch();


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

    const pauseSync = useSelector((store) => store.localServer.sync.pauseSync);

    const unsyncedScriptItemUpdates = scriptItems?.filter(item => item.updatedOnServer === null).length || 0
    const unsyncedPersonUpdates = persons?.filter(item => item.updatedOnServer === null).length || 0
    const unsyncedPartUpdates = parts?.filter(item => item.updatedOnServer === null).length || 0

    log(debug, 'SyncDropdown: unsyncedUpdates', { parts: unsyncedPartUpdates, persons: unsyncedPersonUpdates, scriptItems: unsyncedScriptItemUpdates })


    const syncSummary = () => {

        const syncArray = [personsSync, scriptItemsSync, partsSync]

        const personsCount = persons?.length || 0
        const scriptItemsCount = scriptItems?.length || 0
        const partsCount = parts?.length || 0

        const historyCount = (personsCount === 0 || scriptItemsCount === 0 || partsCount === 0) ? 0 : (personsCount + scriptItemsCount + partsCount)


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

            if (item.isRefreshing === true) {
                acc.isRefreshing = true;
            }

            return acc;
        }, { //starting item for reduce
            isSyncing: false,
            error: null,
            lastSyncDate: null,
            isRefreshing: false,
        });

        result.unsyncedUpdates = unsyncedPersonUpdates + unsyncedScriptItemUpdates + unsyncedPartUpdates

        result.historyCount = historyCount;

        return result;

    }





    const togglePauseSync = () => {
        dispatch(setPauseSync(!pauseSync))
    }

    const toggleSync = () => {
        setSyncOpen(!syncOpen);
    }

    const timeSince = (date) => {

        if (date === null) return { text: 'Never synced.', seconds: null }

        const now = new Date();
        const lastSyncedDate = new Date(date)

        const secondsPast = Math.floor((now - lastSyncedDate) / 1000);

        log(logType, 'timeSince', { now, date, secondsPast })

        if (secondsPast < 15) return { textTimeSince: 'just synced', secondsPast };
        if (secondsPast < 3600) return { textTimeSince: 'last synced ' + (parseInt(secondsPast / 60) + 1) + ' minutes ago', secondsPast };
        if (secondsPast <= 86400) return { textTimeSince: 'last synced ' + (parseInt(secondsPast / 3600) + 1) + ' hours ago', secondsPast };

        //else
        const daysSince = parseInt(secondsPast / 86400)

        if (daysSince === 1) return { textTimeSince: 'last synced a day ago' }

        return { textTimeSince: 'last synced ' + parseInt(secondsPast / 86400) + ' days ago' }

    }

    const getTarget = (type) => {

        let target;
        let historyCount;

        switch (type) {
            //**LSMTypeinCode**
            case 'Summary': target = syncSummary(); break;
            case PERSON:
                historyCount = persons?.length || 0
                target = { ...personsSync, unsyncedUpdates: unsyncedPersonUpdates, historyCount }; break;
            case SCRIPT_ITEM:
                historyCount = scriptItems?.length || 0
                target = { ...scriptItemsSync, unsyncedUpdates: unsyncedScriptItemUpdates, historyCount }; break;
            case PART:
                historyCount = parts?.length || 0
                target = { ...partsSync, unsyncedUpdates: unsyncedPartUpdates, historyCount }; break;
            default: target = null;
        }

        return target;
    }


    const syncText = (type) => {

        const target = getTarget(type)
        log(logType, 'syncTexttarget', { ...target, type: type })

        if (target === null) return (<></>);

        const { textTimeSince, secondsPast } = timeSince(target.lastSyncDate)

        if (!pauseSync && target.error !== null) {
            return (
                <>
                    <Icon icon="cross" strapColor="danger" /> Syncing error...

                    {(type !== 'Summary') ? <p><small>{target.error}</small></p> : null}
                </>

            )
        }

        return (

            <>


                {(target.isSyncing || target.isRefreshing) && <Loader size={16} />}
                {(target.isSyncing || target.isRefreshing) && target.historyCount === 0 && <>Syncing...</>}

                {(!pauseSync && target.unsyncedUpdates === 0 && target.historyCount > 0) && <><Icon icon="tick" strapColor="success" />Synced</>}

                {target.unsyncedUpdates > 0 &&
                    <>
                        {((secondsPast === null) || (secondsPast > 60 * 60 * 2))
                            ? <Icon icon="warning" strapColor="danger" />
                            : <Icon icon="warning" strapColor="warning" />
                        }

                        {target.unsyncedUpdates} unsynced updates
                    </>

                }
                {!target.isSyncing && target.historyCount === 0 && <>Not synced!</>}
                {pauseSync && <>{textTimeSince}</>}
                {pauseSync && target.isSyncing === false && target.isRefreshing === false &&
                    <>
                    <Icon icon="refresh"
                        id="refresh-sync"
                        toolTip="Refresh Script"
                        onClick={(e) => { e.stopPropagation(); dispatch(refreshSync()) }}
                        />
                    </>
                }

            </>
        )

    }



    return (
        <Dropdown nav isOpen={syncOpen} toggle={toggleSync} id="basic-nav-dropdown" className={`${s['sync-dropdown']}`}>
            <DropdownToggle nav className={`${s.headerSvgFlipColor} text-center`} >

                {syncText('Summary')}

            </DropdownToggle>
            <DropdownMenu end className={`py-0 animated animated-fast fadeInUp`}>
               
                <DropdownItem >Persons: {syncText(PERSON)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >ScriptItems: {syncText(SCRIPT_ITEM)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >Parts: {syncText(PART)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={() => clearStateFromBrowserStorage(dispatch)}>Clear Local Storage</DropdownItem>
                <DropdownItem onClick={() => togglePauseSync()}> {pauseSync ? 'Resume Sync' : 'Pause Sync'}<Icon icon="play" /></DropdownItem>

            </DropdownMenu>
        </Dropdown>
    )
}
export default SyncDropdown