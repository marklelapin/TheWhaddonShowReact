const config = {
    name: 'sing',
    title: 'Sing Dashboard App built with React JS by Flatlogic',
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

export function screenSize() {
    const screenPx = window.innerWidth;

    let screenSize = 'xl';
    Object.values(config.settings.screenMaxs).forEach(screenMax => {

        if (screenPx <= screenMax) {
            screenSize = Object.keys(config.settings.screenMaxs).find(key => config.settings.screenMaxs[key] === screenMax)
        }
    })
    return screenSize;
}