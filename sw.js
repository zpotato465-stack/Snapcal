/* SnapCal service worker — offline-first app shell cache. */
const CACHE = "snapcal-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./i18n.js",
  "./foods.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (e) => {
  // Do NOT skipWaiting automatically — wait until the user taps "Update" so the
  // page can show an in-app prompt instead of swapping assets mid-session.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// The page posts this when the user taps the in-app update banner.
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache cross-origin API calls (Open Food Facts) or the TF.js CDN model.
  if (url.origin !== self.location.origin) {
    return; // let the network handle it; offline => it simply fails gracefully
  }

  // Cache-first for same-origin app shell, with network fallback + runtime caching.
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
