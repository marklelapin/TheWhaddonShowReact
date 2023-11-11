

export function getNextUndoDate(history, undoDateTime) {

    const undoDate = new Date( undoDateTime || new Date())

    const dateArray = history.map(item => new Date(item.created))

    let latestDateBeforeUndo = null
    let earliestUpdate = null
    for (const date of dateArray) {

        if (date < undoDate && date > latestDateBeforeUndo) {
latestDateBeforeUndo = date;
        }
        if (date < (earliestUpdate || new Date('2100-01-01'))) {
            earliestUpdate = date
        }

     }

    return (latestDateBeforeUndo === null || latestDateBeforeUndo <= earliestUpdate) ? undoDateTime : latestDateBeforeUndo
}


export function getNextRedoDate(history, undoDateTime) {

    const undoDate = new Date(undoDateTime || new Date())

    const dateArray = history.map(item => new Date(item.created))

    let earliestDateAfterRedo = null

    for (const date of dateArray) {
        if ((date > undoDate) && (date < earliestDateAfterRedo || new Date(2100, 1, 1))) {//a date way in the future
            earliestDateAfterRedo = date;
        }
    }
   
    return  earliestDateAfterRedo
}

export function getUndoneScriptItemIds(history, undoDateTime) {
    const undoneScriptItemIds = [...new Set(history.filter(item => new Date(item.created) > undoDateTime).map(item => item.id))]
    return undoneScriptItemIds
}