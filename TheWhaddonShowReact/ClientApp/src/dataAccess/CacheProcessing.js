//React and Redux
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//utils
import { getLatest } from '../dataAccess/localServerUtils';
import { fetchFiles } from './fileUtils';
import { addToCache } from '../actions/cache';
import { AVATARS } from '../dataAccess/storageContainerNames';

export function CacheProcessing() {

    const dispatch = useDispatch();

    //Redux - localServer (handles syncing)
    const storedPersons = useSelector(state => state.localServer.persons.history)

    const cachedAvatars = useSelector(state => state.cache.avatars)

    //Avatar Caching
    useEffect(() => {

        const persons = getLatest(storedPersons)


        const cacheAvatarURLs = async () => {
            for (const person of persons) {

                if (person.pictureRef && !cachedAvatars[person.pictureRef]) {

                    const file = await fetchFile(person.pictureRef)

                    const imageObjectURL = await createObjectURL(file)

                    dispatch(addToCache(AVATARS, person.pictureRef, imageObjectURL))
                }
            }

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


