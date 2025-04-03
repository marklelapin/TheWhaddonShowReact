import axios from 'axios';

export const getSettings = async () => {
    try {
        console.log('gettingsettings')
        const response = await axios({
            method: 'get',
            url: 'settings/all',
        })
        console.log('response',response)
        if (response.status !== 200) throw new Error(`ResponseCode: ${response.status}`)
        
        return response.data
    } catch (error) {
        console.error("Error Getting Settings:", error);
    }
    
}


export const postCowboyShoutOut = async (cowboyShoutOut) => {

    try {
        const response = await axios({
            method: 'post',
            url: 'settings/cowboyShoutOut',
            headers: {
                'Content-Type': 'application/json' // Ensures JSON format
            },
            data: JSON.stringify(cowboyShoutOut) // Convert `shows` to JSON
        })
        if (response.status !== 200) throw new Error(`ResponseCode: ${response.status}`)

        return response.data
    } catch (error) {
        console.error("Error posting cowboyShoutOut:", error);
    }
}


export const postShows = async (shows) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'settings/shows',
            headers: {
                'Content-Type': 'application/json' // Ensures JSON format
            },
            data: JSON.stringify(shows) // Convert `shows` to JSON
        });

        if (response.status !== 200) {
            throw new Error(`ResponseCode: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error("Error posting shows:", error);
        return null;
    }
}

export const postNewShow = async () => {
    try {
        const response = await axios({
            method: 'post',
            url: 'settings/createNewShow',
        });

        if (response.status !== 200) {
            throw new Error(`ResponseCode: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error("Error posting shows:", error);
    }
}

export const takeShowSnapshot = async (showId,description) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'settings/showSnapshot',
            params: {
                showId: showId,
                description: description
            }
        });

        if (response.status !== 200) {
            throw new Error(`ResponseCode: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error("Error posting shows:", error);
    }
}
