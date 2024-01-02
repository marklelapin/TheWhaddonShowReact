//React and Redux
import { useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';

//utils
import { getLatest } from '../dataAccess/localServerUtils';
import { fetchFiles } from './fileUtils';
import { addToCache } from '../actions/cache';
import { AVATARS } from '../dataAccess/storageContainerNames';

import { log, CACHE_PROCESSING as logType } from '../logging';

export function CacheProcessing() {

    const dispatch = useDispatch();

    //Redux - localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)

    const cachedAvatars = useSelector(state => state.cache.avatars)

    //internal State
    const [avatarsBeingProcessed, setAvatarsBeingProcessed] = useState([])

    //Avatar Caching
    useEffect(() => {

        const persons = getLatest(storedPersons)
        const pictureRefs = persons.map(person => person.pictureRef).filter(pictureRef => pictureRef !== undefined || pictureRef !== null)
        const unprocessedPictureRefs = pictureRefs.filter(pictureRef => !cachedAvatars[pictureRef])

        const unprocessedPictureRefsNotBeingProcessed = unprocessedPictureRefs.filter(pictureRef => !avatarsBeingProcessed.includes[pictureRef])
        log(logType, 'pictureRefs', { pictureRefs, unprocessedPictureRefs, unprocessedPictureRefsNotBeingProcessed })
        const cacheAvatarURLs = async () => {

            setAvatarsBeingProcessed([...avatarsBeingProcessed, ...unprocessedPictureRefsNotBeingProcessed])

            for (const pictureRef of unprocessedPictureRefsNotBeingProcessed) {

                const file = await fetchFile(pictureRef)

                const imageObjectURL = await createObjectURL(file)

                dispatch(addToCache(AVATARS, pictureRef, imageObjectURL))
            }
            setAvatarsBeingProcessed(avatarsBeingProcessed.filter(pictureRef => !unprocessedPictureRefsNotBeingProcessed.includes(pictureRef)))
        }
    

        const fetchFile = async (pictureRef) => {

        try {
            let files = []
            files = await fetchFiles(AVATARS, pictureRef)
            return files[0]
        }
        catch (error) {
            console.log('Failed to fetch pictureRef :' + pictureRef + '. error: ' + error.message)
        }
    }

    const createObjectURL = async (file) => {
        try {
            const imageObjectURL = URL.createObjectURL(file)
            return imageObjectURL
        }
        catch (error) {
            throw new Error(`Error creating object URL for ${AVATARS} files: ` + error.message)
        }

    }


    cacheAvatarURLs()

}, [storedPersons]) //es-lint disable-line react-hooks/exhaustive-deps





return null

}

export default CacheProcessing;


