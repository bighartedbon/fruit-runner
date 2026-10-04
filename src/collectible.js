/**
 * collectible.js
 * A fruit that sits still (with a gentle bob) until the player touches it.
 * On pickup it plays a short pop effect and then disappears for good.
 */
export class Fruit {
  /**
   * @param {number} x       centre x
   * @param {number} y       centre y (resting position)
   * @param {number} points  score awarded on pickup
   */
  constructor(x, y, points = 5) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.points = points;
    this.type = 'fruit';

    this.collected = false;   // true once picked up
    this.time = 0;            // drives the bobbing animation
    this.effectTime = 0;      // seconds since pickup (drives the pop effect)
    this.effectDuration = 0.6;
  }

  /** Advance animations. dt is in seconds. */
  update(dt) {
    this.time += dt;
    if (this.collected) this.effectTime += dt;
  }

  /** Circle-vs-rectangle overlap test against the player's box. */
  touches(player) {
    if (this.collected) return false;

    // Find the point on the player's box closest to the fruit centre
    const nearestX = Math.max(player.x, Math.min(this.x, player.x + player.w));
    const nearestY = Math.max(player.y, Math.min(this.y, player.y + player.h));
    const dx = this.x - nearestX;
    const dy = this.y - nearestY;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  /** Mark as collected and return the points to add to the score. */
  collect() {
    if (this.collected) return 0;
    this.collected = true;
    this.effectTime = 0;
    return this.points;
  }

  draw(ctx) {
    if (!this.collected) {
      this.drawFruit(ctx);
    } else if (this.effectTime < this.effectDuration) {
      this.drawPopEffect(ctx);
    }
    // After the effect finishes nothing is drawn: the fruit is gone.
  }

  drawFruit(ctx) {
    const bob = Math.sin(this.time * 4) * 3;   // up/down wobble
    const scale = 1 + Math.sin(this.time * 6) * 0.08;
    const cx = this.x;
    const cy = this.y + bob;
    const r = this.radius;

    // Soft shadow on the platform beneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, this.y + r + 3, r * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Apple body
    ctx.fillStyle = '#d63a2f';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#5a3a1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(2, -r - 6);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#4f9a3c';
    ctx.beginPath();
    ctx.ellipse(7, -r - 4, 6, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /** Expanding ring + burst of dots + floating "+5" text. */
  drawPopEffect(ctx) {
    const t = this.effectTime / this.effectDuration;   // 0 → 1
    const fade = 1 - t;

    // Expanding ring
    ctx.strokeStyle = `rgba(255, 240, 150, ${fade})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + t * 26, 0, Math.PI * 2);
    ctx.stroke();

    // Little burst of dots
    ctx.fillStyle = `rgba(214, 58, 47, ${fade})`;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = t * 30;
      ctx.beginPath();
      ctx.arc(this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, 3 * fade + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating score text
    ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
    ctx.strokeStyle = `rgba(16, 34, 42, ${fade})`;
    ctx.lineWidth = 3;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = '+' + this.points;
    const ty = this.y - 20 - t * 30;
    ctx.strokeText(text, this.x, ty);
    ctx.fillText(text, this.x, ty);
  }
}

export class Cherry extends Fruit {
  constructor(x, y, points = 10) {
    super(x, y, points);
    this.type = 'cherry';
  }

  drawFruit(ctx) {
    const bob = Math.sin(this.time * 4) * 3;
    const scale = 1 + Math.sin(this.time * 6) * 0.08;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 3, this.radius * 0.9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(scale, scale);

    ctx.strokeStyle = '#4f9a3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.quadraticCurveTo(-6, -14, 0, -16);
    ctx.moveTo(5, -3);
    ctx.quadraticCurveTo(6, -14, 0, -16);
    ctx.stroke();

    ctx.fillStyle = '#4f9a3c';
    ctx.beginPath();
    ctx.ellipse(4, -14, 5, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    for (const x of [-6, 6]) {
      ctx.fillStyle = '#bd1838';
      ctx.beginPath();
      ctx.arc(x, 2, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x - 2, -1, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
