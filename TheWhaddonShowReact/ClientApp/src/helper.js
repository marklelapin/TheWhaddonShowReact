

export function log(debug, message, object = null) {
    if (debug) {
        console.log(message)

        if (object) {
            console.log(object)
        }
    }
}
