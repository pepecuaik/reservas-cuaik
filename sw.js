const CACHE_NAME = "cuaik-reservas-v3";
const SHELL = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation (index.html) & Firebase calls, so updates always show
// immediately. Cache-first only for static assets (icons, manifest) as an offline fallback.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("firebaseio.com") || url.includes("googleapis.com") || url.includes("gstatic.com")) {
    return; // always go to network for live data & SDK
  }
  if (event.request.mode === "navigate" || url.endsWith("/") || url.endsWith("index.html")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
