/**
 * Defining the cache name provides control over the version of files cached.
 * Incrementing the version number will trigger the browser to start the install
 * event and cache the new files when the Service Worker next starts.
 */
var CACHE_NAME = 'nurse-notes-v2';

/**
 * urlsToCache is an array containing all the URLs you want to cache.
 * Include all the assets required for your application to work offline.
 */
var urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

/**
 * The 'install' event is the first event a service worker gets, and it only happens once.
 * A good place to cache static assets.
 */
self.addEventListener('install', function(event) {
    // event.waitUntil extends the lifetime of the install event until the passed promise resolves successfully.
    event.waitUntil(
        // caches.open opens a cache by name, returning a promise for a Cache object.
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                // cache.addAll takes a list of URLs, retrieves them, and adds the resulting response objects to the given cache.
                return cache.addAll(urlsToCache);
            })
    );
});

/**
 * The 'fetch' event is fired every time a network request is made.
 * This is where we intercept requests and serve the corresponding response from the cache.
 */
self.addEventListener('fetch', function(event) {
    event.respondWith(
        // Attempt to find a match for the request in the cache.
        caches.match(event.request)
            .then(function(response) {
                // If a match is found in the cache, return it.
                if (response) {
                    return response;
                }
                // Otherwise, fetch the resource from the network.
                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response (not a opaque response from a different origin).
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // To cache the new file, we clone the response. The reason for this is that
                        // the response is a stream and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need to clone it so we have two streams.
                        var responseToCache = response.clone();

                        // Open the cache again and put the fetched response into it.
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

/**
 * The 'activate' event is a good place to clean up old caches to manage storage efficiently.
 */
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME]; // Array containing names of caches to keep.

    event.waitUntil(
        // caches.keys() returns a promise that resolves to an array of cache names.
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                // Map over all cache names and delete those not in cacheWhitelist.
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
