

const READ = 'READ'
const WRITE = 'WRITE'

const DEMOID = '9bb95c7a-aa72-4e0c-b77d91f8f225e1e'

export const userAccessToComponent = (user = null, componentOrPage = null) => {

    if (user === null || componentOrPage === null) return null;
    if (user.isAdmin === true) return WRITE

    switch (componentOrPage) {
        case 'Home':
            return READ;
        case 'Users':
            return null;
        case 'Script':
            if (user.isWriter === true || user.id === DEMOID) return WRITE;
            return READ;
        case 'Casting':
            if (user.isWriter === true || user.id === DEMOID) return WRITE;
            return READ;
        case 'Gallery':
            return READ;
        case 'ApiTestResults':
            if (user.id === DEMOID) return READ;
            return null;
        case 'ApiMonitor':
            if (user.id === DEMOID) return READ;
            return null;
        case 'ApiDocumentation':
            if (user.id === DEMOID) return READ;
            return null;
        default:
            return null;
    }

}