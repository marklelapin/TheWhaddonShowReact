import { Workbox } from 'workbox-window'

export default function registerServiceWorker() {
    if (process.env.NODE_ENV !== 'production') return;

    console.log('registering service worker')
    if (!('serviceWorker' in navigator)) {
        console.log('service worker not available in users browser'); return
    }

    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', event => {
        if (event.isUpdate) {
            //replace with button on header
            if (confirm('New app update is available, CLick Ok to refresh')) {
                window.location.reload();
            }
        }
    })

    wb.register();
    console.log('server worker registered')
}