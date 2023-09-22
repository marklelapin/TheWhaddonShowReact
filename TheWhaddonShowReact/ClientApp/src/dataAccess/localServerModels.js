import {v4 as uuidv4} from 'uuid'; 

// Identifies the types of LocalServerModel updates (works similarly to redux actions)
export const Person = 'Person';
export const ScriptItem = 'ScriptItem';
export const Part = 'Part'


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




