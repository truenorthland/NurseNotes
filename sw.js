// Define a cache name, which helps in versioning and updating the cache later
var CACHE_NAME = 'nurse-notes-v1';

// Specify all the resources you want to cache
var urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // You can add more resources here
];

// The 'install' event is the first event triggered in the service worker lifecycle
// Use it to cache all initial resources
self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// The 'fetch' event is triggered for every network request made by your application
// Use it to serve cached content when offline and update the cache with new content when online
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response from cache
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and can only be consumed once.
                // Since we are consuming this once by cache and once by the browser for fetch, we need to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
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

// The 'activate' event is a good place to clean up old caches
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME]; // Add any other cache names you want to keep

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // Delete the caches that are not in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
