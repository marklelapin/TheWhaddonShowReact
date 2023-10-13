import { ScriptItemUpdate } from "dataAccess/localServerModels"; 
import { SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN, DIALOGUE } from "dataAccess/scriptItemTypes"; 
import { log } from "helper";
import { getLatest } from "dataAccess/localServerUtils";

export function createHeaderScriptItems(previousScene) {

    let scene = new ScriptItemUpdate(SCENE)
    let synopsis = new ScriptItemUpdate(SYNOPSIS)
    let initialStaging = new ScriptItemUpdate(INITIAL_STAGING)
    let initialCurtain = new ScriptItemUpdate(INITIAL_CURTAIN)

    let dialogue = new ScriptItemUpdate(DIALOGUE)

    scene.nextId = synopsis.id
    synopsis.nextId = initialStaging.id
    initialStaging.nextId = initialCurtain.id
    initialCurtain.nextId = dialogue.id

    scene.previousId = previousScene.id
    synopsis.previousId = scene.id
    initialStaging.previousId = synopsis.id
    initialCurtain.previousId = initialStaging.id
    dialogue.previousId = initialCurtain.id

}

//Sorts ScriptItems and also works out curtain opening as requires same linked list calculation.
export function sortScriptItems(head, scriptItems) {

    const debug = false

    log(debug, 'Sort Head: ', head)
    log(debug, 'Sort ScriptItems', scriptItems)

    if (scriptItems.length === 0) return [];

    let targetArray = [...scriptItems];


    //this calculates a new nextId for head to allow it to swap between different linked lists. e.g. a SCene is part ofthe Act linked list but also the head of the Scene linked list.
    const headNextId = targetArray.filter((item) => item.previousId === head.id)[0].id;
    targetArray = targetArray.map(item => item.id === head.id ? { ...item, nextId: headNextId } : item)


    //create objectMap of all items in the targetArray
    const idToObjectMap = {};

    for (const item of targetArray) {
        idToObjectMap[item.id] = item;
    }

    //Sort the targetArray by nextId
    const sortedLinkedList = [];
    let currentId = head.id
    let curtainOpen = false; //TODO need to be able to work out starting position of curtain from previous scene.
    let previousCurtainOpen;

    while (currentId !== null) {
        let currentItem = idToObjectMap[currentId];

        if (currentItem) {
            if (opensCurtain(currentItem)) { curtainOpen = true }
            if (closesCurtain(currentItem)) { curtainOpen = false }

            currentItem.previousCurtainOpen = previousCurtainOpen;
            currentItem.curtainOpen = curtainOpen;
            previousCurtainOpen = curtainOpen;

            sortedLinkedList.push(currentItem);
            currentId = currentItem.nextId;
        } else {
            currentId = null;
        }

    }


    return sortedLinkedList;
}

export function sortLatestScriptItems(head, scriptItems, undoDateTime) {

    const latestScriptItems = getLatest(scriptItems, undoDateTime);
    const sortedScriptItems = sortScriptItems(head, latestScriptItems);

    return sortedScriptItems;

}


const opensCurtain = (scriptItem) => {

    if (scriptItem.type === 'InitialCurtain' || scriptItem.type === 'Curtain') {
        return scriptItem.tags.includes('OpenCurtain')
    }

    return false
}

const closesCurtain = (scriptItem) => {

    if (scriptItem.type === 'InitialCurtain' || scriptItem.type === 'Curtain') {
        return scriptItem.tags.includes('CloseCurtain')
    }

    return false
}