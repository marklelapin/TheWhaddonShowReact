
import { PERSON } from "../../../dataAccess/localServerModels";
import { OPEN_CURTAIN, CLOSE_CURTAIN, SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, DIALOGUE, HEADER_TYPES, INITIAL_CURTAIN, CURTAIN, COMMENT } from "../../../dataAccess/scriptItemTypes";

export  const createdDate = new Date('2023-12-01T00:00:00.000')
export const laterCreatedDate = new Date('2023-12-01T00:01:00.000')
export const muchLaterCreatedDate = new Date('2023-12-01T00:02:00.000')
export const earlierCreatedDate = new Date('2023-11-30T00:00:00.000')
//Mock Persons
export const personA = Object.freeze({ id: 'peA', created: createdDate, firstName: 'Albert', lastName: 'A', pictureRef: 'pictures/peA', isActive: true, updatedOnServer: null })
export const personB = Object.freeze({ id: 'peB', created: createdDate, firstName: 'Bob', lastName: 'B', pictureRef: 'pictures/peB', isActive: true, updatedOnServer: null })
export const personC = Object.freeze({ id: 'peC', created: createdDate, firstName: 'Carol', lastName: 'C', pictureRef: null, isActive: true, updatedOnServer: null })
//MOCK SCENES
export const show = Object.freeze({ id: 'show', created: createdDate, type: SHOW, text: 'Show 1', nextId: 'a1', previousId: null, partIds: [], isActive: true, updatedOnServer: null ,parentId: 'show' })
export const act1 = Object.freeze({ id: 'a1', created: createdDate, type: ACT, text: 'Act 1', nextId: 's1', previousId: 'show', partIds: [], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene1 = Object.freeze({ id: 's1', created: createdDate, type: SCENE, text: 'Scene 1', nextId: 's2', previousId: 'a1', partIds: ['p1', 'p2', 'p3'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene2 = Object.freeze({ id: 's2', created: createdDate, type: SCENE, text: 'Scene 2', nextId: 's3', previousId: 's1', partIds: ['p4', 'p5', 'p6'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene3 = Object.freeze({ id: 's3', created: createdDate, type: SCENE, text: 'Scene 3', nextId: 's4', previousId: 's2', partIds: ['p4', 'p5', 'p13'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene4 = Object.freeze({ id: 's4', created: createdDate, type: SCENE, text: 'Scene 4', nextId: 's5', previousId: 's3', partIds: ['p4'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene5 = Object.freeze({ id: 's5', created: createdDate, type: SCENE, text: 'Scene 5', nextId: 'a2', previousId: 's4', partIds: ['p4'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const act2 = Object.freeze({ id: 'a2', created: createdDate, text: 'Act 2', nextId: 's6', previousId: 's5', partIds: [], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene6 = Object.freeze({ id: 's6', created: createdDate, type: SCENE, text: 'Scene 6', nextId: 's7', previousId: 'a2', partIds: ['p1', 'p4'], isActive: true, updatedOnServer: null, parentId: 'show' })
export const scene7 = Object.freeze({ id: 's7', created: createdDate, type: SCENE, text: 'Scene 7', nextId: null, previousId: 's6', partIds: ['p7', 'p8', 'p9'], isActive: true, updatedOnServer: null, parentId: 'show' })




//MOCK PARTS
export const part1 = Object.freeze({ id: 'p1', created: createdDate, name: 'Part 1', tags: ['red', 'orange'], personId: 'peA', isActive: true, updatedOnServer: null })
export const part2 = Object.freeze({ id: 'p2', created: createdDate, name: 'Part 2', tags: ['red', 'orange'], personId: null, isActive: true, updatedOnServer: null })
export const part3 = Object.freeze({ id: 'p3', created: createdDate, name: 'Part 3', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const part4 = Object.freeze({ id: 'p4', created: createdDate, name: 'Part 4', tags: ['blue', 'cyan'], personId: personA.id, isActive: true, updatedOnServer: null })
export const part5 = Object.freeze({ id: 'p5', created: createdDate, name: 'Part 5', tags: ['blue', 'cyan'], personId: personB.id, isActive: true, updatedOnServer: null })
export const part6 = Object.freeze({ id: 'p6', created: createdDate, name: 'Part 6', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const part7 = Object.freeze({ id: 'p7', created: createdDate, name: 'Part 7', tags: ['green', 'emerald'], personId: null, isActive: true, updatedOnServer: null })
export const part8 = Object.freeze({ id: 'p8', created: createdDate, name: 'Part 8', tags: ['green', 'emerald'], personId: null, isActive: true, updatedOnServer: null })
export const part9 = Object.freeze({ id: 'p9', created: createdDate, name: 'Part 9', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const part10 = Object.freeze({ id: 'p10', created: createdDate, name: 'SwapPart', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const part13 = Object.freeze({ id: 'p13', created: createdDate, name: 'DeletePart', tags: [], personId: null, isActive: true, updatedOnServer: null })

export const partFromServer = Object.freeze({ id: 'pfs', created: laterCreatedDate, name: 'PartFromServer', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const partFromServerWithPerson = Object.freeze({ id: 'pfs', created: laterCreatedDate, name: 'PartFromServerWithPerson', tags: [], personId: 'peB', isActive: true, updatedOnServer: null })
export const newPart1FromServer = Object.freeze({ id: 'p1', created: laterCreatedDate, name: 'NewPart1FromServer', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const earlierPart1FromServer = Object.freeze({ id: 'p1', created: earlierCreatedDate, name: 'EarlierPart1FromServer', tags: [], personId: null, isActive: true, updatedOnServer: null })
export const newInactivePart1FromServer = Object.freeze({ id: 'p1', created: laterCreatedDate, name: 'NewInactivePart1FromServer', tags: [], personId: null, isActive: false, updatedOnServer: null })

//MOCK SCRIPT ITEMS
export const synopsis1 = Object.freeze({ id: 'si1s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 1', nextId: 'si1is', previousId: 's1', partIds: [], parentId: 's1', isActive: true, updatedOnServer: null })
export const initialStaging1 = Object.freeze({ id: 'si1is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 1', nextId: 'si1ic', previousId: 'si1s', partIds: [], parentId: 's1', isActive: true, updatedOnServer: null })
export const initialCurtain1 = Object.freeze({ id: 'si1ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 1', tags: [OPEN_CURTAIN], nextId: 'si11', previousId: 'si2is', partIds: [], parentId: 's1', isActive: true, updatedOnServer: null, tags: [OPEN_CURTAIN] })
export const dialogue11 = Object.freeze({ id: 'si11', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:1', nextId: 'si12', previousId: 'si1ic', partIds: ['p1'], parentId: 's1', isActive: true, updatedOnServer: null, tags: ['blue', 'green'] })
export const dialogue12 = Object.freeze({ id: 'si12', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:2', nextId: 'si13', previousId: 'si11', partIds: ['p2'], parentId: 's1', isActive: true, updatedOnServer: null })
export const dialogue13 = Object.freeze({ id: 'si13', created: createdDate, type: CURTAIN, text: 'Dialogue 1:3', nextId: 'si14', previousId: 'si12', partIds: ['p3'], parentId: 's1', isActive: true, updatedOnServer: null, tags: [CLOSE_CURTAIN] })
export const dialogue14 = Object.freeze({ id: 'si14', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:4', nextId: null, previousId: 'si13', partIds: ['p1', 'p2', 'p3'], parentId: 's1', isActive: true, updatedOnServer: null, tags: [] })

export const synopsis2 = Object.freeze({ id: 'si2s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 2', nextId: 'si2is', previousId: 's2', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null })
export const initialStaging2 = Object.freeze({ id: 'si2is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 2', nextId: 'si2ic', previousId: 'si2s', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null })
export const initialCurtain2 = Object.freeze({ id: 'si2ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 2', tags: [OPEN_CURTAIN], nextId: 'si21', previousId: 'si2is', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null })
export const dialogue21 = Object.freeze({ id: 'si21', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:1', nextId: 'si22', previousId: 'si2ic', partIds: ['p4'], parentId: 's2', isActive: true, updatedOnServer: null })
export const dialogue22 = Object.freeze({ id: 'si22', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:2', nextId: 'si23', previousId: 'si21', partIds: ['p5'], parentId: 's2', isActive: true, updatedOnServer: null })
export const dialogue23 = Object.freeze({ id: 'si23', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: ['p6'], parentId: 's2', isActive: true, updatedOnServer: null })
export const dialogue24 = Object.freeze({ id: 'si24', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:4', nextId: 'si25', previousId: 'si23', partIds: ['p4', 'p5'], parentId: 's2', isActive: true, updatedOnServer: null })
export const dialogue25 = Object.freeze({ id: 'si25', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: ['p4', 'p5', 'p6'], parentId: 's2', isActive: true, updatedOnServer: null })

export const removePart6FromScene2 = [
    Object.freeze({ id: 'si23', created: laterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null }),
    Object.freeze({ id: 'si25', created: laterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: ['p4', 'p5'], parentId: 's2', isActive: true, updatedOnServer: null })
]

export const removePart6FromScene2EarlierDate = [
    Object.freeze({ id: 'si23', created: earlierCreatedDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null }),
    Object.freeze({ id: 'si25', created: earlierCreatedDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: ['p4', 'p5'], parentId: 's2', isActive: true, updatedOnServer: null })
]


export const removePart6FromScene2MixedCreatedDates = [
    Object.freeze({ id: 'si23', created: laterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null }),
    Object.freeze({ id: 'si25', created: earlierCreatedDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: ['p4', 'p5'], parentId: 's2', isActive: true, updatedOnServer: null })
]

export const removePart6FromScene2MultipleCreatedDates = [
    Object.freeze({ id: 'si23', created: muchLaterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null }),
    Object.freeze({ id: 'si23', created: laterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [], parentId: 's2', isActive: true, updatedOnServer: null }),
    Object.freeze({ id: 'si25', created: laterCreatedDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: ['p4', 'p5'], parentId: 's2', isActive: true, updatedOnServer: null })
]

export const synopsis3 = Object.freeze({ id: 'si3s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 3', nextId: 'si3is', previousId: 's3', partIds: [], parentId: 's3', isActive: true, updatedOnServer: null })
export const initialStaging3 = Object.freeze({ id: 'si3is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 3', nextId: 'si3ic', previousId: 'si3s', partIds: [], parentId: 's3', isActive: true, updatedOnServer: null })
export const initialCurtain3 = Object.freeze({ id: 'si3ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 3', tags: [CLOSE_CURTAIN], nextId: 'si31', previousId: 'si3is', partIds: [], parentId: 's3', isActive: true, updatedOnServer: null })
export const dialogue31 = Object.freeze({ id: 'si31', created: createdDate, type: DIALOGUE, text: 'Dialogue 3:1', nextId: 'si32', previousId: 'si3ic', partIds: ['p4'], parentId: 's3', isActive: true, updatedOnServer: null })
export const dialogue32 = Object.freeze({ id: 'si32', created: createdDate, type: DIALOGUE, text: 'Dialogue 3:2', nextId: 'si33', previousId: 'si31', partIds: [], parentId: 's3', isActive: true, updatedOnServer: null })
export const dialogue33 = Object.freeze({ id: 'si33', created: createdDate, type: DIALOGUE, text: 'Dialogue 3:3', nextId: 'si34', previousId: 'si32', partIds: ['p4'], parentId: 's3', isActive: true, updatedOnServer: null })
export const dialogue34 = Object.freeze({ id: 'si34', created: createdDate, type: DIALOGUE, text: 'Dialogue 3:4', nextId: null, previousId: 'si33', partIds: ['p4'], parentId: 's3', isActive: true, updatedOnServer: null })





export const comment23 = Object.freeze({ id: 'si23c', created: createdDate, type: COMMENT, text: 'Comment 23', nextId: null, previousId: 'si23', partIds: [], isActive: true, updatedOnServer: null })
export const comment25 = Object.freeze({ id: 'si25c', created: createdDate, type: COMMENT, text: 'Comment 25', nextId: null, previousId: 'si25', partIds: [], isActive: true, updatedOnServer: null })

export const synopsis7 = Object.freeze({ id: 'si7s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 7', nextId: 'si7is', previousId: 's7', partIds: [], parentId: 's7', isActive: true, updatedOnServer: null })
export const initialStaging7 = Object.freeze({ id: 'si7is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 7', nextId: 'si7ic', previousId: 'si7s', partIds: [], parentId: 's7', isActive: true, updatedOnServer: null })
export const initialCurtain7 = Object.freeze({ id: 'si7ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 7', nextId: 'si71', previousId: 'si7is', partIds: [], parentId: 's7', isActive: true, updatedOnServer: null })
export const dialogue71 = Object.freeze({ id: 'si71', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:1', nextId: 'si72', previousId: 'si7ic', partIds: ['p7'], parentId: 's7', isActive: true, updatedOnServer: null })
export const dialogue72 = Object.freeze({ id: 'si72', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:2', nextId: 'si73', previousId: 'si71', partIds: ['p8'], parentId: 's7', isActive: true, updatedOnServer: null })
export const dialogue73 = Object.freeze({ id: 'si73', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:3', nextId: null, previousId: 'si72', partIds: ['p9'], parentId: 's7', isActive: true, updatedOnServer: null })




export const mockStoredPersons = [personA, personB, personC]



export const mockCurrentScriptItems = {

    'show': show,
    'a1': act1,
    's1': scene1,
    's2': scene2,
    's3': scene3,
    's4': scene4,
    's5': scene5,
    'a2': act2,
    's6': scene6,
    's7': scene7,
    'si1s': synopsis1,
    'si1is': initialStaging1,
    'si1ic': initialCurtain1,
    'si11': dialogue11,
    'si12': dialogue12,
    'si13': dialogue13,
    'si14': dialogue14,
    'si2s': synopsis2,
    'si2is': initialStaging2,
    'si2ic': initialCurtain2,
    'si21': dialogue21,
    'si22': dialogue22,
    'si23': dialogue23,
    'si24': dialogue24,
    'si25': dialogue25,
    'si3s': synopsis3,
    'si3is': initialStaging3,
    'si3ic': initialCurtain3,
    'si31': dialogue31,
    'si32': dialogue32,
    'si33': dialogue33,
    'si34': dialogue34,
    'si7s': synopsis7,
    'si7is': initialStaging7,
    'si7ic': initialCurtain7,
    'si71': dialogue71,
    'si72': dialogue72,
    'si73': dialogue73,
}

export const mockCurrentPartPersons = {
    'p1': part1,
    'p2': part2,
    'p3': part3,
    'p4': part4,
    'p5': part5,
    'p6': part6,
    'p7': part7,
    'p8': part8,
    'p9': part9,
    'p13': part13
}


export const mockSceneOrders = {
    'show': [show, act1, scene1, scene2, scene3, scene4, scene5, act2, scene6, scene7],
    's1': [{ ...scene1, nextSceneId: scene2.id }, synopsis1, initialStaging1, initialCurtain1, dialogue11, dialogue12, dialogue13, dialogue14],
    's2': [{ ...scene2, nextSceneId: scene3.id }, synopsis2, initialStaging2, initialCurtain2, dialogue21, dialogue22, dialogue23, dialogue24, dialogue25],
    's3': [{ ...scene3, nextSceneId: scene4.id }, synopsis3, initialStaging3, initialCurtain3, dialogue31, dialogue32, dialogue33, dialogue34],
    //'s4': [],
    //'s5': [],
    //'s6': [],
    's7': [scene7, synopsis7, initialStaging7, initialCurtain7, dialogue71, dialogue72, dialogue73]
}

export const mockPreviousCurtainOpen = {
    'show': false,
    'a1': false,
    's1': false,
    's2': true,
    's3': true,
    's4': false,
    's5': false,
    'a2': false,
    's6': false,
    's7': false,
    '0': false
}

export const mockZIndexSceneOrders = {
    'noExistingZIndexes': [scene1, synopsis1, initialStaging1, initialCurtain1, dialogue11, dialogue12, dialogue13, dialogue14],
    'someExistingZIndexes': [{ ...scene2, zIndex: 1000000 }, { ...synopsis2, zIndex: 900000 }, initialStaging2, { ...initialCurtain2, zIndex: 800000 }, { ...dialogue21, zIndex: 300000 }, dialogue22, { ...dialogue23, zIndex: 25000 }, dialogue24, dialogue25],
    'closeExistingZindexes': [{ ...scene3, zIndex: 1000000 }, synopsis3, { initialStaging3, zIndex: 999999 }, initialCurtain3, dialogue31, dialogue32, dialogue33, dialogue34],
    'messedUpZIndexes': [scene1, { synopsis1, zindex: 2500 }, initialStaging1, { initialCurtain1, zIndex: 30000 }, dialogue11, dialogue12, { ...dialogue13, zIndex: 99999 }, dialogue14]
}
it('mockData', () => {
    expect(true).toEqual(true);
});