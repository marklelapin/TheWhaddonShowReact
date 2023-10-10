﻿const start = 'start'
const end = 'end'

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

export function moveFocusToId(id, position = start) {
    const newElement = document.getElementById(id)
    if (newElement) {
        const newTextInput = newElement.querySelector('.text-input') || newElement

        if (newTextInput) {

            newTextInput.focus();

            if (position === start) {
                newTextInput.selectionStart = 0
                newTextInput.selectionEnd = 0
            } else {
                newTextInput.selectionStart = newTextInput.value.length 
                newTextInput.selectionEnd = newTextInput.value.length
            }

        } else { throw new Error(`Move Focus Error: Cant locate the text-input for id: ${id}`) }

    } else {
        console.log(`Move Focus Error: Cant locate an element with id = ${id}`) //TODO extend this when more scenes available 
    }

}