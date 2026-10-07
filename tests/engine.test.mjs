import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, difficultyForDay, angularDistance, wrapAngle, TAU, TOTAL_SECONDS } from '../src/engine.mjs';

function playing() { const game = createGame(() => 0.5); game.status = 'playing'; game.spawnClock = 1000; return game; }
test('angles wrap and collisions cross the zero-angle seam', () => {
  assert.ok(Math.abs(wrapAngle(-0.1) - (TAU - 0.1)) < 1e-10);
  assert.ok(angularDistance(0.05, TAU - 0.05) < 0.101);
});
test('ready and terminal games cannot consume time or change shields', () => {
  const game = createGame(); stepGame(game,1,1); assert.equal(game.elapsed,0);
  game.status = 'won'; stepGame(game,1,1); assert.equal(game.shields,3); assert.equal(game.elapsed,0);
});
test('steering is bounded and long frames are capped', () => {
  const game = playing(); const before = game.angle; stepGame(game,50,99);
  assert.equal(game.elapsed,0.1); assert.ok(angularDistance(game.angle,before) <= 0.271);
  stepGame(game,NaN,1); stepGame(game,-1,1); assert.equal(game.elapsed,0.1);
});
test('matching energy is collected once and scored', () => {
  const game = playing(); game.angle = 0; game.objects = [{ angle:0,radius:1.02,energy:true }];
  stepGame(game,0.1); assert.equal(game.energy,1); assert.equal(game.score,150); assert.equal(game.objects.length,0);
  stepGame(game,0.1); assert.equal(game.energy,1);
});
test('distant hazards miss; stacked hazards consume only one shield in the grace window', () => {
  const game = playing(); game.angle = 0;
  game.objects = [{ angle:Math.PI,radius:1.02,energy:false }, { angle:0,radius:1.02,energy:false }, { angle:0,radius:1.02,energy:false }];
  stepGame(game,0.1); assert.equal(game.shields,2); assert.ok(game.invincible > 0);
  stepGame(game,0.1); assert.equal(game.shields,2);
});
test('last shield ends a flight and a fresh game resets every run', () => {
  const game = playing(); game.angle = 0; game.shields = 1; game.objects = [{ angle:0,radius:1.02,energy:false }];
  stepGame(game,0.1); assert.equal(game.status,'lost'); assert.equal(game.shields,0);
  const fresh = createGame(); assert.equal(fresh.elapsed,0); assert.equal(fresh.shields,3); assert.equal(fresh.energy,0); assert.deepEqual(fresh.objects,[]);
});
test('seven days end at 84 seconds, with a single remaining-shield bonus', () => {
  const game = playing(); game.elapsed = TOTAL_SECONDS - 0.05; game.shields = 2;
  stepGame(game,0.1); assert.equal(game.day,7); assert.equal(game.status,'won'); assert.equal(game.score,1040);
  stepGame(game,0.1); assert.equal(game.score,1040);
});
test('difficulty strictly increases from day one to seven', () => {
  for (let day=1;day<7;day++) {
    assert.ok(difficultyForDay(day+1).speed > difficultyForDay(day).speed);
    assert.ok(difficultyForDay(day+1).interval < difficultyForDay(day).interval);
  }
  assert.deepEqual(difficultyForDay(100),difficultyForDay(7));
});
test('the final frame cannot apply damage beyond the 84-second deadline', () => {
  const game = playing(); game.elapsed = 83.99; game.shields = 1; game.angle = 0;
  game.objects = [{ angle:0,radius:1.1,energy:false }];
  stepGame(game,0.1); assert.equal(game.status,'won'); assert.equal(game.shields,1); assert.equal(game.elapsed,84);
});
test('separated sprite geometry does not produce a distant collision', () => {
  const game = playing(); game.angle = 0;
  game.objects = [{ angle:0.149,radius:1.08,energy:false }];
  stepGame(game,0.02); assert.equal(game.shields,3);
});
