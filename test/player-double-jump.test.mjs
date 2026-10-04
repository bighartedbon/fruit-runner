import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/player.js';

test('player can perform a second jump while double jump is active', () => {
  const player = new Player(100, 100);
  player.enablePowerUp('doubleJump');
  player.onGround = false;
  player.jumpCount = 1;
  player.vy = 1;

  player.update(new Set(['Space']), [], { w: 800, h: 720 });

  assert.equal(player.jumpCount, 2);
  assert.ok(player.vy < 0);
});
