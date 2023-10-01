

import { ScriptItemUpdate } from 'dataAccess/localServerModels';
import { sortLatestScriptItems } from '../../../dataAccess/localServerUtils';

export const above = 'above'
export const below = 'below'


export function newScriptItemsForCreate(placement, _existingScriptItem, _currentScriptItems, type = 'Dialogue') {

    const currentScriptItems = [..._currentScriptItems] 
    const existingScriptItem = { ..._existingScriptItem }


    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.previousId)

    let nextScriptItem = currentScriptItems.find(item => item.id === existingScriptItem.nextId)

    let newScriptItem = new ScriptItemUpdate(type)
    newScriptItem.parentId = existingScriptItem.parentId

    let newScriptItems = [];

    if (placement === above) {

        previousScriptItem.nextId = newScriptItem.id
        previousScriptItem.changed = true

        newScriptItem.previousId = previousScriptItem.id
        newScriptItem.nextId = existingScriptItem.id
        newScriptItem.changed = true;

        existingScriptItem.previousId = newScriptItem.id
        existingScriptItem.changed = true

        newScriptItems = [previousScriptItem, newScriptItem, existingScriptItem]

    }

    if (placement === below) {

        existingScriptItem.nextId = newScriptItem.id;
        existingScriptItem.changed = true

        newScriptItem.previousId = existingScriptItem.id
        newScriptItem.nextId = (nextScriptItem) ? nextScriptItem.id : null
        newScriptItem.changed = true

        if (nextScriptItem) {
            nextScriptItem.previousId = newScriptItem.id
            nextScriptItem.changed = true
        }

        newScriptItems = [existingScriptItem, newScriptItem, nextScriptItem]

    }



    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return { newScriptItem, newScriptItems }

}
export default newScriptItemsForCreate




export function newScriptItemsForDelete(scriptItemToDelete, currentScriptItems) {

    let deleteScriptItem = { ...scriptItemToDelete }

    let previousScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.previousId)
    let nextScriptItem = currentScriptItems.find(item => item.id === deleteScriptItem.nextId)

    if (previousScriptItem) {

        if (nextScriptItem) {
            previousScriptItem.nextId = nextScriptItem.id
        } else {
            previousScriptItem.nextId = null
        }

        previousScriptItem.changed = true
    }

    if (nextScriptItem) {
        nextScriptItem.previousId = previousScriptItem.id
        nextScriptItem.changed = true
    }

    deleteScriptItem.isActive = false
    deleteScriptItem.changed = true


    const newScriptItems = [];
    newScriptItems.push(previousScriptItem)
    newScriptItems.push(nextScriptItem)
    newScriptItems.push(deleteScriptItem)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}
