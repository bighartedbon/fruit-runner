import test from 'node:test';
import assert from 'node:assert/strict';
import { Boss } from '../src/boss.js';

test('boss takes one damage per stomp and is invulnerable for one second', () => {
  const boss = new Boss(10, 10, 0, 100, 1.2, 3);

  assert.equal(boss.health, 3);
  assert.equal(boss.damage(1), false);
  assert.equal(boss.health, 2);
  assert.equal(boss.damage(1), false);
  assert.equal(boss.health, 2);
  boss.update(1);
  assert.equal(boss.damage(1), false);
  assert.equal(boss.damage(1), false);
  assert.equal(boss.health, 1);
  boss.update(1);
  assert.equal(boss.damage(1), true);
  assert.equal(boss.health, 0);
});
