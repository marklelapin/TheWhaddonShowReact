import axios from 'axios';

import { IMPORT_GUID } from '../ScriptImporter';
import { ScriptItemUpdate } from '../../../dataAccess/localServerModels.js';
import { ACTION } from '../../../dataAccess/scriptItemTypes.js';




export const getScriptItem = async (lineOfText, parts) => {

    try {
        const response = await convertTextToScriptItems(lineOfText, parts)

        if (response.status === 200) {
            const { newScriptItemUpdates } = response.data
            if (newScriptItemUpdates.length > 0) {
                newScriptItemUpdates.map(item => ({ ...item, parentId: IMPORT_GUID }))
            }
            return newScriptItemUpdates[0];
        } else {
            throw new Error(`Error converting text to scriptItem: StatusCode ${response.status}. ${response.data}`)
        };
    }
    catch (error) {
        //log issue
        console.log(error)
        // and create action from lineOfText as default
        const newScriptItem = new ScriptItemUpdate({
            type: ACTION,
            text: lineOfText,
            parentId: IMPORT_GUID,
            isImport: true
        })
        return newScriptItem
    }
}

export async function convertTextToScriptItems(text, parts) { //, previousId,nextId

    const partNames = parts.map(part => part.name)
    const partIds = parts.map(part => part.id)

    const url = 'ScriptImport/convertTextToScriptItems'
    try {
        const response = await axios.post(url, text, {
            headers: {
                'Content-Type': 'text/plain',
            },
            params: { partNames, partIds, parentId: IMPORT_GUID } //, previousId: previousId, nextId: nextId
        })

        if (response.status === 200) {
            return response.data
        }
        else {
            const errorMessage = `Couldn't convert following text to ScriptItem: \n ${text}.`
            alert(errorMessage)
            console.log(errorMessage)
            return null;
        }
    }
    catch (error) {
        alert(`Error getting response from ${url}. ` + error.message)
        return null;
    }

}

export async function convertTextToHeaderScriptItems(text) {

    const url = 'ScriptImport/convertTextToHeaderScriptItems'
    try {
        const response = await axios.post(url, text, {
            headers: {
                'Content-Type': 'text/plain',
            },
           // params: { parentId: IMPORT_GUID }

        })

        if (response.status === 200) {
            return { status: 200, data: response.data }
        }
        else {
            const errorMessage = `Failed to convert to header ScriptItems: \n ${response.data}.`
            alert(errorMessage)
            console.log(errorMessage)
            return null;
        }
    }
    catch (error) {
        const errorMessage = `Error getting response from ${url}. ` + error.message
        alert(errorMessage)
        console.log(errorMessage)
        return null;
    };

}

export function filterNonEmptyStrings(strings) {
    const regex = /\w/;

    return strings.filter(string => regex.test(string))
}
