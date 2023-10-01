import {v4 as uuidv4} from 'uuid'; 

// Identifies the types of LocalServerModel updates (works similarly to redux actions)
export const Person = 'Person';
export const ScriptItem = 'ScriptItem';
export const Part = 'Part'

export const Act = 'Act';
export const Scene = 'Scene';
export const Synopsis = 'Synopsis';
export const Staging = 'Staging';
export const Song = 'Song';
export const Dialogue = 'Dialogue';
export const Action = 'Action';
export const Sound = 'Sound';
export const Lighting = 'Lighting';
export const Curtain = 'Curtain';

export class LocalServerModel {
    constructor(type) {
        this.history = [];
        this.conflicts = [];
        this.type = type;
        this.sync = {
            isSyncing: false,
            error: null,
            lastSyncDate: null
        }
    }
}



export class LocalToServerSyncData {
    constructor(copyId, postBacks = null, updates = null) {
        this.copyId = copyId;
        this.postBacks = postBacks;
        this.updates = updates;
    }

}

export class ServerToLocalPostBack {
    constructor(id, created, updatedOnServer) {
        this.id = id
        this.created = created;
        this.updatedOnServer = updatedOnServer;
    }
}

export class LocalToServerPostBack {
    constructor(id, created, isConflicted) {
        this.id = id;
        this.created = created;
        this.isConflicted = isConflicted;
    }
}

export class LocalServerModelUpdate {
    constructor(id = null, created = null, updatedOnServer = null, createdBy = 'Mark Carter', isActive = true, isSample = false,isConflicted = false) {
        this.id = id || uuidv4();
        this.created = created || new Date();
        this.updatedOnServer = updatedOnServer;
        this.createdBy = createdBy;
        this.isActive = isActive;
        this.isSample = isSample;
        this.isConflicted = isConflicted;
    }

}


export class PersonUpdate extends LocalServerModelUpdate {
    constructor() {
        super();
        this.firstName = null;
        this.lastName = null;
        this.email = null;
        this.isActor = false;
        this.isSinger = false;
        this.isWriter = false;
        this.isBand = false;
        this.isTechnical = false;
        this.isAdmin = false;
        this.tags = [];
        this.isActive = true;
        this.pictureRef = null;
    }
}

export class ScriptItemUpdate extends LocalServerModelUpdate {

    constructor(type,text=null,partIds = [],tags =[]) {
        super();
        this.type = type;
        this.text = text;
        this.partIds = partIds;
        this.tags = tags;
        this.nextId = null;
        this.previousId = null;
        this.parentId = null;
        this.attachments = [];
    }

}


export class PartUpdate extends LocalServerModelUpdate {

    constructor() {
        super();
        this.name = null
        this.personId = null;
        this.tags = [];
    }

}



