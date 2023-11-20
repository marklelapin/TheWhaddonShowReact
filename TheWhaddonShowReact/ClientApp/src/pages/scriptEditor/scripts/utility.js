import { log } from '../../../helper.js';

export const START = 'start';
export const END = 'end';
export const UP = 'up';
export const DOWN = 'down';
export const ABOVE = 'above';
export const BELOW = 'below';
export const SCENE_END = 'sceneEnd';

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

export function moveFocusToId(id, position = START, scroll = false) {
    const debug = true;
    console.log(`moveFocusToId id: ${id} position: ${position}`)
    try {
        if (position === SCENE_END) {

            const sceneElement = document.getElementById(`scene-${id}`)
            //log(debug, 'moveFocusToId sceneElement', sceneElement)
            
            const sceneTextInputs = sceneElement.querySelectorAll('.text-input')
            //log(debug, 'moveFocusToId sceneTextInputs', sceneTextInputs)

            const lastTextInput = sceneTextInputs[sceneTextInputs.length - 1]
            //log(debug, 'moveFocusToId lastTextInput', lastTextInput)

            if (lastTextInput) {
                lastTextInput.focus();
                lastTextInput.selectionStart = lastTextInput.value.length
            }

            return
        }
        const newTextInput = getTextInputElement(id);

        if (newTextInput) {
            if (scroll) {
                const offset = newTextInput.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: offset, behaviour: 'smooth' })
            }
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
    catch(error) {
        log(debug, 'Move Focus Error: Cant locate the text-input:', { id, position, scroll, error })
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