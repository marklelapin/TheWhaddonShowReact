import { SCRIPT_ITEM } from "./localServerModels";

export const SHOW = 'Show';
export const ACT = 'Act';
export const SCENE = 'Scene';
export const SYNOPSIS = 'Synopsis';
export const STAGING = 'Staging';
export const INITIAL_STAGING = 'InitialStaging';
export const SONG = 'Song';
export const DIALOGUE = 'Dialogue';
export const ACTION = 'Action';
export const SOUND = 'Sound';
export const LIGHTING = 'Lighting';
export const CURTAIN = 'Curtain';
export const INITIAL_CURTAIN = 'InitialCurtain';
export const COMMENT = 'Comment';

export const HEADER_TYPES = [SHOW, ACT, SCENE, SYNOPSIS, INITIAL_STAGING, INITIAL_CURTAIN]

export const CURTAIN_TYPES = [CURTAIN, INITIAL_CURTAIN]

export const SCRIPT_ITEM_TYPES = [SHOW, ACT, SCENE, SYNOPSIS, STAGING, INITIAL_STAGING, SONG, DIALOGUE, ACTION, SOUND, LIGHTING, CURTAIN, INITIAL_CURTAIN, COMMENT]

export const OPEN_CURTAIN = 'OpenCurtain'
export const CLOSE_CURTAIN = 'CloseCurtain'