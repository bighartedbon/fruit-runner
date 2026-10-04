import test from 'node:test';
import assert from 'node:assert/strict';
import { Platform } from '../src/platform.js';

test('crumbling platform drops collision after 0.8s and respawns later', () => {
  const platform = new Platform(0, 0, 50, 10, '', 'earth', null, 'crumbling');
  platform.beginCrumble();
  platform.update(0.81);
  assert.equal(platform.isSolid(), false);
  platform.update(3.1);
  assert.equal(platform.isSolid(), true);
});

test('spring platform launches player upward with a boosted jump', () => {
  const platform = new Platform(0, 100, 50, 10, '', 'earth', null, 'spring');
  const player = { vy: 0, x: 0, y: 100, h: 30, onGround: true };

  platform.triggerSpring(player);

  assert.ok(player.vy < 0);
  assert.equal(platform.springCooldown > 0, true);
});
