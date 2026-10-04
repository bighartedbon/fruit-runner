/**
 * powerup.js
 * Temporary ability pickups that change the player's movement rules.
 */
export class PowerUp {
  constructor(x, y, type = 'doubleJump') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 12;
    this.collected = false;
    this.time = 0;
    this.effectTime = 0;
    this.effectDuration = 0.6;
  }

  update(dt) {
    this.time += dt;
    if (this.collected) this.effectTime += dt;
  }

  touches(player) {
    if (this.collected) return false;
    const nearestX = Math.max(player.x, Math.min(this.x, player.x + player.w));
    const nearestY = Math.max(player.y, Math.min(this.y, player.y + player.h));
    const dx = this.x - nearestX;
    const dy = this.y - nearestY;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  collect() {
    if (this.collected) return false;
    this.collected = true;
    this.effectTime = 0;
    return true;
  }

  draw(ctx) {
    if (!this.collected) {
      this.drawPowerUp(ctx);
    } else if (this.effectTime < this.effectDuration) {
      this.drawPopEffect(ctx);
    }
  }

  drawPowerUp(ctx) {
    const bob = Math.sin(this.time * 4) * 3;
    const cx = this.x;
    const cy = this.y + bob;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, this.y + 15, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);

    if (this.type === 'shield') {
      ctx.fillStyle = '#f7d154';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff3a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#d98d2d';
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(0, -10);
      ctx.lineTo(4, -2);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#f6d365';
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.quadraticCurveTo(-2, -12, 0, -10);
      ctx.quadraticCurveTo(2, -12, 8, 0);
      ctx.quadraticCurveTo(2, 10, 0, 8);
      ctx.quadraticCurveTo(-2, 10, -8, 0);
      ctx.fill();

      ctx.fillStyle = '#fefefe';
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(-1, -8, 0, -6);
      ctx.quadraticCurveTo(1, -8, 4, -2);
      ctx.fill();

      ctx.strokeStyle = '#5a3a1e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -14);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawPopEffect(ctx) {
    const t = this.effectTime / this.effectDuration;
    const fade = 1 - t;
    const label = this.type === 'shield' ? 'SHIELD' : this.type === 'speedBoost' ? 'BOOST' : 'WINGS';
    ctx.strokeStyle = `rgba(246, 211, 101, ${fade})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + t * 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.x, this.y - 18 - t * 12);
  }
}
