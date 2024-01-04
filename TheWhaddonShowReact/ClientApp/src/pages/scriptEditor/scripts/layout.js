import { isScreen, isScreenSmallerThan } from '../../../core/screenHelper'
import { getScriptItemPlaceholder } from './scriptItem';

export const DEFAULT_END_MARGIN = 100;

export const getShowBools = (defaultShowSceneSelector, defaultShowComments) => {

    let showSceneSelector;
    let showScriptViewer;
    let showComments;
    let showCommentControls;
    let showSceneSelectorControls;
    let modalSceneSelector;

    if (isScreenSmallerThan('md')) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = true
        showComments = false
        showCommentControls = false;
        showSceneSelectorControls = true;
        modalSceneSelector = true;
    }
    if (isScreen('md')) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = true
        showComments = defaultShowComments;
        showCommentControls = true;
        showSceneSelectorControls = true;
        modalSceneSelector = (defaultShowComments === true) ? true : false
    }
    if (isScreen('lg')) {
        showSceneSelector = defaultShowSceneSelector
        showScriptViewer = true
        showComments = defaultShowComments
        showCommentControls = true;
        showSceneSelectorControls = true;
        modalSceneSelector = false;
    }
    if (isScreen('xl')) {
        showSceneSelector = true
        showScriptViewer = true
        showComments = defaultShowComments
        showCommentControls = true;
        showSceneSelectorControls = false;
        modalSceneSelector = false;
    }

    return { showSceneSelector, showScriptViewer, showComments, showCommentControls,showSceneSelectorControls, modalSceneSelector }

}




export const getTextAreaWidth = (finalText, type, _endMargin, maxTextAreaWidth) => {

    const finalPlaceholder = getScriptItemPlaceholder(type)
    const endMargin = (_endMargin !== null) ? _endMargin  : DEFAULT_END_MARGIN

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