const config = {
    name: 'The Whaddon Show App',
    title: 'The Whaddon Show App by Mark Carter',
    version: '3.8.0',
    settings: {
        screenMaxs: {
            'xs': 543,
            'sm': 767,
            'md': 991,
            'lg': 1199,

        },
        screenMins: {
            'sm': 544,
            'md': 768,
            'lg': 992,
            'xl': 1200,
        },
        navCollapseTimeout: 2500,
    },
};

export function isScreen(size) {
    const screenPx = window.innerWidth;
    return (screenPx >= config.settings.screenMins[`${size}`] || size === 'xs')
        && (screenPx <= config.settings.screenMaxs[`${size}`] || size === 'xl');
}

export function isScreenSmallerThan(size) {
    const screenPx = window.innerWidth;
    const maxPx = config.settings.screenMaxs[`${size}`];

    return screenPx <= maxPx;
}

export function isScreenLargerThan(size) {
    const screenPx = window.innerWidth;
    const minPx = config.settings.screenMins[`${size}`];

    return screenPx >= minPx;
}

//export function screenSize() { //Not working
//    const screenPx = window.innerWidth;

//    let screenSize = 'xl';
//    Object.values(config.settings.screenMaxs).forEach(screenMax => {

//        if (screenPx <= screenMax) {
//            screenSize = Object.keys(config.settings.screenMaxs).find(key => config.settings.screenMaxs[key] === screenMax)
//        }
//    })
//    return screenSize;
//}

export const isMouseAvailable = () => {
    return !('ontouchstart' in window) && (navigator.maxTouchPoints <= 0 || navigator.msMaxTouchPoints <= 0);
}

export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.matchMedia("(max-width: 767px)").matches && window.matchMedia("(orientation: portrait)").matches);
}

export const addDeviceInfo = (object) => {
    const device = getDeviceInfo()
    return { ...object, device }
}

export const getDeviceInfo = () => {

    return {

        isMouseAvailable: isMouseAvailable(),
        isMobileDevice: isMobileDevice(),
        screenWidth: window.innerWidth,
    }
}

export const getSidebarWrapStatus = (isStatic, isOpen, isModal) => {
    if (isModal) return 'sidebarNone'
    if (isStatic) return 'sidebarStatic'
    if (isOpen) return 'sidebarOpen'
    return 'sidebarClose'
}


export const preventRefresh = (e) => {
    if (e.touches.length > 1) return; // Ignore multi-touch gestures
    const touch = e.touches[0];

    // Check if the swipe is at the top of the page
    if (touch.clientY <= 10) {
        e.preventDefault();
    }
};