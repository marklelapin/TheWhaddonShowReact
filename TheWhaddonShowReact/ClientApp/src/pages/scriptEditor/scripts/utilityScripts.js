export const START = 'start';
export const END = 'end';
export const UP = 'up';
export const DOWN = 'down';
export const ABOVE = 'above';
export const BELOW = 'below';

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

export function moveFocusToId(id, position = START) {
    console.log(`moveFocusToId id: ${id} position: ${position}`)


    const newTextInput = getTextInputElement(id);

    if (newTextInput) {
        newTextInput.focus();
        if (position === START) {
            newTextInput.selectionStart = 0
            newTextInput.selectionEnd = 0
        } else {
            newTextInput.selectionStart = newTextInput.value.length
            newTextInput.selectionEnd = newTextInput.value.length
        }
    }
}

export function removeFocusFromId(id) {

    const textInput = getTextInputElement(id)

    textInput.autofocus = false;

}


const getTextInputElement = (id) => {
    const newElement = document.getElementById(id)
    if (newElement) {
        const textInputElement = newElement.querySelector('.text-input') || newElement

        if (textInputElement) {

            return textInputElement

        } else { throw new Error(`Move Focus Error: Cant locate the text-input for id: ${id}`) }

    } else {
        console.log(`Move Focus Error: Cant locate an element with id = ${id}`) //TODO extend this when more scenes available 
    }
}