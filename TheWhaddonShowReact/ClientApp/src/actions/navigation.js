export const OPEN_STATIC_SIDEBAR = 'OPEN_STATIC_SIDEBAR';
export const CLOSE_STATIC_SIDEBAR = 'CLOSE_STATIC_SIDEBAR';
export const OPEN_SIDEBAR = 'OPEN_SIDEBAR';
export const CLOSE_SIDEBAR = 'CLOSE_SIDEBAR';


export function openStaticSidebar() {
    return {
        type: OPEN_STATIC_SIDEBAR,
    };
}
export function closeStaticSidebar() {
return {
        type: CLOSE_STATIC_SIDEBAR,
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


export function changeActiveSidebarItem(activeItem) {
    return {
        type: CHANGE_ACTIVE_SIDEBAR_ITEM,
        activeItem,
    };
}

