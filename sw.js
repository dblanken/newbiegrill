const CACHE_NAME = "grilltime-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/foods.js",
  "./js/timers.js",
  "./js/notify.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// Requests we serve network-first: the code that actually changes between
// deploys. Cache is just the offline fallback, never the source of truth
// while online - otherwise a deploy with no changes to sw.js itself (the
// only file whose bytes the browser diffs to notice an update) leaves
// everyone stuck on whatever was cached on their first visit, forever.
const NETWORK_FIRST = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/foods.js",
  "./js/timers.js",
  "./js/notify.js",
  "./js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Resolve against the SW's own scope (not a guessed prefix) so this works
// whether the app is served from the domain root (local dev) or a subpath
// (GitHub Pages project sites, e.g. /newbiegrill/).
const NETWORK_FIRST_PATHS = new Set(
  NETWORK_FIRST.map((p) => new URL(p, self.registration.scope).pathname)
);

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (NETWORK_FIRST_PATHS.has(url.pathname)) {
    // Network-first: always try to get the latest app code; fall back to
    // cache only when offline (e.g. no signal out at the grill).
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for rarely-changing assets (icons, manifest).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
