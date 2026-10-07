import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('resuming immediately before arrival still shows a result and a working restart', async t => {
  // 合成 DOM 运行实际游戏模块，覆盖暂停→恢复→首帧终局，而非复写状态机。
  // Run the actual game module in a synthetic DOM to cover pause/resume/first-frame completion without duplicating its state machine.
  const names = ['document','window','localStorage','performance','ResizeObserver','requestAnimationFrame','navigator'];
  const original = Object.fromEntries(names.map(name => [name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const originalRandom = Math.random;
  t.after(() => {
    Math.random = originalRandom;
    for (const name of names) original[name] ? Object.defineProperty(globalThis,name,original[name]) : delete globalThis[name];
  });
  let now = 1000;
  let nextFrame;
  const nodes = new Map();
  const context = new Proxy({}, { get: (_,name) => name === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {} });
  function node(id) {
    if (!nodes.has(id)) nodes.set(id,{ textContent:'',innerHTML:'',hidden:false,disabled:false,style:{},attributes:{},handlers:{},classList:{toggle() {}},children:id === 'day-markers' ? Array.from({length:7},() => ({className:''})) : [],
      getBoundingClientRect:() => ({width:600,height:420}),getContext:() => context,
      setAttribute(name,value) {this.attributes[name] = value;}, addEventListener(name,handler) {this.handlers[name] = handler;},blur() {} });
    return nodes.get(id);
  }
  const replacements = { document:{ getElementById:node,addEventListener() {},hidden:false },window:{ matchMedia:() => ({matches:true}),devicePixelRatio:1,addEventListener() {} },localStorage:{getItem:() => null,setItem() {}},performance:{now:() => now},ResizeObserver:class {observe() {}},requestAnimationFrame:callback => {nextFrame = callback;},navigator:{} };
  for (const name of names) Object.defineProperty(globalThis,name,{value:replacements[name],configurable:true,writable:true});
  Math.random = () => 0.5;
  const source = (await readFile(new URL('../src/game.mjs',import.meta.url),'utf8')).replace("from './engine.mjs'",`from ${JSON.stringify(new URL('../src/engine.mjs',import.meta.url).href)}`);
  await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const frame = milliseconds => {now += milliseconds; const callback = nextFrame; callback(now);};
  node('start').handlers.click();
  for (let index=0;index<4199;index++) frame(20);
  node('pause').handlers.click(); frame(5000);
  assert.equal(node('pause').attributes['aria-pressed'],'true');
  node('start').handlers.click(); frame(50);
  assert.equal(node('overlay').hidden,false);
  assert.equal(node('overlay-title').textContent,'七天，漂亮抵达。');
  assert.equal(node('pause').disabled,true);
  node('start').handlers.click(); frame(20);
  assert.equal(node('overlay').hidden,true); assert.equal(node('pause').disabled,false); assert.equal(node('score').textContent,'0000');
});
