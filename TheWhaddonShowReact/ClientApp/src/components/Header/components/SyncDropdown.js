import React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import s from '../Header.module.scss'; // eslint-disable-line css-modules/no-unused-class
import { Person, ScriptItem, Part } from '../../../dataAccess/localServerModels';
import { NotificationAlert, Icon } from 'components/Icons/Icons';

function SyncDropdown(props) {

    //Set state relating to internal component
    const [syncOpen, setSyncOpen] = useState(false);


    //Set state relating to redux store
    const personsSync = useSelector((store) => store.localServer.persons.sync);
    const scriptItemsSync = useSelector((store) => store.localServer.scriptItems.sync);
    const partsSync = useSelector((store) => store.localServer.parts.sync);



    const syncSummary = () => {

        const syncArray = [personsSync, scriptItemsSync, partsSync]

        const result = syncArray.reduce((acc, item) => {
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
        }
        if (secondsPast < 3600) {
            return { text: 'Last synced ' + (parseInt(secondsPast / 60) + 1) + ' minutes ago.', seconds: secondsPast };
        }
        if (secondsPast <= 86400) {
            return { text: 'Last synced ' + (parseInt(secondsPast / 3600) + 1) + ' hours ago.', seconds: secondsPast };
        }
        if (secondsPast > 86400) {
            const daysSince = parseInt(secondsPast / 86400);
            if (daysSince === 1) return 'Last synced a day ago.'
            return ({ text: 'Last synced ' + parseInt(secondsPast / 86400) + ' days ago', seconds: secondsPast });
        }
    }

    const getTarget = (type) => {

        let target;

        switch (type) {
            //**LSMTypeinCode**
            case 'Summary': target = syncSummary(); break;
            case Person: target = personsSync; break;
            case ScriptItem: target = scriptItemsSync; break;
            case Part: target = partsSync; break;
            default: target = null;
        }

        return target;
    }


    const syncText = (type) => {

        const target = getTarget(type)

        if (target === null) return (<></>);

        const { text, seconds } = timeSince(target.lastSyncDate)

        const morethan5mins = seconds > (60 * 5)

        if (target.isSyncing) {
            return <><Icon icon="sync" strapColor="secondary" />Syncing</>
        }
        if (target.error !== null) {
            return (
                <>
                    <Icon icon="cross" strapColor="danger" /> Syncing error...
                    
                    {(type!=='Summary') ? <p><small>{target.error}</small></p> : null}
                </>

            )
        }
        if (seconds === null) return <><Icon icon="cross" strapColor="danger" /> Never synced</>
        return (

            <>{(morethan5mins) ? < Icon icon="warning" strapColor="warning" ></Icon >
                : <Icon icon="tick" strapColor="success" />}
                {text}</>
        )

    }



    return (
        <Dropdown nav isOpen={syncOpen} toggle={toggleSync} id="basic-nav-dropdown" className={`${s.notificationsMenu}`}>
            <DropdownToggle nav caret className={`${s.headerSvgFlipColor} text-center`} >

                {syncText('Summary')}
            </DropdownToggle>
            <DropdownMenu end className={`${s.notificationsWrapper} py-0 animated animated-fast fadeInUp`}>

                <DropdownItem >{syncText(Person)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >{syncText(ScriptItem)}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem >{syncText(Part)}</DropdownItem>
                {/*<>*/}
                {/*    <p>Sync Status:</p>*/}
                {/*    <br />*/}
                {/*    {syncText(Person)}*/}
                {/*    {syncText(ScriptItem)}*/}
                {/*    {syncText(Part)}*/}

                {/*</>*/}


            </DropdownMenu>
        </Dropdown>
    )
}
export default SyncDropdown