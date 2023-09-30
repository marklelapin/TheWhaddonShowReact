export function getNextUndoDate(history, undoDateTime) {

    const undoDate = undoDateTime || new Date();

    const dateArray = [...history].filter(item => item.created < undoDate).map(item => item.created)

    let latestDateBeforeUndo = dateArray[0]

    for (const date of dateArray) {
        if (date > latestDateBeforeUndo)
            latestDateBeforeUndo = date;
    }

    return latestDateBeforeUndo
}


export function getNextRedoDate(history, undoDateTime) {

    const dateArray = [...history].filter(item => item.created > undoDateTime).map(item => item.created)
    let earliestDateAfterRedo = dateArray[0]

    for (const date of dateArray) {
        if (date < earliestDateAfterRedo)
            earliestDateAfterRedo = date;
    }
   
    return earliestDateAfterRedo
}