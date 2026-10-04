/**
 * boss.js
 * A large enemy that takes multiple stomps before falling.
 */
import { Enemy } from './enemy.js';

export class Boss extends Enemy {
  constructor(x, y, patrolMin, patrolMax, speed = 1.2, health = 5) {
    super(x, y, patrolMin, patrolMax, speed);
    this.w = 70;
    this.h = 62;
    this.type = 'boss';
    this.name = 'The Giant Pineapple / Rotten King';
    this.maxHealth = health;
    this.health = health;
    this.hitFlash = 0;
    this.invulnerableTime = 0;
  }

  update(dt) {
    super.update(dt);
    this.invulnerableTime = Math.max(0, this.invulnerableTime - dt);
    this.hitFlash = this.invulnerableTime;
  }

  canTakeDamage() {
    return this.alive && this.invulnerableTime <= 0;
  }

  damage(amount = 1) {
    if (!this.canTakeDamage()) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTime = 1;
    this.hitFlash = 1;
    if (this.health <= 0) this.alive = false;
    return !this.alive;
  }

  draw(ctx) {
    if (!this.alive) return;

    const flashing = this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 12) % 2 === 0;
    const bodyColor = flashing ? '#f7d774' : '#7d2d32';
    ctx.fillStyle = bodyColor;
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h);

    ctx.fillStyle = '#3f9b45';
    ctx.fillRect(Math.round(this.x + 16), Math.round(this.y - 9), 10, 14);
    ctx.fillRect(Math.round(this.x + 30), Math.round(this.y - 13), 10, 18);
    ctx.fillRect(Math.round(this.x + 44), Math.round(this.y - 8), 10, 13);

    ctx.fillStyle = '#f6e3a2';
    ctx.fillRect(Math.round(this.x + 12), Math.round(this.y + 14), 8, 8);
    ctx.fillRect(Math.round(this.x + this.w - 20), Math.round(this.y + 14), 8, 8);

    ctx.fillStyle = '#10222a';
    ctx.fillRect(Math.round(this.x + 15), Math.round(this.y + 17), 4, 4);
    ctx.fillRect(Math.round(this.x + this.w - 19), Math.round(this.y + 17), 4, 4);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(Math.round(this.x), Math.round(this.y) - 10, this.w, 4);

    ctx.fillStyle = '#c9f1ff';
    ctx.fillRect(Math.round(this.x), Math.round(this.y) - 14, this.w, 6);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(
      Math.round(this.x),
      Math.round(this.y) - 14,
      this.w * (this.health / this.maxHealth),
      6
    );

    ctx.fillStyle = '#10222a';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('ROTTEN KING', this.x + this.w / 2, this.y - 16);
  }
}
