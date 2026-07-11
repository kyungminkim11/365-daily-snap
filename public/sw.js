const VERSION = "365-daily-snap-v3";
const STATIC_CACHE = `${VERSION}-static`;
const MEDIA_CACHE = `${VERSION}-media`;
const ROUTE_CACHE = `${VERSION}-routes`;
const STATIC_ASSETS = ["/brand-symbol.svg", "/brand-symbol-light.svg", "/favicon.svg", "/site.webmanifest"];

async function trimCache(cacheName, maximumEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maximumEntries)).map((request) => cache.delete(request)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (limit) void trimCache(cacheName, limit);
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      void trimCache(cacheName, 24);
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/ko")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, ROUTE_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, 80));
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".webmanifest")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 40));
    return;
  }

  if (url.pathname.includes("/portfolio/") && url.pathname.endsWith(".json")) {
    event.respondWith(networkFirst(request, ROUTE_CACHE));
  }
});