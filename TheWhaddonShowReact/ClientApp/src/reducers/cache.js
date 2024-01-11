import {
  ADD_TO_CACHE
} from '../actions/cache';

import { AVATARS } from '../dataAccess/storageContainerNames.js';

const defaultState = {
    [AVATARS]: {},
};

export default function cacheReducer(state = defaultState, action) {
  switch (action.type) {
      case ADD_TO_CACHE:
          return {
              ...state,
              [action.section] : {
                  ...state[action.section],
                  [action.ref] : action.payload
              }
          }
    default:
      return state;
  }
}
