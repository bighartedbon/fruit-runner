import test from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/player.js';

test('shield blocks one enemy hit before losing the ability', () => {
  const player = new Player(0, 0);
  player.enablePowerUp('shield');

  assert.equal(player.shieldReady, true);
  assert.equal(player.consumeShield(), true);
  assert.equal(player.shieldReady, false);
  assert.equal(player.consumeShield(), false);
});
