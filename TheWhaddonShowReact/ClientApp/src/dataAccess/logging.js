const DEBUG = 'DEBUG'
//const PRODUCTION = 'PRODUCTION'
const NONE = 'NONE'

//logTypes
export const ACCOUNT_DROPDOWN = { type: NONE, location: 'Component:AccountDropdown' }

export const APP = { type: NONE, location: 'Component: App' }

export const AVATAR = { type: NONE, location: 'Component:Avatar' }
export const BROWSER_STORAGE = { type: NONE, location: 'Script:browserStorage' }
export const CACHE_PROCESSING = { type: NONE, location: 'Component:CacheProcessing' }

export const CAST_MEMBER = { type: NONE, location: 'Component:CastMember' }

export const CASTING = { type: NONE, location: 'Component:Casting' }
export const CASTING_SCRIPTS = { type: NONE, location: 'Script:casting' }
export const COMMENT = { type: NONE, location: 'Component:COMMENT' }
export const CONFIRM_CLICK = { type: NONE, location: 'Component:ConfirmClick' }

export const FILE_UTILS = { type: NONE, location: 'Script:fileUtils' }

export const HOME = { type: NONE, location: 'Component:Home' }
export const ICONS = { type: NONE, location: 'Component:Icons' }
export const INDEX = { type: NONE, location: 'Component:INDEX' }
export const INDEXED_DB = { type: NONE, location: 'Script:indexedDB' }

export const LAYOUT = { type: NONE, location: 'Component: Layout' }

export const LOCAL_SERVER_UTILS = { type: NONE, location: 'Script:localServerUtils' }
export const LOCAL_SERVER_SYNCING = { type: NONE, location: 'Component:LocalServerSyncing' }
export const LOCAL_SERVER_REDUCER = { type: NONE, location: 'Reducer:localServer' }
export const LOCAL_STORAGE = { type: NONE, location: 'Script:localStorage' }

export const LOGIN = { type: NONE, location: 'Component: Login' }

export const MEDIA_DISPLAY = { type: NONE, location: 'Component:MediaDisplay' }
export const MEDIA_DROPZONE = { type: NONE, location: 'Component:MediaDropzone' }

export const PART = { type: NONE, location: 'Script:Part' }
export const PART_EDITOR_ROW = { type: NONE, location: 'Component:PartEditorRow' }
export const PART_SELECTOR_DROPDOWN = { type: DEBUG, location: 'Component:PartSelectorDropdown' }

export const PERSON = { type: NONE, location: 'Script:Person' }
export const PERSON_SELECTOR = { type: NONE, location: 'Component:PersonSelector' }
export const PERSONAL_DETAILS = { type: NONE, location: 'Component:PersonalDetails' }
export const SCENE = { type: DEBUG, location: 'Component:Scene' }
export const SCENE_SELECTOR = { type: NONE, location: 'Component:SceneSelector' }
export const SCENE_SELECTOR_ROW = { type: NONE, location: 'Component:SceneSelectorRow' }

export const SCRIPT_EDITOR_PROCESSING = { type: NONE, location: 'Component:ScriptEditorProcessing' }
export const SCRIPT_EDITOR_REDUCER = { type: NONE, location: 'Reducer:scriptEditor' }
export const SCRIPT_EDITOR_SCENE_ORDER = { type: DEBUG, location: 'Component:ScriptEditorSceneOrder' }
export const SCRIPT_EDITOR_TRIGGER = { type: NONE, location: 'Script:trigger' }
export const SCRIPT_EDITOR_UNDO = { type: NONE, location: 'Script:undo' }
export const SCRIPT_EDITOR_UTILITY = { type: NONE, location: 'Script:utility' }

export const SCRIPT_ITEM = { type: NONE, location: 'Component:ScriptItem' }
export const SCRIPT_ITEM_CONTROLS = { type: NONE, location: 'Component:ScriptItemControls' }
export const SCRIPT_ITEM_TEXT = { type: NONE, location: 'Component:ScriptItemText' }
export const SCRIPT_ITEM_HEADER = { type: NONE, location: 'Component:ScriptItemHeader' }
export const SCRIPT = { type: NONE, location: 'Component:Script' }
export const SCRIPT_VIEWER = { type: NONE, location: 'Component:ScriptViewer' }
export const SCRIPT_VIEWER_HEADER = { type: NONE, location: 'Component:ScriptViewerHeader' }

export const SYNC_DROPDOWN = { type: NONE, location: 'Component:SyncDropdown' }

export const TEST = { type: NONE, location: 'Test: ' }
export const TEST_CURTAIN = { type: NONE, location: 'Script:curtain' }
export const USERS = { type: NONE, location: 'Component:Users' }
export const USER_ACCESS = { type: NONE, location: 'Script:userAccess' }
export const USER_UPDATE = { type: NONE, location: 'Component:UserUpdate' }
export function log(logObject, message, object = null) {

   /* const isDevelopment = (process.env.NODE_ENV === 'development')*/

    switch (logObject?.type) {
        case DEBUG:
            /*if (isDevelopment) {*/
                console.log(`${logObject.location} ${message} ${object ? JSON.stringify(object) : ''}`)

                if (object) {
                    console.log(object)
                } 
          /*  }*/
            break;

        default: break

    }
}
