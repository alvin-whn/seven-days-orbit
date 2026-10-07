import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../sw.js',import.meta.url),'utf8');
function worker(caches,fetch) {
  const handlers = {};
  vm.runInNewContext(source,{ self:{location:{href:'https://example.invalid/orbit/sw.js'},addEventListener:(name,handler) => {handlers[name] = handler;},clients:{claim:async () => {}}},caches,fetch,URL,Response,Set,Promise });
  return handlers;
}
test('online responses can be consumed before asynchronous cache writes finish', async () => {
  const writes = [];
  const handlers = worker({open:() => new Promise(resolve => setTimeout(() => resolve({put:async (url,response) => writes.push([url,await response.text()])}),5))},async () => new Response('updated game'));
  const waits = []; let responsePromise;
  handlers.fetch({request:new Request('https://example.invalid/orbit/src/game.mjs'),waitUntil:promise => waits.push(promise),respondWith:promise => {responsePromise = promise;}});
  assert.equal(await (await responsePromise).text(),'updated game');
  await Promise.all(waits);
  assert.deepEqual(writes,[['https://example.invalid/orbit/src/game.mjs','updated game']]);
});
test('cache-write failure does not reject a successful online response', async () => {
  const handlers = worker({open:async () => {throw new Error('Storage disabled');}},async () => new Response('online game'));
  const waits = []; let responsePromise;
  handlers.fetch({request:new Request('https://example.invalid/orbit/index.html'),waitUntil:promise => waits.push(promise),respondWith:promise => {responsePromise = promise;}});
  assert.equal(await (await responsePromise).text(),'online game'); await Promise.all(waits);
});
test('cache cleanup keeps other projects on the same origin', async () => {
  const removed = [];
  const handlers = worker({keys:async () => ['unrelated-project','seven-days-orbit-old','seven-days-orbit-v1.0.0-release'],delete:async name => removed.push(name)},async () => new Response('game'));
  let activation;
  handlers.activate({waitUntil:promise => {activation = promise;}}); await activation;
  assert.deepEqual(removed,['seven-days-orbit-old']);
});
