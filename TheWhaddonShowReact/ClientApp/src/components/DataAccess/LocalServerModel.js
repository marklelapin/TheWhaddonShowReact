import {v4 as uuidv4} from 'uuid'; 

export class LocalToServerSyncData {
    constructor(copyId, postBacks = null, updates = null) {
        this.copyId = copyId;
        this.postBacks = postBacks;
        this.updates = updates;

    }

}

export class ServerToLocalPostBack {
    constructor(id , created , updatedOnServer ) {
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
    constructor(id = null, created = null, updatedOnServer = null, createdBy = null, isActive = true, isSample = false) {
        this.id = id ?? new uuidv4();
        this.created = created ?? new Date();
        this.updatedOnServer = updatedOnServer;
        this.createdBy = createdBy;
        this.isActive = isActive;
        this.isSample = isSample;
    }
}