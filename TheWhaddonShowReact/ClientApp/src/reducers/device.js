import { UPDATE_DEVICE_INFO } from '../actions/device';

import { getDeviceInfo } from '../core/screenHelper';

export const defaultState = getDeviceInfo();

export default function deviceReducer(state = defaultState, action) {

    switch (action.type) {
        case UPDATE_DEVICE_INFO:
            return  getDeviceInfo()
            
        default:
            return state;
    }
}

