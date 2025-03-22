import React from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { setSettings } from '../../actions/settings';

//component
import InputText from '../../components/Forms/InputText';
import InputDate from '../../components/Forms/InputDate';
import CheckBox from '../../components/Forms/CheckBox'

//utilities


//import classnames from 'classnames';
//scss
import s from './Settings.module.scss';




const Settings = () => {

    const dispatch = useDispatch();
    const settings = { ...useSelector(state => state.settings) }

    const cowboyShoutOut = settings.cowboyShoutOut
    const showDates = settings.showDates

    const updateShowDays= (show) =>{
        cowboyShoutOut.showDaysTillOpeningNight = show
        updateSettings()
    }
    const updateShowCasting = (show) => {
        cowboyShoutOut.showCastingStatistics = show
        updateSettings()
    }
    const updateNextRehearsalDate = (rehearsalDate) => {
        cowboyShoutOut.nextRehearsalDate = rehearsalDate
        updateSettings()
    }
    const updateAdditionalMessage = (message) => {
        cowboyShoutOut.additionalMessage = message
        updateSettings()
    }

    const updateOpeningNight = (openingNight) => {
        showDates.openingNight = openingNight
        updateSettings()
    }
    const updateLastNight = (lastNight) => {
        showDates.lastNight = lastNight
        updateSettings()
    }


    const updateSettings = () => {
        dispatch(setSettings(settings))
    }


    return (
        <>
            <h1>Settings</h1>
            <h3>Cowboy Shoutout!</h3>
      
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
                    <InputDate id={'nextRehearsalDate'} onChange={(e) => updateNextRehearsalDate(e.target.value)} value={cowboyShoutOut.nextRehearsalDate}/> 
                </div>
            </div>
            <div className={s.setting}>
                <div className={s.settingLabel}>Additional Message</div>
                <div className={s.settingInput}>
                    <InputText id={'additionalMessage'} onChange={(e) => updateAdditionalMessage(e.target.value)} value={cowboyShoutOut.additionalMessage} /> 
                    
                </div>
            </div>

            <h3>Show Dates</h3>
            <div className={s.setting}>
                <div className={s.settingLabel}>Opening Night</div>
                <div className={s.settingInput}>
                    <InputDate id={'openingNight'} onChange={(e) => updateOpeningNight(e.target.value)} value={showDates.openingNight} />
                </div>
            </div>
            <div className={s.setting}>
                <div className={s.settingLabel}>Last Night</div>
                <div className={s.settingInput}>
                    <InputDate id={'lastNight'} onChange={(e) => updateLastNight(e.target.value)} value={showDates.lastNight} />
                </div>
            </div>


        </>

    )
}

export default Settings;

