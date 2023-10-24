

export function log(debug, message, object = null) {
    if (debug) {
        console.log(`${message} ${object ? JSON.stringify(object) : ''}`)

        if (object) {
            console.log(object)
        }
    }
}
