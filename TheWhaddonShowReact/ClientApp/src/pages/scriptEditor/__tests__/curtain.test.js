


xit.each([

]) ('refreshCurtain', (sceneOrder, previousCurtainOpen = null, newScriptItems = []) => {

        //let sceneHead = sceneOrder[0]

        //    const initialCurtain = previousCurtainOpen || sceneHead.curtainOpen || false;

        //    let currentCurtainOpen = initialCurtain;

        //    const mergedSceneOrder = [...sceneOrder, ...newScriptItems]

        //    const newSceneOrder = mergedSceneOrder.map(item => {

        //        if (opensCurtain(item)) {
        //            currentCurtainOpen = true;
        //            return { ...item, curtainOpen: currentCurtainOpen }
        //        } else if (closesCurtain(item)) {
        //            currentCurtainOpen = false;
        //            return { ...item, curtainOpen: currentCurtainOpen }
        //        } else {
        //            return { ...item, curtainOpen: currentCurtainOpen }
        //        }
        //    })

        //    return newSceneOrder;

    })


xit.each([
])('refreshHeaderCurtain', (sceneOrder, previousCurtain) => {

        //const newSceneOrder = sceneOrder.map(item => {

        //    if ([SCENE, SYNOPSIS, INITIAL_STAGING].includes(item.type)) {
        //        return { ...item, curtainOpen: previousCurtain }
        //    } else {
        //        return item;
        //    }
        //})

        //return newSceneOrder
    })

xit.each([

])('newScriptItemsForToggleCurtain', (scriptItem, overrideNewValue = null) => {

        //if (scriptItem.curtainOpen === undefined) {
        //     console.error('toggle Curtain called on scriptItem with no curtainOpen value. Assumed closed.')
        // }
        // const currentlyOpen = scriptItem.curtainOpen || false

        // const currentlyOpensCurtain = (overrideNewValue) ? !overrideNewValue : opensCurtain(scriptItem)

        // let newScriptItem = { ...scriptItem }



        // if (currentlyOpen === false && currentlyOpensCurtain) {

        //     newScriptItem = changeToCloseCurtain(newScriptItem)
        //     newScriptItem.text = 'Curtain remains closed.'
        // }

        // if (currentlyOpen && currentlyOpensCurtain === false) {

        //     newScriptItem = changeToOpenCurtain(newScriptItem)
        //     newScriptItem.text = 'Curtain remains open.'
        // }

        // if (currentlyOpen === false && currentlyOpensCurtain === false) {
        //     newScriptItem = changeToOpenCurtain(newScriptItem)
        //     newScriptItem.text = 'Curtain opens.'
        // }

        // if (currentlyOpen && currentlyOpensCurtain) {
        //     newScriptItem = changeToCloseCurtain(newScriptItem)
        //     newScriptItem.text = 'Curtain closes.'
        // }

        /*  return newScriptItem;*/
    })

xit.each([

])('clearCurtainTags', (scriptItem) => {

    //let newScriptItem = { ...scriptItem }

    //newScriptItem.tags = newScriptItem.tags.filter(tag => tag !== OPEN_CURTAIN && tag !== CLOSE_CURTAIN)
})