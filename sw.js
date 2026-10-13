'use strict';

// Scope each cache to this repository, including GitHub Pages project URLs.
const CACHE_PREFIX = 'student-dorm-guide:' + self.registration.scope + ':';
const CACHE_VERSION = '2026-10-13-v4-embedded-logo';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const APP_ROOT = new URL('./', self.registration.scope).href;
const INDEX_URL = new URL('index.html', APP_ROOT).href;
const FILES = [
  './',
  './index.html',
  './pwa.js',
  './manifest.webmanifest',
  './assets/college-logo.jpg',
  './assets/cairo.woff2',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];
const PRECACHE_URLS = FILES.map(path => new URL(path, APP_ROOT).href);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  if (!PRECACHE_URLS.includes(url.href)) return;

  // Fetch current content online; use the last saved guide when offline.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Bundled assets are available immediately from this version's cache.
    if (request.mode !== 'navigate' && !url.pathname.endsWith('/index.html')) {
      const saved = await cache.match(url.href);
      if (saved) return saved;
    }
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(url.href, response.clone()).catch(() => {});
        return response;
      }
      const saved = await cache.match(url.href);
      return saved || response;
    } catch {
      const saved = await cache.match(url.href);
      if (saved) return saved;
      if (request.mode === 'navigate') {
        return (await cache.match(INDEX_URL)) || Response.error();
      }
      return Response.error();
    }
  })());
});
