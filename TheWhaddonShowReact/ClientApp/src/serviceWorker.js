import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing';
import {StaleWhileRevalidate} from 'workbox-strategies';
import {CacheFirst} from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import config from '../src/config.js';

import {
    pageCache,
    staticResourceCache,
    googleFontsCache,
    offlineFallback,
} from 'workbox-recipes';


pageCache();

googleFontsCache();

staticResourceCache();

offlineFallback();

clientsClaim();

self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)



const matchCallback = ({ request }) => request.destination === 'image';
registerRoute(
    matchCallback,
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 180 * 24 * 60 * 60,
            }),
        ],
    })
);


const fileControllerURL = config.baseURLApi + '/file/'
console.log('fileControllerURL', fileControllerURL)
registerRoute(
    ({ url }) => url.startsWith(fileControllerURL),
    new CacheFirst({
        cacheName: 'files',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);