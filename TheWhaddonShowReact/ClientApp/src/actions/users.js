

const USER_MODAL_ON = 'USER_MODAL_ON';
const USER_MODAL_OFF = 'USER_MODAL_OFF';

export const userModalOn = () => {
    return {
        type: USER_MODAL_ON,
    }
}

export const userModalOff = () => {
    return {
        type: USER_MODAL_OFF
    }
}

