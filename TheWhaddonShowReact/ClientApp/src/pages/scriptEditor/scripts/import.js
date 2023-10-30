import axios from 'axios';
import { remove } from 'lodash';

export async function convertTextToScriptItems(text) {

    try {
        const response = axios.post('scriptImport/convertTextToScriptItems', text)

        if (response.status === 200) {
            return response.data
        }
        else {
            alert(`Couldn't convert text to script items.`)
            return null;
        }
    }
    catch (error) {
        alert('Error converting text to script items. ' + error.message)
        return null;
    }

}

