/**
 * platform.js
 * A solid rectangular platform. The player can land on top of it,
 * and is blocked by its sides and underside.
 */
export class Platform {
  /**
   * @param {number} x      left edge
   * @param {number} y      top edge (the surface the player stands on)
   * @param {number} w      width
   * @param {number} h      height
   * @param {string} [label] optional small label drawn on the platform (e.g. "1")
   * @param {string} [theme] optional visual style: 'earth' or 'ruins'
   * @param {{axis: 'x'|'y', min: number, max: number, speed: number}} [movement]
   *        optional movement bounds and angular speed in radians per second
   */
  constructor(x, y, w, h, label = '', theme = 'earth', movement = null, type = 'solid') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.theme = theme;
    this.movement = movement;
    this.type = type;
    this.elapsed = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.crumbleTimer = 0;
    this.respawnTimer = 0;
    this.springCooldown = 0;
    this.springBounce = 0;
    this.active = true;
  }

  update(dt) {
    this.deltaX = 0;
    this.deltaY = 0;
    this.springCooldown = Math.max(0, this.springCooldown - dt);
    this.springBounce = Math.max(0, this.springBounce - dt);

    if (this.type === 'crumbling') {
      if (!this.active) {
        this.respawnTimer += dt;
        if (this.respawnTimer >= 3) {
          this.active = true;
          this.respawnTimer = 0;
        }
      }
      if (this.active && this.crumbleTimer > 0) {
        this.crumbleTimer += dt;
        if (this.crumbleTimer >= 0.8) {
          this.active = false;
          this.crumbleTimer = 0;
          this.respawnTimer = 0;
        }
      }
    }

    if (!this.movement) return;

    const previousX = this.x;
    const previousY = this.y;
    this.elapsed += dt;
    const progress = (1 + Math.sin(this.elapsed * this.movement.speed)) / 2;
    const position = this.movement.min + (this.movement.max - this.movement.min) * progress;

    if (this.movement.axis === 'x') this.x = position;
    else this.y = position;

    this.deltaX = this.x - previousX;
    this.deltaY = this.y - previousY;
  }

  isSolid() {
    return this.type !== 'crumbling' || this.active;
  }

  beginCrumble() {
    if (this.type !== 'crumbling' || !this.active || this.crumbleTimer > 0) return;
    this.crumbleTimer = 0.01;
  }

  triggerSpring(player) {
    if (this.type !== 'spring' || this.springCooldown > 0) return false;
    this.springCooldown = 0.5;
    this.springBounce = 0.15;
    player.vy = -15 * 1.5;
    player.y = this.y - player.h - 2;
    player.onGround = false;
    return true;
  }

  draw(ctx) {
    if (this.type === 'crumbling' && !this.active) return;

    if (this.type === 'spring') {
      ctx.fillStyle = '#f0f4fa';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = '#ff6b6b';
      const compress = this.springBounce > 0 ? 3 : 0;
      ctx.fillRect(this.x + 2, this.y + compress, this.w - 4, this.h - compress);
      return;
    }

    if (this.theme === 'ruins') {
      ctx.fillStyle = '#5c6670';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.fillStyle = '#c8ac68';
      ctx.fillRect(this.x, this.y, this.w, 5);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(this.x, this.y + this.h - 4, this.w, 4);
    } else {
      // Earth body
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(this.x, this.y, this.w, this.h);

      // Grass strip on top
      ctx.fillStyle = '#4f9a3c';
      ctx.fillRect(this.x, this.y, this.w, 6);

      // Darker underside for a bit of depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(this.x, this.y + this.h - 4, this.w, 4);
    }

    if (this.type === 'crumbling') {
      const shakeOffset = (this.crumbleTimer > 0) ? Math.sin(this.crumbleTimer * 40) * 2 : 0;
      ctx.fillStyle = '#d4d8dc';
      ctx.fillRect(this.x + shakeOffset, this.y, this.w, this.h);
    }

    // Optional label (handy for checking the step order)
    if (this.label) {
      ctx.fillStyle = '#e9e2cf';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2 + 3);
    }
  }
}
