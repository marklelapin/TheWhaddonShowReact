import { clientsClaim } from 'workbox-core'
import { precacheAndRoute,createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute} from 'workbox-routing';
/*import {StaleWhileRevalidate} from 'workbox-strategies';*/
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import config from '../src/config.js';

import {

    staticResourceCache,
    googleFontsCache,
    offlineFallback,
} from 'workbox-recipes';


googleFontsCache();

staticResourceCache();

offlineFallback();

clientsClaim();

self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
    new NavigationRoute(
        createHandlerBoundToURL('/index.html'), {
        }
    )
)


const fileControllerURL = config.baseURLApi + '/file'
registerRoute(
    ({ url }) => {
        return url.href.startsWith(fileControllerURL)
    },
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


