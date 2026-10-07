const CACHE_NAME = 'seven-days-orbit-v1.0.0';
const ASSETS = ['./','./index.html','./style.css','./favicon.svg','./src/game.mjs','./src/engine.mjs'];
const ROOT = new URL('./',self.location.href);
const allowed = new Set(ASSETS.map(asset => new URL(asset,ROOT).href));
self.addEventListener('install',event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate',event => {
  // 仅清理本游戏命名空间，保留同域其它项目的缓存。
  // Clean only this game's cache namespace, preserving other projects' caches on the same origin.
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('seven-days-orbit-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url); url.search = ''; url.hash = '';
  if (!allowed.has(url.href)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && response.type !== 'opaque') {
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(url.href,response.clone())));
    }
    return response;
  }).catch(() => caches.match(url.href).then(cached => cached || Response.error())));
});
