import {
  ADD_TO_CACHE
} from '../actions/cache';

import { AVATARS } from '../dataAccess/storageContainerNames';
import { log, CACHE_REDUCER as logType } from '../dataAccess/logging';

const defaultState = {
    [AVATARS]: {},
};

export default function cacheReducer(state = defaultState, action) {
    switch (action.type) {
        case ADD_TO_CACHE:
            log(logType, 'imageObjectURL', {section: action.section, pictureRef: action.ref, payload: action.payload})
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
