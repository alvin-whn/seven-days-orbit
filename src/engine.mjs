export const TAU = Math.PI * 2;
export const DAY_SECONDS = 12;
export const TOTAL_SECONDS = DAY_SECONDS * 7;

export function wrapAngle(angle) { return ((angle % TAU) + TAU) % TAU; }
export function angularDistance(a, b) { return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); }
export function difficultyForDay(day) {
  const boundedDay = Math.min(7, Math.max(1, Math.floor(day)));
  return { speed: 0.22 + boundedDay * 0.022, interval: 1.2 - boundedDay * 0.085 };
}

export function createGame(random = Math.random) {
  return { status: 'ready', elapsed: 0, day: 1, angle: -Math.PI / 2, shields: 3,
    energy: 0, score: 0, objects: [], spawnClock: 0.5, invincible: 0,
    lastHit: -Infinity, serial: 0, random };
}

export function pauseGame(game) {
  if (game.status !== 'playing') return false;
  game.status = 'paused'; return true;
}
export function resumeGame(game) {
  if (game.status !== 'paused') return false;
  game.status = 'playing'; return true;
}

// 半径以玩家轨道为 1，保持不同屏幕上的碰撞与速度合同一致。
// Normalize the player's orbit radius to 1 so collision and speed contracts stay identical across screens.
export function spawnObject(game) {
  const angle = game.random() * TAU;
  const energy = game.random() < 0.29;
  game.objects.push({ id: ++game.serial, angle, radius: 1.95, energy });
}

function advanceSegment(game, dt, steering) {
  game.elapsed = Math.min(TOTAL_SECONDS, game.elapsed + dt);
  game.day = Math.min(7, Math.floor(game.elapsed / DAY_SECONDS) + 1);
  game.angle = wrapAngle(game.angle + Math.max(-1, Math.min(1, steering)) * dt * 2.7);
  game.invincible = Math.max(0, game.invincible - dt);
  const difficulty = difficultyForDay(game.day);
  game.spawnClock -= dt;
  if (game.spawnClock <= 0) { spawnObject(game); game.spawnClock += difficulty.interval; }
  for (const object of game.objects) {
    object.radius -= dt * difficulty.speed;
    const difference = object.angle - game.angle;
    const distance = Math.hypot(Math.cos(difference) * object.radius - 1, Math.sin(difference) * object.radius);
    // 飞船和物体都按轨道比例绘制；这里使用同一比例的实际中心距离。
    // Ship and object geometry scale with the orbit; use center distance in the same normalized units.
    if (distance < (object.energy ? 0.1 : 0.09)) {
      if (object.energy) { game.energy++; object.radius = -1; }
      else if (game.invincible === 0) {
        game.shields--; game.lastHit = game.elapsed; game.invincible = 1.05; object.radius = -1;
      }
    }
  }
  game.objects = game.objects.filter(object => object.radius > 0.12);
  game.score = Math.floor(game.elapsed) * 10 + game.energy * 150;
  // 同帧优先结算最后一次伤害；归零不冒充成功抵达。
  // Resolve final-frame damage first; zero shields must never be reported as a successful arrival.
  if (game.shields <= 0) game.status = 'lost';
  else if (game.elapsed >= TOTAL_SECONDS) { game.status = 'won'; game.score += game.shields * 100; }
  return game;
}

export function stepGame(game, elapsedSeconds, steering = 0) {
  if (game.status !== 'playing' || !Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return game;
  // 航程终点不推进多余时间；20ms 子步同时避免高速转向穿过碰撞区域。
  // Never advance past the flight deadline; 20ms substeps also prevent fast steering from tunneling through collisions.
  const duration = Math.min(elapsedSeconds, 0.1, TOTAL_SECONDS - game.elapsed);
  const segments = Math.max(1, Math.ceil(duration / 0.02));
  for (let index = 0; index < segments && game.status === 'playing'; index++) advanceSegment(game, duration / segments, steering);
  return game;
}
