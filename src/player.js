/**
 * player.js
 * The player character: input-driven movement, gravity, jumping and
 * solid collision against platforms.
 *
 * All physics values are "per fixed step" (the game runs a 60 Hz
 * simulation step, see game.js), so tweak the constants below to
 * change how the character feels.
 */

// ---- Tuning constants ----
const ACCEL        = 0.9;    // horizontal acceleration while a direction is held
const MAX_SPEED    = 5;      // top horizontal speed
const FRICTION_GND = 0.78;   // speed multiplier per step when no input, on ground
const FRICTION_AIR = 0.94;   // same, in the air (floatier)
const GRAVITY      = 0.6;    // downward acceleration
const MAX_FALL     = 15;     // terminal fall speed
const MAX_RISE     = 24;     // bounds spring and jump launch speed
export const JUMP_SPEED = 15; // initial upward speed of a jump
const JUMP_CUT     = 2.2;    // extra gravity multiplier when jump is released early
const COYOTE_STEPS = 6;      // grace steps to still jump just after leaving a ledge
const BUFFER_STEPS = 6;      // remember a jump press for a few steps before landing

export class Player {
  constructor(x, y, audio = null) {
    this.w = 30;
    this.h = 42;
    this.x = x;
    this.y = y;
    this.audio = audio;

    this.vx = 0;
    this.vy = 0;
    this.animTime = 0;

    this.onGround = false;
    this.facing = 1;          // 1 = right, -1 = left (for drawing the eyes)

    this.powerUps = new Set();
    this.maxJumps = 1;
    this.jumpCount = 0;
    this.shieldTime = 0;
    this.shieldReady = false;
    this.speedBoostTime = 0;
    this.speedBoostReady = false;

    this.coyote = 0;          // steps left in the coyote-time window
    this.jumpBuffer = 0;      // steps left in the jump-buffer window
    this.jumpWasHeld = false; // used to detect a fresh jump press
  }

  enablePowerUp(type) {
    if (type === 'doubleJump') {
      this.powerUps.add(type);
      this.maxJumps = 2;
    }
    if (type === 'shield') {
      this.powerUps.add(type);
      this.shieldReady = true;
      this.shieldTime = 10;
    }
    if (type === 'speedBoost') {
      this.powerUps.add(type);
      this.speedBoostReady = true;
      this.speedBoostTime = 5;
    }
  }

  canDoubleJump() {
    return this.powerUps.has('doubleJump') && this.maxJumps > 1;
  }

  updatePowerUps(dt) {
    if (this.shieldReady && this.shieldTime > 0) {
      this.shieldTime = Math.max(0, this.shieldTime - dt);
      if (this.shieldTime === 0) {
        this.shieldReady = false;
        this.powerUps.delete('shield');
      }
    }

    if (this.speedBoostReady && this.speedBoostTime > 0) {
      this.speedBoostTime = Math.max(0, this.speedBoostTime - dt);
      if (this.speedBoostTime === 0) {
        this.speedBoostReady = false;
        this.powerUps.delete('speedBoost');
      }
    }
  }

  consumeShield() {
    if (!this.shieldReady) return false;
    this.shieldReady = false;
    this.shieldTime = 0;
    this.powerUps.delete('shield');
    return true;
  }

  getSpeedMultiplier() {
    return this.speedBoostReady ? 1.6 : 1;
  }

  beginJump(isDoubleJump = false) {
    if (isDoubleJump) this.audio?.playDoubleJump?.();
    else this.audio?.playJump?.();
    this.vy = -JUMP_SPEED;
    this.jumpBuffer = 0;
    this.coyote = 0;
    this.onGround = false;
    this.jumpCount += 1;
  }

  /**
   * Run one fixed simulation step.
   * @param {Set<string>} keys       currently pressed key codes
   * @param {Platform[]}  platforms  everything solid
   * @param {{w:number,h:number}} bounds  the game world size
   */
  update(keys, platforms, bounds) {
    this.animTime += Math.abs(this.vx) * 0.05 + 0.02;
    let jumpTriggered = false;

    // ---------- 1. Read input ----------
    const left  = keys.has('ArrowLeft')  || keys.has('KeyA');
    const right = keys.has('ArrowRight') || keys.has('KeyD');
    const jumpHeld = keys.has('ArrowUp') || keys.has('KeyW') || keys.has('Space');

    // ---------- 2. Horizontal movement (smooth accel + friction) ----------
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    const speedMultiplier = this.getSpeedMultiplier();
    if (dir !== 0) {
      this.vx += dir * ACCEL * speedMultiplier;
      this.vx = Math.max(-MAX_SPEED * speedMultiplier, Math.min(MAX_SPEED * speedMultiplier, this.vx));
      this.facing = dir;
    } else {
      this.vx *= this.onGround ? FRICTION_GND : FRICTION_AIR;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // ---------- 3. Jumping ----------
    // A fresh press (not a held key) fills the jump buffer
    if (jumpHeld && !this.jumpWasHeld) this.jumpBuffer = BUFFER_STEPS;
    this.jumpWasHeld = jumpHeld;

    // Coyote time: stay "grounded" for a few steps after walking off a ledge
    this.coyote = this.onGround ? COYOTE_STEPS : Math.max(0, this.coyote - 1);
    const hasAirJump = this.canDoubleJump() && !this.onGround && this.jumpCount < this.maxJumps;

    if (this.jumpBuffer > 0 && (this.coyote > 0 || hasAirJump)) {
      const isDoubleJump = hasAirJump && this.coyote <= 0;
      if (this.onGround || this.coyote > 0) {
        this.jumpCount = 0;
      }
      this.beginJump(isDoubleJump);
      jumpTriggered = true;
    }
    this.jumpBuffer = Math.max(0, this.jumpBuffer - 1);
    if (this.onGround) this.jumpCount = 0;

    // ---------- 4. Gravity ----------
    // Releasing the key while rising cuts the jump short (variable jump height)
    const gravityScale = (this.vy < 0 && !jumpHeld) ? JUMP_CUT : 1;
    this.vy = Math.max(-MAX_RISE, Math.min(this.vy + GRAVITY * gravityScale, MAX_FALL));

    // ---------- 5. Move + collide, one axis at a time ----------
    // Doing X then Y separately makes it easy to know which side we hit.

    // --- X axis ---
    const previousX = this.x;
    this.x += this.vx;
    for (const p of platforms) {
      const overlapsVertically = this.y < p.y + p.h && this.y + this.h > p.y;
      if (!overlapsVertically) continue;

      const crossedRightSide = this.vx > 0 &&
        previousX + this.w <= p.x && this.x + this.w >= p.x;
      const crossedLeftSide = this.vx < 0 &&
        previousX >= p.x + p.w && this.x <= p.x + p.w;
      if (crossedRightSide || (this.vx > 0 && this.overlaps(p))) {
        this.x = p.x - this.w;
        this.vx = 0;
      } else if (crossedLeftSide || (this.vx < 0 && this.overlaps(p))) {
        this.x = p.x + p.w;
        this.vx = 0;
      }
    }
    // Keep inside the screen horizontally
    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x + this.w > bounds.w) { this.x = bounds.w - this.w; this.vx = 0; }

    // --- Y axis ---
    const prevY = this.y;
    this.y += this.vy;
    this.onGround = false;
    for (const p of platforms) {
      if (this.x >= p.x + p.w || this.x + this.w <= p.x) continue;

      const prevBottom = prevY + this.h;
      const prevTop = prevY;
      const previousPlatformY = p.y - p.deltaY;
      const crossedTop = prevBottom <= previousPlatformY &&
        this.y + this.h >= p.y;
      const crossedBottom = prevTop >= previousPlatformY + p.h &&
        this.y <= p.y + p.h;

      if (this.vy >= 0 && crossedTop) {
        this.y = p.y - this.h;
        this.onGround = true;
      } else if (this.vy < 0 && crossedBottom) {
        this.y = p.y + p.h;
      } else if (this.overlaps(p)) {
        const previousPlayerCenter = prevY + this.h / 2;
        const previousPlatformCenter = previousPlatformY + p.h / 2;
        if (previousPlayerCenter < previousPlatformCenter) {
          this.y = p.y - this.h;
          this.onGround = true;
        } else {
          this.y = p.y + p.h;
        }
      } else {
        continue;
      }

      this.vy = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy = Math.max(0, this.vy);
    }
    if (this.y + this.h > bounds.h) {
      this.y = bounds.h - this.h;
      this.vy = 0;
      this.onGround = true;
    }

    return jumpTriggered;
  }

  /** AABB overlap test against a platform. */
  overlaps(p) {
    return (
      this.x < p.x + p.w &&
      this.x + this.w > p.x &&
      this.y < p.y + p.h &&
      this.y + this.h > p.y
    );
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const walkFrame = Math.floor(this.animTime * 8) % 2;
    const armSwing = this.onGround ? Math.sin(this.animTime * 2) * 4 : 0;
    const legSwing = this.onGround ? Math.sin(this.animTime * 2) * 5 : 0;
    const eyeShift = this.facing * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(x + 2, y + this.h + 3, this.w - 4, 5);

    // Body / torso
    ctx.fillStyle = '#f2b632';
    ctx.fillRect(x + 8, y + 6, this.w - 16, this.h - 12);

    // Head
    ctx.fillStyle = '#f7d38d';
    ctx.fillRect(x + 7, y, this.w - 14, 14);

    // Legs / feet
    ctx.fillStyle = '#b5791a';
    ctx.fillRect(x + 9, y + this.h - 8, 5, 8 + legSwing * 0.5);
    ctx.fillRect(x + 16, y + this.h - 8, 5, 8 - legSwing * 0.5);

    // Arms
    ctx.fillStyle = '#f7d38d';
    ctx.fillRect(x + 2, y + 12 + armSwing, 6, 12);
    ctx.fillRect(x + this.w - 8, y + 12 - armSwing, 6, 12);

    // Belt
    ctx.fillStyle = '#8a4f1e';
    ctx.fillRect(x + 7, y + 16, this.w - 14, 5);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 11 + eyeShift, y + 5, 4, 4);
    ctx.fillRect(x + 18 + eyeShift, y + 5, 4, 4);

    ctx.fillStyle = '#10222a';
    ctx.fillRect(x + 12 + eyeShift + (this.facing > 0 ? 1 : 0), y + 6, 2, 2);
    ctx.fillRect(x + 19 + eyeShift + (this.facing > 0 ? 1 : 0), y + 6, 2, 2);

    // Walk cycle accent line on feet to simulate sprite frames
    if (this.onGround) {
      ctx.fillStyle = walkFrame === 0 ? '#d98d2d' : '#c67a1d';
      ctx.fillRect(x + 8, y + this.h - 2, 6, 2);
      ctx.fillRect(x + 16, y + this.h - 2, 6, 2);
    }
  }
}
