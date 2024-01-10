export const TOGGLE_STATIC_SIDEBAR = 'TOGGLE_STATIC_SIDEBAR';
export const OPEN_SIDEBAR = 'OPEN_SIDEBAR';
export const CLOSE_SIDEBAR = 'CLOSE_SIDEBAR';
export const CLOSE_SIDEBAR_AND_TOGGLE_STATIC = 'CLOSE_SIDEBAR_AND_TOGGLE_STATIC';
export const CHANGE_ACTIVE_SIDEBAR_ITEM = 'CHANGE_ACTIVE_SIDEBAR_ITEM';


export function toggleStaticSidebar() {
    return {
        type: TOGGLE_STATIC_SIDEBAR,
    };
}

export function openSidebar() {
    return {
        type: OPEN_SIDEBAR,
    };
}

export function closeSidebar() {
    return {
        type: CLOSE_SIDEBAR,
    };
}

export function closeSidebarAndToggleStatic() {
    return {
        type: CLOSE_SIDEBAR_AND_TOGGLE_STATIC,
    };
}

export function changeActiveSidebarItem(activeItem) {
    return {
        type: CHANGE_ACTIVE_SIDEBAR_ITEM,
        activeItem,
    };
}

