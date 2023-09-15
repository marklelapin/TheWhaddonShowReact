
import axios from 'axios';


export async function uploadFiles (files, targetFolder) {

        if (files.length === 0) {
            alert('Please select at least 1 file to upload.')
            return;
        }

        const successfullResponses = [];
        const failedUploads = [];

        const uploadPromises = files.map(async (file) => {

            const formData = new FormData();
            formData.append('file', file)
            formData.append('folder', targetFolder)
            const response = await axios.post('file/upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then(response => {
                if (response.status === 200) {
                    alert(`${file.name} uploaded successfully.`)
                    console.log(`${file.name} uploaded successfully.`)
                    successfullResponses.push(response.message)
                    return 'Ok'
                } else {
                    alert(`${file.name} failed to upload.`)
                    console.log(`${file.name} failed to upload.`)
                    failedUploads.push(file.name) //TODO need to check that this is a valid field for file.
                    return 'Failed'
                }
            })
                .catch(error => {
                    alert(`${file.name} failed to upload.`)
                    console.log(`${file.name} failed to upload. ${error}`)
                    failedUploads.push(file.name)
                    return 'Failed'
                })

            return response;
        })

        const uploadResults = await Promise.all(uploadPromises);

        if (uploadResults.every(response => response === 'Ok')) {
            alert('All images uploaded successfully');
        } else {
            alert(`Some images failed to upload. ${successfullResponses.length} out of ${files.length} were successfull.`); //TODO add number of images that failed or list of images that failed')
            console.error('Error uploading images')
            console.log("SUMMARY:")
            console.log(`Successful Uploads: ${successfullResponses.length}`)
            console.log(`Failed Uploads: ${failedUploads.length}`)
            console.log("Successful Uploads:")
            console.log(successfullResponses.toString())
            console.log("Failed Uploads:")
            console.log(failedUploads.toString())


        }

        return { successfullResponses, failedUploads }

    }




