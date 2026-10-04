import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/player.js';

test('speed boost increases movement multiplier for 5 seconds', () => {
  const player = new Player(0, 0);
  player.enablePowerUp('speedBoost');

  assert.equal(player.speedBoostReady, true);
  assert.equal(player.getSpeedMultiplier(), 1.6);

  player.speedBoostTime = 0;
  player.updatePowerUps(0.1);
  assert.equal(player.speedBoostReady, false);
});
