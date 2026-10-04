/**
 * enemy.js
 * A simple patrol enemy that can be expanded later with animation,
 * contact damage, and state transitions.
 */
export class Enemy {
  constructor(x, y, patrolMin, patrolMax, speed = 1.5, type = 'ground') {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 24;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.speed = speed;
    this.type = type;
    this.baseY = y;
    this.flightTime = 0;
    this.vx = this.speed;
    this.alive = true;
  }

  update(dt) {
    if (!this.alive) return;

    this.x += this.vx * dt * 60;
    if (this.type === 'flying') {
      this.flightTime += dt;
      this.y = this.baseY + Math.sin(this.flightTime * 3) * 18;
    }

    if (this.x <= this.patrolMin) {
      this.x = this.patrolMin;
      this.vx = this.speed;
    }

    if (this.x + this.w >= this.patrolMax) {
      this.x = this.patrolMax - this.w;
      this.vx = -this.speed;
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.fillStyle = this.type === 'flying' ? '#386b9a' : '#7d2d32';
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h);

    ctx.fillStyle = '#f6e3a2';
    ctx.fillRect(Math.round(this.x + 4), Math.round(this.y + 6), 5, 5);
    ctx.fillRect(Math.round(this.x + this.w - 9), Math.round(this.y + 6), 5, 5);
  }

  hitsPlayer(player) {
    if (!this.alive) return false;

    return (
      this.x < player.x + player.w &&
      this.x + this.w > player.x &&
      this.y < player.y + player.h &&
      this.y + this.h > player.y
    );
  }

  stomp(audio) {
    if (!this.alive) return false;
    this.alive = false;
    audio?.playStomp?.();
    return true;
  }
}
