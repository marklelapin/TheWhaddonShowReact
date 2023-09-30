

import { ScriptItemUpdate } from 'dataAccess/localServerModels';
import { sortLatestScriptItems } from '../../../dataAccess/localServerUtils';

export const above = 'above'
export const below = 'below'


export function newScriptItemsForCreate(placement, existingScriptItem, scriptItems, type = 'Dialogue') {

    let newScriptItems = [...scriptItems]

    if (!existingScriptItem) throw new Error('ExistingScriptItem missing from createNewScriptItem. A new scriptItem must be created relative to an existing scriptItem.')

    let previousScriptItem = newScriptItems.find(item => item.id === existingScriptItem.previousId)

    let nextScriptItem = newScriptItems.find(item => item.id === existingScriptItem.nextId)

    let newScriptItem = new ScriptItemUpdate(type)

    if (placement === above) {

        previousScriptItem.nextId = newScriptItem.id
        previousScriptItem.changed = true

        newScriptItem.previousId = previousScriptItem.id
        newScriptItem.nextId = existingScriptItem.id
        newScriptItem.changed = true;

        existingScriptItem.previousId = newScriptItem.id
        existingScriptItem.changed = true


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

    }


    newScriptItems = newScriptItems.map(item => {
        if (item.id === previousScriptItem.id) return previousScriptItem
        if (item.id === existingScriptItem.id) return existingScriptItem
        if (nextScriptItem && item.id === nextScriptItem.id) return nextScriptItem
        else return item
    })
    
    newScriptItems.push(newScriptItem)

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return { newScriptItem, newScriptItems }

}
export default newScriptItemsForCreate




export function newScriptItemsForDelete(scriptItemToDelete, currentScriptItems) {

    let deleteScriptItem = { ...scriptItemToDelete }

    let newScriptItems = [...currentScriptItems]

    let previousScriptItem = newScriptItems.find(item => item.id === deleteScriptItem.previousId)
    let nextScriptItem = newScriptItems.find(item => item.id === deleteScriptItem.nextId)

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


    newScriptItems = newScriptItems.map(item => {
        if (previousScriptItem && item.id === previousScriptItem.id) return previousScriptItem
        if (nextScriptItem && item.id === nextScriptItem.id) return nextScriptItem
        if (item.id === deleteScriptItem.id) return deleteScriptItem
        else return item
    })

    const sceneHead = newScriptItems.find(item => item.type === 'Scene')

    //these scriptItems and not sorted and Latest and need sortLatestScriptItems applied in the calling function (because this is where the head is known)
    return newScriptItems

}
