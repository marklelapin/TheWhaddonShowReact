import { isScreen, isScreenLargerThan, isScreenSmallerThan } from '../../../core/screenHelper'

export const getShowBools = (defaultShowSceneSelector, defaultShowComments) => {

    let showSceneSelector;
    let showScriptViewer;
    let showComments;

    if (isScreenSmallerThan('md')) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = defaultShowSceneSelector
        showComments = false
    }
    if (isScreen('md') && defaultShowComments === true) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = true
        showComments = !defaultShowSceneSelector
    }
    if (isScreen('md') && defaultShowComments === false) {
        showSceneSelector = true
        showScriptViewer = true
        showComments = false
    }
    if (isScreenLargerThan('md')) {
        showSceneSelector = true
        showScriptViewer = true
        showComments = defaultShowComments
    }

    return { showSceneSelector, showScriptViewer, showComments }

}




export const getTextAreaWidthPx = (finalText, finalPlaceholder, type, endMargin, showSceneSelector, showComments) => {

    const maxWidth = getMaxScriptItemTextWidth(showSceneSelector, showComments)
    const context = getContext(type)

    const textToMeasure = finalText || finalPlaceholder
    const textToMeasureRows = textToMeasure.split('\n') || []
    const longestRow = textToMeasureRows.reduce((a, b) => (a.length > b.length) ? a : b, '');

    const textMetrics = (context) ? context.measureText(longestRow) : { width: 0 }
    const idealWidth = textMetrics.width + endMargin
    const finalWidth = Math.max(endMargin, Math.min(maxWidth || idealWidth, idealWidth))

    const finalWidthPx = `${Math.floor(finalWidth)}px`

    return finalWidthPx;
}


export const getMaxScriptItemTextWidth = (showSceneSelector, showComments) => {

    const scriptPage = document.getElementById('script-page')

    if (scriptPage) {
        const widthDeductions = ((showComments === true) ? 310 : 0) + ((showSceneSelector === true) ? 300 : 0)
        const scriptBodyWidth = Math.min(800, scriptPage.clientWidth - widthDeductions)
        const maxScriptItemTextWidth = scriptBodyWidth - 100//for gap either side of dialogue etc.

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