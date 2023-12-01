
import { OPEN_CURTAIN, SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, DIALOGUE, HEADER_TYPES, INITIAL_CURTAIN, COMMENT } from "../../../dataAccess/scriptItemTypes";

const createdDate = new Date('2023-12-01T00:00:00.000')

//MOCK SCENES
export const show = { id: 'show', created: createdDate, text: 'Show 1', nextId: 'act1', previousId: 'act2' }
export const act1 = { id: 'a1', created: createdDate, text: 'Act 1', nextId: 's1', previousId: 'show' }
export const scene1 = { id: 's1', created: createdDate, type: SCENE, text: 'Scene 1', nextId: 's2', previousId: 'a1', partIds: ['p1', 'p2', 'p3'] }
export const scene2 = { id: 's2', created: createdDate, type: SCENE, text: 'Scene 2', nextId: 's3', previousId: 's1', partIds: ['p4', 'p5', 'p6'] }
export const scene3 = { id: 's3', created: createdDate, type: SCENE, text: 'Scene 3', nextId: 's4', previousId: 's2', partIds: ['p4'] }
export const scene4 = { id: 's4', created: createdDate, type: SCENE, text: 'Scene 4', nextId: 's5', previousId: 's3', partIds: ['p5'] }
export const scene5 = { id: 's5', created: createdDate, type: SCENE, text: 'Scene 5', nextId: 's6', previousId: 's4', partIds: ['p6'] }
export const act2 = { id: 'a2', created: createdDate, text: 'Act 2', nextId: 's6', previousId: 's5' }
export const scene6 = { id: 's6', created: createdDate, type: SCENE, text: 'Scene 6', nextId: 's7', previousId: 'a2', partIds: ['p1', 'p4'] }
export const scene7 = { id: 's7', created: createdDate, type: SCENE, text: 'Scene 7', nextId: null, previousId: 's6', partIds: ['p7', 'p8', 'p9'] }

//MOCK PARTS
export const part1 = { id: 'p1', created: createdDate, name: 'Part 1', tags: ['red', 'orange'], personId: null }
export const part2 = { id: 'p2', created: createdDate, name: 'Part 2', tags: ['red', 'orange'], personId: null }
export const part3 = { id: 'p3', created: createdDate, name: '', tags: [], personId: null }
export const part4 = { id: 'p4', created: createdDate, name: 'Part 4', tags: ['blue', 'cyan'], personId: null }
export const part5 = { id: 'p5', created: createdDate, name: 'Part 5', tags: ['blue', 'cyan'], personId: null }
export const part6 = { id: 'p6', created: createdDate, name: '', tags: [], personId: null }
export const part7 = { id: 'p7', created: createdDate, name: 'Part 7', tags: ['green', 'emerald'], personId: null }
export const part8 = { id: 'p8', created: createdDate, name: 'Part 8', tags: ['green', 'emerald'], personId: null }
export const part9 = { id: 'p9', created: createdDate, name: '', tags: [], personId: null }



//MOCK SCRIPT ITEMS
export const synopsis1 = { id: 'si1s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 1', nextId: 'si1is', previousId: 's1', partIds: [] }
export const initialStage1 = { id: 'si1is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 1', nextId: 'si1ic', previousId: 'si1s', partIds: [] }
export const initialCurtain1 = { id: 'si1ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 1', nextId: 'si11', previousId: 'si2is', partIds: [] }
export const Dialogue11 = { id: 'si11', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:1', nextId: 'si12', previousId: 'si1ic', partIds: [] }
export const Dialogue12 = { id: 'si12', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:2', nextId: 'si13', previousId: 'si11', partIds: [] }
export const Dialogue13 = { id: 'si13', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:3', nextId: 'si14', previousId: 'si12', partIds: [] }
export const Dialogue14 = { id: 'si14', created: createdDate, type: DIALOGUE, text: 'Dialogue 1:4', nextId: null, previousId: 'si13', partIds: [] }

export const synopsis2 = { id: 'si2s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 2', nextId: 'si2ic', previousId: 's2', partIds: [] }
export const initialStage2 = { id: 'si2is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 2', nextId: 'si2ic', previousId: 'si2s', partIds: [] }
export const initialCurtain2 = { id: 'si2ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 2', nextId: 'si21', previousId: 'si2is', partIds: [] }
export const Dialogue21 = { id: 'si21', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:1', nextId: 'si22', previousId: 'si2ic', partIds: [] }
export const Dialogue22 = { id: 'si22', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:2', nextId: 'si23', previousId: 'si21', partIds: [] }
export const Dialogue23 = { id: 'si23', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:3', nextId: 'si24', previousId: 'si22', partIds: [] }
export const Dialogue24 = { id: 'si24', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:4', nextId: 'si25', previousId: 'si23', partIds: [] }
export const Dialogue25 = { id: 'si25', created: createdDate, type: DIALOGUE, text: 'Dialogue 2:5', nextId: null, previousId: 'si24', partIds: [] }

export const synopsis7 = { id: 'si7s', created: createdDate, type: SYNOPSIS, text: 'Synopsis 7', nextId: 'si7is', previousId: 's7', partIds: [] }
export const initialStage7 = { id: 'si7is', created: createdDate, type: INITIAL_STAGING, text: 'Initial Stage 7', nextId: 'si7ic', previousId: 'si7s', partIds: [] }
export const initialCurtain7 = { id: 'si7ic', created: createdDate, type: INITIAL_CURTAIN, text: 'Initial Curtain 7', nextId: 'si71', previousId: 'si7is', partIds: [] }
export const Dialogue71 = { id: 'si71', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:1', nextId: 'si72', previousId: 'si7ic', partIds: [] }
export const Dialogue72 = { id: 'si72', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:2', nextId: 'si73', previousId: 'si71', partIds: [] }
export const Dialogue73 = { id: 'si73', created: createdDate, type: DIALOGUE, text: 'Dialogue 7:3', nextId: null, previousId: 'si72', partIds: [] }




export const mockCurrentScriptItems = {

    'show': show,
    'act1': act1,
    's1': scene1,
    's2': scene2,
    's3': scene3,
    's4': scene4,
    's5': scene5,
    'a2': act2,
    's6': scene6,
    's7': scene7,
    'si1s': synopsis1,
    'si2is': initialStage1,
    'si3ic': initialCurtain1,
    'si11': Dialogue11,
    'si12': Dialogue12,
    'si13': Dialogue13,
    'si14': Dialogue14,
    'si2b': synopsis2,
    'si2c': initialStage2,
    'si2d': initialCurtain2,
    'si21': Dialogue21,
    'si22': Dialogue22,
    'si23': Dialogue23,
    'si24': Dialogue24,
    'si25': Dialogue25,
    'si7s': synopsis7,
    'si7is': initialStage7,
    'si7ic': initialCurtain7,
    'si71': Dialogue71,
    'si72': Dialogue72,
    'si73': Dialogue73,
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
    'p9': part9
}


export const mockSceneOrders = {
    'show': [show, act1, scene1, scene2, scene3, scene4, scene5, act2, scene6, scene7],
    's1': [synopsis1, initialStage1, initialCurtain1, Dialogue11, Dialogue12, Dialogue13, Dialogue14],
    's2': [synopsis2, initialStage2, initialCurtain2, Dialogue21, Dialogue22, Dialogue23, Dialogue24, Dialogue25],
    's3': [],
    's4': [],
    's5': [],
    's6': [],
    's7': [synopsis7, initialStage7, initialCurtain7, Dialogue71, Dialogue72, Dialogue73]
}

it('mockData', () => {
    expect(true).toEqual(true);
});