const CACHE_NAME = "revela-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (!whitelist.includes(key) ? caches.delete(key) : null))
      )
    )
  );
});
