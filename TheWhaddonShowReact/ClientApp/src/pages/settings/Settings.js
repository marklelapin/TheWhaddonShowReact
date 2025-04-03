import React, {useEffect, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { setSettings } from '../../actions/settings';

//component
import InputText from '../../components/Forms/InputText';
import InputDate from '../../components/Forms/InputDate'
import InputDateTime from '../../components/Forms/InputDateTime';
import CheckBox from '../../components/Forms/CheckBox';
import DataLoading from '../../components/DataLoading/DataLoading';
import { Button } from 'reactstrap';
//utilities
import { postNewShow, postCowboyShoutOut, postShows, takeShowSnapshot} from '../../dataAccess/settingsAccess' 
//import { clearStateFromBrowserStorage } from '../../dataAccess/browserStorage'

//import classnames from 'classnames';
//scss
import s from './Settings.module.scss';







const Settings = () => {

    const dispatch = useDispatch();
    const settings = useSelector(state => state.settings)

    const [cowboyShoutOut, setCowboyShoutOut] = useState(settings.cowboyShoutOut)
    const [currentShow, setCurrentShow] = useState(settings.shows.find(obj => obj.isCurrent === true))
    const [shows, setShows] = useState(settings.shows)
    const [showTitles, setShowTitles] = useState(settings.shows.map(obj => obj.title))
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    const [savingStatus, setSavingStatus] = useState(null);
    const [snapshotDescription,setSnapshotDescription] = useState(null)


    
    useEffect(() => {
        if (settings) {
            setCowboyShoutOut(settings.cowboyShoutOut)
            setShows(settings.shows)
            setShowTitles(settings.shows.map(obj => obj.title))
            const currentShowFromNewSettings = settings.shows.find(obj => obj.isCurrent === true);
            if (currentShowFromNewSettings?.id != currentShow?.id) {
                postSettings()
                setCurrentShow(currentShowFromNewSettings)
            } else {
                setLoading(false) //ensures that this is set to false if all updates completed.
            }
            
        }
    }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        const saveSnapshot = async () => {
            try {
                const response = await takeShowSnapshot(currentShow.id, snapshotDescription);

                if (response?.status === 200) {
                    setSnapshotDescription(null); // Clear description after success
                    setSavingStatus('Successfully saved ' + snapshotDescription + '.');
                } else {
                    setSavingStatus('Error saving - see console for more information.');
                }
            } catch (error) {
                console.error('Error during snapshot save:', error);
                setSavingStatus('Error saving - see console for more information.');
            }
        };

        // Trigger saveSnapshot only when savingStatus is 'Saving...'
        if (savingStatus === 'Saving...') {
            saveSnapshot();
        }
    }, [savingStatus]); // eslint-disable-line react-hooks/exhaustive-deps


    


    const updateShowDays= (show) =>{
        cowboyShoutOut.showDaysTillOpeningNight = show
        dispatch(setSettings(settings))
    }
    const updateShowCasting = (show) => {
        cowboyShoutOut.showCastingStatistics = show
        dispatch(setSettings(settings))
    }
    const updateNextRehearsalDate = (rehearsalDate) => {
        cowboyShoutOut.nextRehearsalDate = rehearsalDate
        dispatch(setSettings(settings))
    }
    const updateAdditionalMessage = (message) => {
        cowboyShoutOut.additionalMessage = message
        dispatch(setSettings(settings))
    }

    const updateShowTitle = (title) => {
        currentShow.title = title
        dispatch(setSettings(settings))
    }
    const updateOpeningNight = (openingNight) => {
        currentShow.openingNight = openingNight
        dispatch(setSettings(settings))
    }
    const updateLastNight = (lastNight) => {
        currentShow.lastNight = lastNight
        dispatch(setSettings(settings))
    }

    const changeCurrentShow = (showTitle) => {
        const newShows = shows.map(obj => {
            if (obj.title === showTitle) return { ...obj, isCurrent: true }
            return {...obj,isCurrent: false}
        })
        settings.shows = newShows
        console.log('changeCurrentShow settings', settings)
        dispatch(setSettings(settings))
    }


    const postSettings = async () => {

        setLoading(true)

        try {

            await postCowboyShoutOut(cowboyShoutOut);
            console.log('postshows', shows);
            const response = await postShows(shows);

            if (response === null) {
                throw new Error("Failed to post show information - see console for more details.");
            }
        } catch (error) {
            setLoadingError(error.message);
        } finally {
            setLoading(false);
        }
    }   


    const createNewShow = async () => {
        setLoading(true)
        const newSettings = await postNewShow()
        dispatch(setSettings(newSettings))
        
    }

    const updateSnapshotDescription = (description) => {
        setSnapshotDescription(description)
        setSavingStatus(null)
    }

    const doShowSnapshot = () => {
        setSavingStatus('Saving...')
    }

    return (
        <>
            <div className={s.settingsPage}>
                <h1>Settings</h1>
                <h3 className={s.sectionHeader}>Cowboy Shoutout!</h3>
      
                <div className={s.setting}>
                    <div className={s.settingLabel}>Show Days Till Opening Night</div>
                    <div className={s.settingInput}>
                        <CheckBox id={'showDays'} strapColor="primary" checked={cowboyShoutOut.showDaysTillOpeningNight} onChange={(e) => updateShowDays(e.target.checked)}/>
                    </div>
                </div>
                <div className={s.setting}>
                    <div className={s.settingLabel}>Show Casting Statistics</div>
                    <div className={s.settingInput}>
                        <CheckBox id={'showCasting'} strapColor="primary" checked={cowboyShoutOut.showCastingStatistics} onChange={(e) => updateShowCasting(e.target.checked)}/>
                    </div>
                </div>
                <div className={s.setting}>
                    <div className={s.settingLabel}>Next Rehearsal Date</div>
                    <div className={s.settingInput}>
                        <InputDateTime id={'nextRehearsalDate'} onChange={(e) => updateNextRehearsalDate(e.target.value)} value={cowboyShoutOut.nextRehearsalDate}/> 
                    </div>
                </div>
                <div className={s.setting}>
                    <div className={s.settingLabel}>Additional Message</div>
                    <div className={s.settingInput}>
                        <InputText id={'additionalMessage'} onChange={(e) => updateAdditionalMessage(e.target.value)} value={cowboyShoutOut.additionalMessage} /> 
                    
                    </div>
                </div>

                <h3 className={s.sectionHeader}>Change The Show Everybody Sees</h3>
                <div className={s.setting}>
                    <div className={s.settingLabel}>Show Title</div>
                    <div className={s.settingInput}>
                        <InputText id={'showTitle'} onChange={(e) => changeCurrentShow(e.target.value)} value={currentShow.title} options={showTitles} />
                    </div>
                    <Button className={s.newShowButton} color="primary" size="sm" onClick={() => createNewShow()}>Create New Show</Button>
                </div>

                <h3 className={s.sectionHeader}>Current Show</h3>

                <DataLoading
                    isLoading={loading}
                    spinnerSize={21}
                    loadingText="Loading new show..."
                    isError={loadingError !== null}
                    errorText={loadingError}
                >
                    <div className={s.setting}>
                        <div className={s.settingLabel}>Show Title</div>
                        <div className={s.settingInput}>
                            <InputText id={'showTitle'} onChange={(e) => updateShowTitle(e.target.value)} value={currentShow.title} />
                        </div>
                    </div>
                    <div className={s.setting}>
                        <div className={s.settingLabel}>Opening Night</div>
                        <div className={s.settingInput}>
                            <InputDate id={'openingNight'} onChange={(e) => updateOpeningNight(e.target.value)} value={currentShow.openingNight} />
                        </div>
                    </div>
                    <div className={s.setting}>
                        <div className={s.settingLabel}>Last Night</div>
                        <div className={s.settingInput}>
                            <InputDate id={'lastNight'} onChange={(e) => updateLastNight(e.target.value)} value={currentShow.lastNight} />
                        </div>
                    </div>
                </DataLoading>
                <div className={s.setting}>
                    <Button className={s.newShowButton} color="primary" size="sm" onClick={() => postSettings()}>Post Settings</Button>
                </div>
                <h3 className={s.sectionHeader}>Versions</h3>
                <div className={s.setting}>
                    <InputText id={'snapshotDescription'} onChange={(e) => updateSnapshotDescription(e.target.value)} value={snapshotDescription}/>
                    <Button className={s.newShowButton} color="primary" size="sm" disabled={snapshotDescription===null}  onClick={() => doShowSnapshot()}>Save Snapshot</Button>
                    {(savingStatus != null &&
                        <div>{savingStatus}</div>
                    )}

                </div>
             
                
               
             </div>
            
            

            

           
        </>

    )
}

export default Settings;

