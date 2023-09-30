const down = 'down'
const up = 'up'

export function findScriptItem(element, scriptItems) {

    let currentElement = element;
    let scriptItemId = null;
    let scriptItem = null;

    try {
        while (currentElement && scriptItemId === null) {

            if (currentElement.classList.contains('script-item')) {

                scriptItemId = currentElement.id;
            }
            currentElement = currentElement.parentElement;
        }


        (scriptItemId) ? scriptItem = scriptItems.find((item) => item.id === scriptItemId) : scriptItem = null;

        return scriptItem;


    } catch {
        throw new Error('Couldnt locate scriptItem from element.')
    }

}

export function moveFocusToId(id, direction = down) {
    const newScriptItemElement = document.getElementById(id)
    if (newScriptItemElement) {
        const newScriptItemTextInput = newScriptItemElement.querySelector('.text-input') || newScriptItemElement

        if (newScriptItemTextInput) {

            newScriptItemTextInput.focus();

            if (direction === down) {
                newScriptItemTextInput.selectionStart = 0
                newScriptItemTextInput.selectionEnd = 0
            } else {
                newScriptItemTextInput.selectionStart = newScriptItemTextInput.value.length
            }

        } else { throw new Error(`Move Focus Error: Cant locate the scriptItem text-input: ${id}`) }

    } else {
        console.log(`Move Focus Error: Cant locate an element with id = ${id} and className="script-item"`) //TODO extend this when more scenes available 
    }

}