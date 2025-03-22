import { SET_SETTINGS } from '../actions/settings';

const defaultState = {
    cowboyShoutOut: {
        showDaysTillOpeningNight: true,
        showCastingStatistics: true,
        nextRehearsalDate: "2025-03-28",
        additionalMessage: "Hello my name is whaddon show cowboy!",
    },
    showDates: {
        openingNight: "2025-10-17",
        lastNight: "2025-10-18"
    },
    currentShowId: null
};

export default function settingsReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_SETTINGS:
          return Object.assign({}, state, {
              settings: action.payload
          });
    
    default:
      return state;
  }
}
