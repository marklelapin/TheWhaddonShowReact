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


export const getMaxScriptItemTextWidth = (showSceneSelector, showComments) => {

    const scriptPage = document.getElementById('script-page')

    if (scriptPage) {
        const widthDeductions = ((showComments === true) ? 310 : 0) + ((showSceneSelector === true) ? 300 : 0)

        const scriptBodyWidth = Math.min(800, scriptPage.clientWidth - widthDeductions)
        const maxScriptItemTextWidth = scriptBodyWidth - 100//for gap either side of dialogue etc.

        return maxScriptItemTextWidth
    } else {
        console.error('script-page not found')
        return null;
    } 


}