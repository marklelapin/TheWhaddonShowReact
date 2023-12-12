
import axios from 'axios';

import { log } from '../logging';

export async function uploadFiles(filesObject, containerName, options = {}) {

    const { showSuccessAlerts = true } = options


    const files = Object.values(filesObject)

    if (!Array.isArray(files) || files.length === 0) {
        alert('Please select at least 1 file to upload.')
        return;
    }

    const blobNames = [];
    const failedUploads = [];



    const uploadPromises = files.map(async (file) => {

        const formData = new FormData();
        formData.append('file', file)
        //formData.append('containerName', containerName)
        try {
            const response = await axios.post('file/upload', formData, {
                params: {
                    containerName: containerName
                }
            })

            if (response.status === 200) {
                if (showSuccessAlerts) alert(`${file.name} uploaded successfully.`)
                console.log(`${file.name} uploaded successfully.`)
                console.log(response.data)
                blobNames.push(response.data)
                return 'Ok'
            } else {
                alert(`${file.name} failed to upload. ${response.status} ${response.message}`)
                console.log(`${file.name} failed to upload. ${response.status} ${response.message}`)
                failedUploads.push(file.name) //TODO need to check that this is a valid field for file.
                return 'Failed'
            }

        }
        catch (error) {
            alert(`${file.name} failed to upload.`)
            console.log(`${file.name} failed to upload. ${error}`)
            failedUploads.push(file.name)
            return 'Failed'
        }



    })



    const uploadResults = await Promise.all(uploadPromises);

    if (uploadResults.every(response => response === 'Ok')) {
        if (showSuccessAlerts) { alert('All images uploaded successfully') }
    } else {
        alert(`Some images failed to upload. ${blobNames.length} out of ${files.length} were successfull.`); //TODO add number of images that failed or list of images that failed')
        console.error('Error uploading images')
        console.log("SUMMARY:")
        console.log(`Successful Uploads: ${blobNames.length}`)
        console.log(`Failed Uploads: ${failedUploads.length}`)
        console.log("Successful Uploads:")
        console.log(blobNames.toString())
        console.log("Failed Uploads:")
        console.log(failedUploads.toString())


    }

    return { blobNames, failedUploads }

}


export async function fetchFiles(containerName, fileNames) {

    const debug = true;

    if ((fileNames?.length || 0) === 0) {
        log(debug, 'fetchFiles fileNames', 'No file names provided')
        return null
    }
    log(debug, 'Avatar fetchFiles fileNames', fileNames)


    let fileNameArray = []

    if (Array.isArray(fileNames)) {
        fileNameArray = [...fileNames]
    } else {
        fileNameArray = [fileNames]
    }

    const getFile = async (fileName) => {

        try {
            log(debug, 'fetchFiles fileName', { containerName: containerName, fileName: fileName })


            const response = await axios.get('file', {
                responseType: 'arraybuffer'
                , params: {
                    containerName: containerName,
                    fileName: fileName
                }
            });


            const blob = new Blob([response.data]);
            log(debug,'fetchFiles blob',blob)
            const type = response.headers['content-type'];
            log(debug,'fetchFiles type',type)
            const file = new File([blob], fileName, { type });

            log(debug, 'fetchFiles file', file)

            return file

        }
        catch (error) {
            throw new Error(`Error fetching ${containerName} files: ` + error.message)
        }

    }

    const files = await Promise.all(fileNameArray.map(async (fileName) => await getFile(fileName)))

    return files;


}

export async function getFileTextContents(files) {

    const debug = true;
    const textContents = [];

    log(debug, 'getFileTextContents files', files)

    for (const file of files) {

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('file/getFileTextContent', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            log(debug, 'getFileTextContents response', response.data)

            if (response.status === 200) {
                textContents.push(response.data)
            } else {
                alert(`Couldn't get text from ${file.name}.`)
            }
        }
        catch (error) {
            alert(`${file.name} failed to upload.`)
            console.log(`${file.name} failed to upload. ${error}`)
            return
        }
    }

    log(debug, 'getFileTextContents textContents', textContents)
    console.log('hello')
    return textContents
}



