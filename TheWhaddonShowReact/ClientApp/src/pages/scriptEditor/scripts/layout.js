import { isScreen, isScreenLargerThan, isScreenSmallerThan } from '../../../core/screenHelper'

export const getShowBools = (defaultShowSceneSelector, defaultShowComments) => {

    let showSceneSelector;
    let showScriptViewer;
    let showComments;

    if (isScreenSmallerThan('md')) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = !defaultShowSceneSelector
        showComments = false
    }
    if ((isScreen('lg') || isScreen('md')) && defaultShowComments === true) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = true
        showComments = !defaultShowSceneSelector
    }
    if ((isScreen('lg') || isScreen('md')) && defaultShowComments === false) {
        showSceneSelector = true
        showScriptViewer = true
        showComments = false
    }
    if (isScreen('xl')) {
        showSceneSelector = true
        showScriptViewer = true
        showComments = defaultShowComments
    }

    return { showSceneSelector, showScriptViewer, showComments }

}




export const getTextAreaWidth = (finalText, finalPlaceholder, type, endMargin, showSceneSelector, showComments) => {

    const maxTextAreaWidth = getMaxScriptItemTextWidth(showSceneSelector, showComments)

    const context = getContext(type)

    const textToMeasure = finalText || finalPlaceholder
    const textToMeasureRows = textToMeasure.split('\n') || []
    const longestRow = textToMeasureRows.reduce((a, b) => (a.length > b.length) ? a : b, '');

    const textMetrics = (context) ? context.measureText(longestRow) : { width: 0 }
    const idealWidth = textMetrics.width + endMargin
    const finalWidth = Math.max(endMargin, Math.min(maxTextAreaWidth || idealWidth, idealWidth))

    const finalWidthInteger = Math.floor(finalWidth)

    return finalWidthInteger;
}


export const getMaxScriptItemTextWidth = (showSceneSelector, showComments) => {

    const scriptBody = document.getElementById('script-body')

    if (scriptBody) {
        const widthDeductions = ((showComments === true) ? 310 : 0) //+ ((showSceneSelector === true) ? 300 : 0)
        const scriptWidth = Math.min(800, scriptBody.clientWidth - widthDeductions)
        const maxScriptItemTextWidth = scriptWidth - 100//for gap either side of dialogue etc.

        return maxScriptItemTextWidth
    }
    return null

}

const getContext = (type) => {
    try {
        const textInputRef = document.getElementById(`text-area-context-${type?.toLowerCase()}`)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = window.getComputedStyle(textInputRef).font;
        context.fontSize = window.getComputedStyle(textInputRef).fontSize;

        return context;
    }
    catch {
        return null
    }

}