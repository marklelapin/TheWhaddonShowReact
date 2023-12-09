const DEBUG = 'DEBUG'
const PRODUCTION = 'PRODUCTION'
const NONE = 'NONE'

//logTypes
export const COMMENT = { type: NONE, location: 'Component:COMMENT' }
export const LOCAL_SERVER_UTILS = { type: NONE, location: 'Script:localServerUtils' }
export const LOCAL_SERVER_SYNCING = { type: NONE, location: 'Component:LocalServerSyncing' }
export const LOCAL_SERVER_REDUCER = { type: NONE, location: 'Reducer:localServer' }

export const LOCAL_STORAGE = {type:NONE, location: 'Script:localStorage'}

export const PART_EDITOR_ROW = {type: NONE, location: 'Component:PartEditorRow'}

export const SCRIPT_EDITOR_PROCESSING = { type: DEBUG, location: 'Component:ScriptEditorProcessing' }
export const SCRIPT_EDITOR_REDUCER = {type: NONE, location: 'Reducer:scriptEditor'}
export const SCRIPT_EDITOR_TRIGGER = { type: NONE, location: 'Script:trigger' }
export const SCRIPT_EDITOR_UTILITY = { type: NONE, location: 'Script:utility' }

export const SCRIPT_ITEM_TEXT = { type: DEBUG, location: 'Component:ScriptItemText' }
export const SYNC_DROPDOWN = { type: NONE, location: 'Component:SyncDropdown' }

export function log(logObject, message, object = null) {

    switch (logObject?.type) {
        case DEBUG:
            console.log(`${logObject.location} ${message} ${object ? JSON.stringify(object) : ''}`)

            if (object) {
                console.log(object)
            } break;
        default: break

    }
}
