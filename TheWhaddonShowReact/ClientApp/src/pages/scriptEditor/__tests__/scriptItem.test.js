import {
    mockCurrentScriptItems,
    scene1,
    scene2,
    scene3,
    scene4,
    scene5,
    scene6,
    scene7,
    show,
    act1,
    act2,
    synopsis1,
    initialStage1,
    initialCurtain1,
    dialogue11,
    dialogue12,
    dialogue13,
    dialogue14,
    synopsis2,
    initialStage2,
    initialCurtain2,
    dialogue21,
    dialogue22,
    dialogue23,
    dialogue24,
    dialogue25,
    comment23,
    comment25,
    synopsis7,
    initialStage7,
    initialCurtain7,
    dialogue71,
    dialogue72,
    dialogue73,
} from './mockData';

import {
    newScriptItemsForCreateShow,
    newScriptItemsForCreate,
    newScriptItemsForDelete,
    newScriptItemsForSceneDelete,
    newScriptItemsForCreateHeader,
    newScriptItemsForMoveScene,
    newScriptItemsForAddComment,
    newScriptItemsForDeleteComment,
    newScriptItemsForSwapPart,
    getScriptItemUpdatesLaterThanCurrent,
    getSurroundingScriptItems,

} from '../scripts/scriptItem';

import { SHOW, ACT, SCENE, STAGING, DIALOGUE, SYNOPSIS, INITIAL_CURTAIN, INITIAL_STAGING, COMMENT } from '../../../dataAccess/scriptItemTypes';

import { ABOVE, BELOW } from '../scripts/utility'
import { ScriptItemUpdate } from '../../../dataAccess/localServerModels';
import { log } from '../../../helper';


it('newScriptItemsForCreateShow', () => {

    const title = 'new show'

    const actualArray = newScriptItemsForCreateShow(title)

    const actualShow = actualArray[0]
    const actualAct1 = actualArray[1]
    const actualAct2 = actualArray[2]

    expect(actualArray.length).toEqual(3);

    expect(actualShow.text).toEqual(title)
    expect(actualAct1.text).toEqual('Act 1')
    expect(actualAct2.text).toEqual('Act 2')

    expect(actualShow.type).toEqual(SHOW)
    expect(actualAct1.type).toEqual(ACT)
    expect(actualAct2.type).toEqual(ACT)

    expect(actualShow.nextId).toEqual(actualAct1.id);
    expect(actualAct1.nextId).toEqual(actualAct2.id);
    expect(actualAct2.previousId).toEqual(actualAct1.id);
    expect(actualAct1.previousId).toEqual(actualShow.id);

});

it.each([
    [ABOVE, dialogue23, mockCurrentScriptItems, undefined, undefined],
    [BELOW, dialogue23, mockCurrentScriptItems, null, null],
    [ABOVE, dialogue23, mockCurrentScriptItems, undefined, 'changedText'],
    [BELOW, dialogue23, mockCurrentScriptItems, undefined, 'changedText'],
    [ABOVE, dialogue23, mockCurrentScriptItems, STAGING, null],
    [BELOW, dialogue23, mockCurrentScriptItems, STAGING, null],
    [ABOVE, dialogue23, mockCurrentScriptItems, STAGING, 'changedText']
])
    ('newScriptItemsForCreate', (placement, _existingScriptItem, currentScriptItems, type, tempTextValue) => {

        const debug = false;
        log(debug, 'newSCriptITemsfroCreateShow', { placement, type, tempTextValue })


        const actualResult = newScriptItemsForCreate(placement, _existingScriptItem, currentScriptItems, type, tempTextValue)
        const actualPreviousScriptItem = actualResult[0]
        const actualNewScriptItem = actualResult[1]
        const actualNextScriptItem = actualResult[2]

        expect(actualResult.length).toEqual(3)

        let expectedPreviousScriptItem;
        let expectedNewScriptItem;
        let expectedNextScriptItem;

        if (placement === ABOVE) {

            expectedPreviousScriptItem = { ...copy(dialogue22), nextId: actualNewScriptItem.id }
            expectedNewScriptItem = { ...copy(actualNewScriptItem), previousId: dialogue22.id, nextId: dialogue23.id }
            expectedNextScriptItem = { ...copy(dialogue23), previousId: actualNewScriptItem.id }

            if (tempTextValue) {
                expectedNextScriptItem = { ...copy(expectedNextScriptItem), text: 'changedText' }
            }
        }

        if (placement === BELOW) {
            expectedPreviousScriptItem = { ...copy(dialogue23), nextId: actualNewScriptItem.id }
            expectedNewScriptItem = { ...copy(actualNewScriptItem), previousId: dialogue23.id, nextId: dialogue24.id }
            expectedNextScriptItem = { ...copy(dialogue24), previousId: actualNewScriptItem.id }

            if (tempTextValue) {
                expectedPreviousScriptItem = { ...copy(expectedPreviousScriptItem), text: 'changedText' }
            }
        }

        if (type) {
            expectedNewScriptItem = { ...copy(expectedNewScriptItem), type: STAGING }
        } else {
            expectedNewScriptItem = { ...copy(expectedNewScriptItem), type: DIALOGUE }
        }


        log(debug, 'newScriptItem', { actualNewScriptItem, expectedNewScriptItem })
        expect(actualPreviousScriptItem).toEqual(expectedPreviousScriptItem)
        expect(actualNewScriptItem).toEqual(expectedNewScriptItem)
        expect(actualNextScriptItem).toEqual(expectedNextScriptItem)

    });


it.each([
    [ABOVE, dialogue25, mockCurrentScriptItems, undefined, undefined],
    [BELOW, dialogue25, mockCurrentScriptItems, undefined, undefined]
])
    ('newScriptItemsForCreate Last-Item', (placement, _existingScriptItem, currentScriptItems, type, tempTextValue) => {

        const debug = false;
        log(debug, 'newSCriptITemsfroCreateShow', { placement })


        const actualResult = newScriptItemsForCreate(placement, _existingScriptItem, currentScriptItems, type, tempTextValue)
        const actualPreviousScriptItem = actualResult[0]
        const actualNewScriptItem = actualResult[1]
        const actualNextScriptItem = actualResult[2]


        let expectedPreviousScriptItem;
        let expectedNewScriptItem;
        let expectedNextScriptItem;

        if (placement === ABOVE) {
            expectedPreviousScriptItem = { ...copy(dialogue24), nextId: actualNewScriptItem.id }
            expectedNewScriptItem = { ...copy(actualNewScriptItem), previousId: dialogue24.id, nextId: dialogue25.id }
            expectedNextScriptItem = { ...copy(dialogue25), previousId: actualNewScriptItem.id }
        }

        if (placement === BELOW) {
            expectedPreviousScriptItem = { ...copy(dialogue25), nextId: actualNewScriptItem.id }
            expectedNewScriptItem = { ...copy(actualNewScriptItem), previousId: dialogue25.id, nextId: null }
            expectedNextScriptItem = undefined;
        }

        if (placement === ABOVE) {
            expect(actualResult.length).toEqual(3)
        } else {
            expect(actualResult.length).toEqual(2)
        }
        expect(actualPreviousScriptItem).toEqual(expectedPreviousScriptItem)
        expect(actualNewScriptItem).toEqual(expectedNewScriptItem)
        expect(actualNextScriptItem).toEqual(expectedNextScriptItem)

    });


it.each([
    [dialogue23, mockCurrentScriptItems],
    [dialogue25, mockCurrentScriptItems]

])
    ('newScriptItemsForDelete', (scriptItemToDelete, currentScriptItems) => {
        const debug = false;

        const actualResult = newScriptItemsForDelete(scriptItemToDelete, currentScriptItems)

        log(debug, 'newSCriptItemsForDelete', actualResult)

        if (scriptItemToDelete === dialogue23) {
            expect(actualResult.length).toEqual(3)
            expect(actualResult[0]).toEqual({ ...copy(dialogue22), previousId: dialogue21.id, nextId: dialogue24.id })// new previousScriptItem
            expect(actualResult[1]).toEqual({ ...copy(dialogue24), previousId: dialogue22.id, nextId: dialogue25.id }) //new nextScriptItem
            expect(actualResult[2]).toEqual({ ...copy(dialogue23), isActive: false }) //deleted scriptItem
        }
        if (scriptItemToDelete === dialogue25) {
            expect(actualResult.length).toEqual(2)
            expect(actualResult[0]).toEqual({ ...copy(dialogue24), previousId: dialogue23.id, nextId: null })
            expect(actualResult[1]).toEqual({ ...copy(dialogue25), isActive: false })
        }
    })


it.each([
    [scene3, mockCurrentScriptItems],
    [scene7, mockCurrentScriptItems]
])
    ('newScriptItemsForCreateHeader', (previousScene, currentScriptItems) => {

        const nextScene = (previousScene = scene3) ? scene4 : null

        const debug = false;

        const actualResult = newScriptItemsForCreateHeader(previousScene, currentScriptItems)

        log(debug, 'newScriptItemsForCreateHeader', { actualResult })

        const actualPreviousScene = actualResult[0]
        const actualScene = actualResult[1]
        const actualSynopis = actualResult[2]
        const actualInitialStaging = actualResult[3]
        const actualInitialCurtain = actualResult[4]
        const actualDialogue = actualResult[5]
        const actualNextScene = actualResult[6]

        //test length
        if (previousScene === scene3) {
            expect(actualResult.length).toEqual(7)
        } else {
            expect(actualResult.length).toEqual(6)
        }

        expect(actualPreviousScene).toEqual({ ...copy(previousScene), nextId: actualScene.id })
        expect(actualScene).toEqual({ ...copy(actualScene), previousId: previousScene.id, nextId: previousScene.nextId, type: SCENE })
        expect(actualSynopis).toEqual({ ...copy(actualSynopis), previousId: actualScene.id, nextId: actualInitialStaging.id, type: SYNOPSIS })
        expect(actualInitialStaging).toEqual({ ...copy(actualInitialStaging), previousId: actualSynopis.id, nextId: actualInitialCurtain.id, type: INITIAL_STAGING })
        expect(actualInitialCurtain).toEqual({ ...copy(actualInitialCurtain), previousId: actualInitialStaging.id, nextId: actualDialogue.id, type: INITIAL_CURTAIN })
        expect(actualDialogue).toEqual({ ...copy(actualDialogue), previousId: actualInitialCurtain.id, nextId: null, type: DIALOGUE })
        if (nextScene) {
            expect(actualNextScene).toEqual({ ...copy(nextScene), previousId: actualScene.id })
        }
    })


it.each([
    [1, scene4, scene3, mockCurrentScriptItems],
    [2, scene3, scene4, mockCurrentScriptItems],
    [3, scene5, scene3, mockCurrentScriptItems],
    [4, scene7, scene1, mockCurrentScriptItems],
    [5, scene1, scene7, mockCurrentScriptItems],
    [6, scene1, scene1, mockCurrentScriptItems],
])
    ('newScriptItemsForMoveScene', (scenario, movingScene, newPreviousScene, currentScriptItems) => {

        const debug = false;

        const oldPreviousScene = currentScriptItems[movingScene.previousId]
        const oldNextScene = currentScriptItems[movingScene.nextId]
        const newNextScene = currentScriptItems[newPreviousScene.nextId]

        const actualResult = newScriptItemsForMoveScene(movingScene, newPreviousScene.id, currentScriptItems)
        log(debug, 'newScriptItemsForMoveScene', { scenario, movingScene, actualResult });


        if (scenario === 1) {
            expect(actualResult.length).toEqual(0) //scene4 already below scene3
        }


        if ([2, 3].includes(scenario)) {
            expect(actualResult.length).toEqual(5)
            expect(actualResult[0]).toEqual({ ...copy(oldPreviousScene), nextId: movingScene.nextId })
            expect(actualResult[1]).toEqual({ ...copy(oldNextScene), previousId: movingScene.previousId })
            expect(actualResult[2]).toEqual({ ...copy(movingScene), previousId: newPreviousScene.id, nextId: newNextScene.id })
            expect(actualResult[3]).toEqual({ ...copy(newPreviousScene), nextId: movingScene.id })
            expect(actualResult[4]).toEqual({ ...copy(newNextScene), previousId: movingScene.id })
        }

        if (scenario === 4) { //moving scene with no next scene
            expect(actualResult.length).toEqual(4)
            expect(actualResult[0]).toEqual({ ...copy(oldPreviousScene), nextId: null })
            expect(actualResult[1]).toEqual({ ...copy(movingScene), previousId: newPreviousScene.id, nextId: newNextScene.id })
            expect(actualResult[2]).toEqual({ ...copy(newPreviousScene), nextId: movingScene.id })
            expect(actualResult[3]).toEqual({ ...copy(newNextScene), previousId: movingScene.id })
        }

        if (scenario === 5) { //moving to scene with no next scene
            expect(actualResult.length).toEqual(4)
            expect(actualResult[0]).toEqual({ ...copy(oldPreviousScene), nextId: movingScene.nextId })
            expect(actualResult[1]).toEqual({ ...copy(oldNextScene), previousId: movingScene.previousId })
            expect(actualResult[2]).toEqual({ ...copy(movingScene), previousId: newPreviousScene.id, nextId: null })
            expect(actualResult[3]).toEqual({ ...copy(newPreviousScene), nextId: movingScene.id })
        }

        if (scenario === 6) {
            expect(actualResult.length).toEqual(0)
        }

    })


it.each([
    [1, dialogue23, 'text Changed'],
    [2, dialogue23, null],
    [3, dialogue23, ''],
    [4, dialogue25, 'comment 2'] //end of script
])
    ('newScriptItemsForAddComment', (scenario, scriptItem, tempTextValue) => {
        const debug = false;

        const actualResult = newScriptItemsForAddComment(scriptItem, tempTextValue)

        log(debug, 'newScriptItemsForAddComment', actualResult)

        const actualComment = actualResult[0]
        const actualScriptItem = actualResult[1]

        expect(actualResult.length).toEqual(2)

        switch (scenario) {
            case 1: expect(actualScriptItem).toEqual({ ...copy(scriptItem), commentId: actualComment.id, text: 'text Changed' }); break;
            case 2: expect(actualScriptItem).toEqual({ ...copy(scriptItem), commentId: actualComment.id }); break;
            case 3: expect(actualScriptItem).toEqual({ ...copy(scriptItem), commentId: actualComment.id, text: '' }); break;
            case 4: expect(actualScriptItem).toEqual({ ...copy(scriptItem), commentId: actualComment.id, text: 'comment 2' }); break;
            default: break;
        }

        expect(actualComment).toEqual({ ...copy(actualComment), previousId: actualScriptItem.id, type: COMMENT });

    })

it.each([
    [comment23, mockCurrentScriptItems]
])
    ('newScriptItemsForDeleteComment', (comment, currentScriptItems) => {

        const scriptItem = dialogue23

        const debug = false;
        const actualResult = newScriptItemsForDeleteComment(comment, currentScriptItems)

        log(debug, 'newScriptItemsForDeleteComment', actualResult)

        const actualComment = actualResult[0]
        const actualScriptItem = actualResult[1]

        expect(actualResult.length).toEqual(2)

        expect(actualScriptItem).toEqual({ ...copy(scriptItem), commentId: null })
        expect(actualComment).toEqual({ ...copy(comment), isActive: false })

    });


it.each([
    [1, 'p1', 'p10', scene1, mockCurrentScriptItems],
    [2, 'p2', 'p10', scene1, mockCurrentScriptItems],
    [3, 'p3', 'p10', scene1, mockCurrentScriptItems],
    [4, 'p4', 'p10', scene1, mockCurrentScriptItems],
])('newScriptItemsForSwapPart', (scenario, partId, newPartId, scene, currentScriptItems) => {
    const debug = false;

    const currentSceneScriptItems = Object.values(currentScriptItems).filter(item => item.parentId === scene.id || item.id === scene.id)

    //log(debug,'input :', { scenario, partId, newPartId, currentSceneScriptItems })

    const actualResult = newScriptItemsForSwapPart(partId, newPartId, currentSceneScriptItems)

    log(debug, 'newScriptItemsForSwapPart', actualResult)

    if (scenario === 1) {
        expect(actualResult.length).toEqual(3)
        expect(actualResult[0]).toEqual({ ...copy(scene1), partIds: ['p10', 'p2', 'p3'] })
        expect(actualResult[1]).toEqual({ ...copy(dialogue11), partIds: ['p10'] })
        expect(actualResult[2]).toEqual({ ...copy(dialogue14), partIds: ['p10', 'p2', 'p3'] })
    }
    if (scenario === 2) {
        expect(actualResult.length).toEqual(3)
        expect(actualResult[0]).toEqual({ ...copy(scene1), partIds: ['p1', 'p10', 'p3'] })
        expect(actualResult[1]).toEqual({ ...copy(dialogue12), partIds: ['p10'] })
        expect(actualResult[2]).toEqual({ ...copy(dialogue14), partIds: ['p1', 'p10', 'p3'] })
    }
    if (scenario === 3) {
        expect(actualResult.length).toEqual(3)
        expect(actualResult[0]).toEqual({ ...copy(scene1), partIds: ['p1', 'p2', 'p10'] })
        expect(actualResult[1]).toEqual({ ...copy(dialogue13), partIds: ['p10'] })
        expect(actualResult[2]).toEqual({ ...copy(dialogue14), partIds: ['p1', 'p2', 'p10'] })
    }
    if (scenario === 4) { //part not in scene
        expect(actualResult.length).toEqual(0)
    }


})


xit.each([

])
    ('scriptItemUpdatesLaterThanCurrent', (scriptItemUpdates, currentScriptItems) => {


    }
    )

const copy = (object) => {

    return JSON.parse(JSON.stringify(object))

}