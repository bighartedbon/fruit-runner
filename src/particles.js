function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomCount(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export class Particle {
  constructor({ x, y, vx, vy, color, radius, life, gravity = 0 }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.radius = radius;
    this.life = life;
    this.maxLife = life;
    this.gravity = gravity;
  }

  update(dt) {
    this.life = Math.max(0, this.life - dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    return this.life > 0;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleManager {
  constructor() {
    this.particles = [];
  }

  addParticle(particle) {
    this.particles.push(particle);
  }

  createFruitBurst(x, y, color = null) {
    const colors = color ? [color, '#ffd166', '#fff1a8'] : ['#ffd166', '#f4d35e', '#ff6b6b', '#f94144'];
    for (let i = 0; i < randomCount(6, 8); i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(55, 145);
      this.addParticle(new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 45,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: randomBetween(1.5, 3),
        life: randomBetween(0.4, 0.75),
        gravity: 95,
      }));
    }
  }

  createStompBurst(x, y) {
    const colors = ['#f2f0e8', '#d9d9d2', '#b9bec0', '#e5dfd0'];
    for (let i = 0; i < randomCount(8, 10); i++) {
      this.addParticle(new Particle({
        x: x + randomBetween(-8, 8),
        y,
        vx: randomBetween(-125, 125),
        vy: randomBetween(-100, -30),
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: randomBetween(2.5, 5),
        life: randomBetween(0.25, 0.55),
        gravity: 230,
      }));
    }
  }

  createSpringBurst(x, y) {
    const colors = ['#74d680', '#b8f28b', '#36b96f', '#e6ffc4'];
    for (let i = 0; i < randomCount(8, 10); i++) {
      this.addParticle(new Particle({
        x: x + randomBetween(-9, 9),
        y,
        vx: randomBetween(-65, 65),
        vy: randomBetween(-210, -100),
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: randomBetween(1.5, 3),
        life: randomBetween(0.35, 0.7),
        gravity: 65,
      }));
    }
  }

  createBossHitBurst(x, y) {
    const colors = ['#fff8c7', '#ffe66d', '#ffb347', '#ffffff'];
    for (let i = 0; i < randomCount(12, 15); i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(90, 210);
      this.addParticle(new Particle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: randomBetween(2, 4),
        life: randomBetween(0.3, 0.6),
        gravity: 110,
      }));
    }
  }

  update(dt) {
    this.particles = this.particles.filter((particle) => particle.update(dt));
  }

  render(ctx) {
    for (const particle of this.particles) particle.draw(ctx);
  }

  clear() {
    this.particles.length = 0;
  }
}
