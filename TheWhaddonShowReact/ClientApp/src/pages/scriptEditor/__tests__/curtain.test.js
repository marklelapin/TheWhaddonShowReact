import {
    laterCreatedDate,
    scene1,
    dialogue13,
    initialCurtain1,
    mockSceneOrders,
    mockPreviousCurtainOpen,
} from './mockData'
import { refreshCurtain, newScriptItemsForToggleCurtain } from '../scripts/curtain';
import {  OPEN_CURTAIN, CLOSE_CURTAIN } from '../../../dataAccess/scriptItemTypes';
import { log , TEST } from '../../../logging'


it.each([
    [1, mockSceneOrders[scene1.id], null, null],
    [2, mockSceneOrders[scene1.id], dialogue13, OPEN_CURTAIN]
])('refreshCurtain', (scenario, sceneOrder, scriptItemToChange, curtainTag) => {

    const newScriptItems = (scriptItemToChange) ? [{ ...copy(scriptItemToChange), created: laterCreatedDate, type: "CURTAIN", tags: [curtainTag] }] : []

    const actualRefreshedCurtain = refreshCurtain(sceneOrder, newScriptItems)

    if (scenario === 1) { //scene1

        expect(actualRefreshedCurtain[0].curtainOpen).toEqual(false) //scnee
        expect(actualRefreshedCurtain[1].curtainOpen).toEqual(false) //synopsis
        expect(actualRefreshedCurtain[2].curtainOpen).toEqual(false) //INITIAL_STAGING
        expect(actualRefreshedCurtain[3].curtainOpen).toEqual(true) //initial curtain
        expect(actualRefreshedCurtain[4].curtainOpen).toEqual(true) // dialogue11
        expect(actualRefreshedCurtain[5].curtainOpen).toEqual(true) //dialogue12
        expect(actualRefreshedCurtain[6].curtainOpen).toEqual(false) //dialogue13 //curtain closes
        expect(actualRefreshedCurtain[7].curtainOpen).toEqual(false) //dialogue14)

    }

    if (scenario === 2) {
        expect(actualRefreshedCurtain[0].curtainOpen).toEqual(false) //scnee
        expect(actualRefreshedCurtain[1].curtainOpen).toEqual(false) //synopsis
        expect(actualRefreshedCurtain[2].curtainOpen).toEqual(false) //INITIAL_STAGING
        expect(actualRefreshedCurtain[3].curtainOpen).toEqual(true) //initial curtain
        expect(actualRefreshedCurtain[4].curtainOpen).toEqual(true) // dialogue11
        expect(actualRefreshedCurtain[5].curtainOpen).toEqual(true) //dialogue12
        expect(actualRefreshedCurtain[6].curtainOpen).toEqual(true) //dialogue13 //curtain chnaged to opens
        expect(actualRefreshedCurtain[7].curtainOpen).toEqual(true) //dialogue14)
    }

})




it.each([
    [1, dialogue13, null], //toggle from closes curtain to opens curtain
    [2,initialCurtain1, null], //toggle  from opens curtain to closes curtain.
    [3, dialogue13, true], //set original state to open from closed 
    [4,dialogue13, false], //set original state to closed from closed (should return nothing)
])('newScriptItemsForToggleCurtain', (scenario, scriptItem, overrideNewValue = null) => {
    const logType = TEST;

    const actualResult = newScriptItemsForToggleCurtain(scriptItem, overrideNewValue)

    log(logType, 'newScriptItemsForToggleCurtain', { scenario, scriptItem, newValue: overrideNewValue, actualresult: actualResult[0], actualresultlength: actualResult.length })

    switch (scenario) {
        case 1:
            expect(actualResult.length).toEqual(1)
            expect(actualResult[0].tags).toEqual([OPEN_CURTAIN])
            break;
        default: break;
        case 2:
            expect(actualResult.length).toEqual(1)
            expect(actualResult[0].tags).toEqual([CLOSE_CURTAIN])
            break;
        case 3:
            expect(actualResult.length).toEqual(1);
            expect(actualResult[0].tags).toEqual([OPEN_CURTAIN])
            break;
        case 4:
            expect(actualResult.length).toEqual(0)
            break;
    }
})


const copy = (object) => {
    return JSON.parse(JSON.stringify(object))
}