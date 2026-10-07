import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

test('local preview serves game assets and rejects private or unknown paths', async t => {
  const child = spawn(process.execPath,[fileURLToPath(new URL('../tools/serve.mjs',import.meta.url)),'--port','0'],{ stdio:['ignore','pipe','pipe'] });
  t.after(async () => { child.kill(); if (child.exitCode === null) await once(child,'exit'); });
  const base = await new Promise((resolve,reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview startup timeout')),5000);
    child.once('error',error => { clearTimeout(timeout); reject(error); });
    child.stdout.on('data',chunk => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
  for (const pathname of ['/','/style.css','/src/game.mjs','/src/engine.mjs','/favicon.svg','/sw.js']) {
    const response = await fetch(base + pathname); assert.equal(response.status,200,pathname);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  }
  for (const pathname of ['/.git/config','/package.json','/tests/engine.test.mjs','/not-found','/%2e%2e/package.json','/src/%2e%2e/.env']) {
    assert.equal((await fetch(base + pathname)).status,404,pathname);
  }
});
