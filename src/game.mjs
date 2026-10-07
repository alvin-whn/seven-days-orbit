import { createGame, stepGame, pauseGame, resumeGame, TAU, TOTAL_SECONDS } from './engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('universe');
const context = canvas.getContext('2d');
const elements = Object.fromEntries(['day','score','shield','best','overlay','overlay-kicker','overlay-title','overlay-description','start','progress','system-status','flight-note','flash','announcement'].map(id => [id, $(id)]));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dayMessages = ['所有伟大的出发，都从休息一会开始。','第二天，别忘记抬头看看星星。','第三天，你已经比昨天更从容。','第四天，越过一半的碎片。','第五天，远处已经有了微光。','第六天，休息也属于你的航程。','第七天，你值得一个漂亮的抵达。'];
let game = createGame();
let best = 0;
let width = 1;
let height = 1;
let orbit = 1;
let previousTime = 0;
let lastStatus = 'ready';
let lastDay = 1;
const keys = new Set();
const pointers = new Map();
const pauseButton = $('pause');
const stars = Array.from({ length: 90 }, (_, index) => ({ x: ((index * 137.507) % 997) / 997, y: ((index * 71.831) % 991) / 991, size: index % 5 === 0 ? 1.2 : 0.55, brightness: 0.12 + (index % 8) * 0.045 }));

try { best = Math.max(0, Number(localStorage.getItem('seven-days-orbit:best')) || 0); } catch { /* 禁用存储仍可游玩。 / Play remains available when storage is disabled. */ }
elements.best.textContent = String(best).padStart(4, '0');

function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  width = Math.max(1, rect.width); height = Math.max(1, rect.height);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  orbit = Math.min(width * 0.335, height * 0.365);
}
new ResizeObserver(resize).observe(canvas);

function position(angle, radius) { return [width / 2 + Math.cos(angle) * orbit * radius, height / 2 + Math.sin(angle) * orbit * radius]; }
function circle(radius, stroke, lineWidth = 1) {
  context.beginPath(); context.arc(width / 2, height / 2, radius, 0, TAU);
  context.strokeStyle = stroke; context.lineWidth = lineWidth; context.stroke();
}

function draw(time) {
  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    const flicker = reducedMotion ? 1 : 0.8 + Math.sin(time / 1800 + star.x * 40) * 0.2;
    context.fillStyle = `rgba(188,213,224,${star.brightness * flicker})`;
    context.fillRect(star.x * width, star.y * height, star.size, star.size);
  }
  const glow = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, orbit * 1.7);
  glow.addColorStop(0, '#3a797921'); glow.addColorStop(0.6, '#3161680a'); glow.addColorStop(1, '#14212a00');
  context.fillStyle = glow; context.fillRect(0, 0, width, height);
  circle(orbit * 0.37, '#79aeae12'); circle(orbit * 0.62, '#79aeae0e');
  circle(orbit, '#a8c7ca29'); circle(orbit + 5, '#a8c7ca09'); circle(orbit * 1.32, '#79aeae0d'); circle(orbit * 1.66, '#79aeae0a');
  context.save(); context.translate(width / 2, height / 2);
  context.rotate(reducedMotion ? 0 : time / 55000);
  for (let i = 0; i < 48; i++) {
    const angle = i / 48 * TAU;
    const radius = orbit * 0.62;
    context.strokeStyle = i % 4 === 0 ? '#74a5ab35' : '#74a5ab14';
    context.beginPath(); context.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    context.lineTo(Math.cos(angle) * (radius + (i % 4 === 0 ? 7 : 3)), Math.sin(angle) * (radius + (i % 4 === 0 ? 7 : 3))); context.stroke();
  }
  context.restore();
  context.fillStyle = '#b6e4cf'; context.shadowColor = '#a1e7bf'; context.shadowBlur = 23;
  context.beginPath(); context.arc(width / 2, height / 2, 3, 0, TAU); context.fill(); context.shadowBlur = 0;
  context.strokeStyle = '#a1e7bf22'; context.beginPath(); context.moveTo(width / 2 - 13, height / 2); context.lineTo(width / 2 + 13, height / 2); context.moveTo(width / 2, height / 2 - 13); context.lineTo(width / 2, height / 2 + 13); context.stroke();
  const objects = game.status === 'ready' ? [{ angle: 0.34, radius: 1.42, energy: true }, { angle: 3.6, radius: 1.64, energy: false }, { angle: 1.9, radius: 0.68, energy: true }] : game.objects;
  for (const object of objects) {
    const [x,y] = position(object.angle, object.radius);
    context.save(); context.translate(x,y); context.scale(orbit / 160,orbit / 160); context.rotate(object.angle + time / (object.energy ? 5000 : 2300));
    context.fillStyle = object.energy ? '#a1e7bf' : '#e97769'; context.shadowColor = context.fillStyle; context.shadowBlur = object.energy ? 12 : 6;
    context.beginPath();
    if (object.energy) { context.moveTo(0,-5); context.lineTo(4,0); context.lineTo(0,5); context.lineTo(-4,0); }
    else { context.moveTo(-5,-6); context.lineTo(5,-4); context.lineTo(7,3); context.lineTo(-2,6); context.lineTo(-7,1); }
    context.closePath(); context.fill(); context.restore();
  }
  const shipAngle = game.status === 'ready' ? -0.82 : game.angle;
  const [shipX,shipY] = position(shipAngle,1);
  context.save(); context.translate(shipX,shipY); context.scale(orbit / 160,orbit / 160); context.rotate(shipAngle + Math.PI / 2);
  context.globalAlpha = game.invincible > 0 && Math.floor(time / 100) % 2 === 0 ? 0.35 : 1;
  context.fillStyle = '#ff9a65'; context.shadowColor = '#ff9a65'; context.shadowBlur = 18;
  context.beginPath(); context.moveTo(0,-11); context.lineTo(7,8); context.lineTo(0,4); context.lineTo(-7,8); context.closePath(); context.fill();
  context.fillStyle = '#fff2cd'; context.shadowBlur = 0; context.fillRect(-1,0,2,4);
  if (game.status === 'playing' && !reducedMotion) {
    context.fillStyle = '#ff9a6560'; context.beginPath(); context.moveTo(-3,10); context.lineTo(0,15 + Math.sin(time / 60) * 3); context.lineTo(3,10); context.fill();
  }
  context.restore();
  context.font = '8px Consolas, monospace'; context.fillStyle = '#4c6d7c'; context.textAlign = 'center';
  context.fillText('ORBIT 01 / KEEP MOVING', width / 2, height - 18);
}

function updateHud() {
  elements.day.innerHTML = `${String(game.day).padStart(2,'0')}<span>/ 07</span>`;
  elements.score.textContent = String(game.score).padStart(4,'0');
  elements.shield.textContent = Array.from({ length: 3 }, (_, index) => index < game.shields ? '●' : '○').join(' ');
  elements.shield.setAttribute('aria-label', `${game.shields} 个护盾`);
  elements.progress.style.width = `${game.elapsed / TOTAL_SECONDS * 100}%`;
  elements['flight-note'].textContent = dayMessages[game.day - 1];
  Array.from($('day-markers').children).forEach((marker,index) => { marker.className = index + 1 === game.day ? 'active' : index + 1 < game.day ? 'complete' : ''; });
  elements.flash.classList.toggle('visible', game.elapsed - game.lastHit < 0.15 && game.status === 'playing');
  if (game.day !== lastDay) { elements.announcement.textContent = `进入第 ${game.day} 天。剩余 ${game.shields} 个护盾。`; lastDay = game.day; }
}

function showResult() {
  const won = game.status === 'won';
  if (game.score > best) {
    best = game.score; elements.best.textContent = String(best).padStart(4,'0');
    try { localStorage.setItem('seven-days-orbit:best', String(best)); } catch { /* 本地成绩是可选功能。 / Local score persistence is optional. */ }
  }
  elements['system-status'].textContent = won ? 'FLIGHT COMPLETE' : 'READY FOR ANOTHER TRY';
  elements['overlay-kicker'].textContent = won ? 'SEVEN DAYS. ONE BEAUTIFUL ORBIT.' : 'EVERY RETURN IS A NEW BEGINNING';
  elements['overlay-title'].textContent = won ? '七天，漂亮抵达。' : '休息一下，再出发。';
  elements['overlay-description'].textContent = `本次成绩 ${game.score} · 收集 ${game.energy} 颗星火 · 航行 ${Math.floor(game.elapsed)} 秒`;
  elements.start.innerHTML = '再飞一次 <span aria-hidden="true">↗</span>';
  elements.overlay.hidden = false;
  elements.announcement.textContent = `${won ? '航程完成' : '护盾耗尽'}。本次成绩 ${game.score}。`;
  keys.clear(); pointers.clear();
  pauseButton.disabled = true;
  pauseButton.setAttribute('aria-pressed','false');
}

function pauseFlight() {
  if (!pauseGame(game)) return;
  keys.clear(); pointers.clear();
  pauseButton.setAttribute('aria-pressed','true');
  pauseButton.innerHTML = '继续 <span aria-hidden="true">▷</span>';
  elements['system-status'].textContent = 'TAKE YOUR TIME';
  elements['overlay-kicker'].textContent = 'REST IS PART OF THE JOURNEY';
  elements['overlay-title'].textContent = '你的轨道，等你回来。';
  elements['overlay-description'].textContent = '时间、碎片和护盾都已停下。休息好了再继续。';
  elements.start.innerHTML = '继续航程 <span aria-hidden="true">↗</span>';
  elements.overlay.hidden = false;
  elements.announcement.textContent = '已暂停。时间和护盾保持不变。';
}
function resumeFlight() {
  if (!resumeGame(game)) return;
  // 重新建立帧基准并清空输入，避免暂停时长变成恢复后的模拟推进。
  // Reset the frame baseline and inputs so paused wall time never becomes simulation time on resume.
  previousTime = performance.now(); keys.clear(); pointers.clear();
  pauseButton.setAttribute('aria-pressed','false');
  pauseButton.innerHTML = '暂停 <span aria-hidden="true">Ⅱ</span>';
  elements.overlay.hidden = true; elements['system-status'].textContent = 'FLIGHT IN PROGRESS';
  elements.announcement.textContent = '继续航程。';
}
pauseButton.addEventListener('click', () => game.status === 'paused' ? resumeFlight() : pauseFlight());

elements.start.addEventListener('click', () => {
  if (game.status === 'paused') { resumeFlight(); elements.start.blur(); return; }
  game = createGame(); game.status = 'playing'; lastStatus = 'playing'; lastDay = 1;
  keys.clear(); pointers.clear(); previousTime = performance.now();
  elements.overlay.hidden = true; elements['system-status'].textContent = 'FLIGHT IN PROGRESS';
  elements.announcement.textContent = '航程开始。使用左右方向键或 A、D 转向。';
  elements.start.blur(); updateHud();
  pauseButton.disabled = false; pauseButton.setAttribute('aria-pressed','false');
  pauseButton.innerHTML = '暂停 <span aria-hidden="true">Ⅱ</span>';
});
document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if ([' ','escape','p'].includes(key) && ['playing','paused'].includes(game.status)) {
    event.preventDefault(); if (!event.repeat) game.status === 'paused' ? resumeFlight() : pauseFlight(); return;
  }
  if (['arrowleft','arrowright','a','d'].includes(key) && game.status === 'playing') { event.preventDefault(); keys.add(key); }
});
document.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { keys.clear(); pointers.clear(); pauseFlight(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseFlight(); });
for (const [id,direction] of [['left',-1],['right',1]]) {
  const button = $(id);
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); pointers.set(event.pointerId,direction); });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name, event => pointers.delete(event.pointerId));
}

function frame(time) {
  const dt = previousTime ? (time - previousTime) / 1000 : 0;
  previousTime = time;
  const keyboard = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
  const touch = [...pointers.values()].reduce((sum,direction) => sum + direction,0);
  stepGame(game,dt,Math.max(-1,Math.min(1,keyboard + touch)));
  if (game.status === 'playing') updateHud();
  else if (['lost','won'].includes(game.status) && lastStatus === 'playing') { updateHud(); showResult(); }
  lastStatus = game.status;
  draw(time);
  requestAnimationFrame(frame);
}
resize(); updateHud(); requestAnimationFrame(frame);

// 可选的同源缓存只处理公开游戏资源；缓存故障不影响在线游玩。
// Optional same-origin caching handles public game assets only; cache failures never prevent online play.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).catch(() => {
    elements['flight-note'].textContent = '当前浏览器未启用离线缓存，在线航程照常可玩。';
  });
}
