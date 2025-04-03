import { SET_SETTINGS } from '../actions/settings';

export const defaultState = {
    cowboyShoutOut: {
        showDaysTillOpeningNight: true,
        showCastingStatistics: false,
        nextRehearsalDate: null,
        additionalMessage: "Welcome to the Whaddon Show App!",
    },
    shows: []
};

export default function settingsReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_SETTINGS:
          return Object.assign({}, state, action.payload);
    
    default:
      return state;
  }
}
