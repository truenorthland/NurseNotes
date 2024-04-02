// Define a cache name for easy versioning and updates
var CACHE_NAME = 'nurse-notes-v1';

// Specify the list of assets you want to cache.
// Add more resources here as your app grows.
var urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// The 'install' event is fired when the service worker is installed.
// Use this event to cache all static assets.
self.addEventListener('install', function(event) {
    // Perform install steps: caching static assets
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// The 'fetch' event is fired for every network request made by your app.
// Use this event to serve your cached assets when offline.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return the response from the cached version
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and can only be consumed once.
                // Since we are consuming this once by cache and once by the browser for fetch, we need to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response. Only cache the response if it's from our origin and not an opaque response.
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need to clone it so we have two streams.
                        var responseToCache = response.clone();

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

// The 'activate' event is a good place to clean up old caches.
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME]; // List of cache names to keep.

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // Delete caches that are not in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
