//global actions
export const SET_SETTINGS = 'SET_SETTINGS'

export function setSettings(settings) {
    return {
        type: SET_SETTINGS,
        payload: settings
    }
}
