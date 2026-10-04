/**
 * game.js
 * Main controller that coordinates the engine, input, score, and state.
 */
import { Input } from './input.js';
import { LevelManager } from './levelManager.js';
import { Platform } from './platform.js';
import { Player, JUMP_SPEED } from './player.js';
import { Fruit, Cherry } from './collectible.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerup.js';
import { Boss } from './boss.js';
import { AudioEngine } from './audio.js';
import { loadData, resetData, saveData as persistData } from './storageManager.js';
import { ParticleManager } from './particles.js';

export const GameState = Object.freeze({
  START_MENU: 'START_MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
});

export class Game {
  constructor({ canvas, ctx, hudScore, hudLevel, hudLives, hudBestScore, hudBossHealth = null, hudBossHealthBar = null, hudBossHealthText = null, levelSelectGrid = null, startHighScore = null, startFruitTotal = null, resetSaveButton = null, audio = null, audioToggle = null }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.hudScore = hudScore;
    this.hudLevel = hudLevel;
    this.hudBestScore = hudBestScore;
    this.hudBossHealth = hudBossHealth;
    this.hudBossHealthBar = hudBossHealthBar;
    this.hudBossHealthText = hudBossHealthText;
    this.hudLives = hudLives;
    this.levelSelectGrid = levelSelectGrid;
    this.startHighScore = startHighScore;
    this.startFruitTotal = startFruitTotal;
    this.resetSaveButton = resetSaveButton;
    this.audio = audio ?? new AudioEngine();
    this.audioToggle = audioToggle;

    this.input = new Input();
    this.levelManager = new LevelManager();
    this.score = 0;
    this.levelScore = 0;
    this.currentLevel = 1;
    this.selectedLevel = 1;
    this.lives = 3;
    this.state = GameState.START_MENU;
    this.platforms = [];
    this.player = null;
    this.fruits = [];
    this.enemies = [];
    this.boss = null;
    this.powerUps = [];
    this.particleManager = new ParticleManager();
    this.saveData = loadData();
    this.bestScore = this.saveData.highScore;
    this.levelStars = this.saveData.levelStars;
    this.totalFruitsCollected = this.saveData.totalFruitsCollected;
    this.audio.setEnabled(!this.saveData.audioMuted);
    this.levelStartTime = 0;
    this.levelFruitTotal = 0;
    this.levelCollectedFruitCount = 0;
    this.shakeTime = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    this.step = 1 / 60;
    this.lastTime = null;
    this.accumulator = 0;
    this.running = false;

    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayMessage = document.getElementById('overlay-message');
    this.overlayButton = document.getElementById('overlay-button');
    this.overlayButton.addEventListener('click', () => {
      if (this.state === GameState.START_MENU) {
        this.startGame();
      } else if (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) {
        this.restartGame();
      } else if (this.state === GameState.LEVEL_COMPLETE) {
        this.startNextLevel();
      } else if (this.state === GameState.PAUSED) {
        this.state = GameState.PLAYING;
        this.hideOverlay();
      }
    });
    this.levelSelectGrid?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-level]');
      if (!button || button.disabled || this.state !== GameState.START_MENU) return;
      this.startGame(Number(button.dataset.level));
    });
    this.resetSaveButton?.addEventListener('click', () => {
      if (window.confirm('Reset all saved Fruit Runner progress?')) this.resetSaveProgress();
    });
    this.audioToggle?.addEventListener('click', () => this.toggleAudio());

    this.bindInput();
    this.syncAudioToggle();
    this.updateHud();
    this.showOverlay('FRUIT RUNNER', 'Press SPACE or click START to Play', 'START GAME');
  }

  bindInput() {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP') {
        if (this.state === GameState.PLAYING) {
          this.state = GameState.PAUSED;
          this.showOverlay('Paused', 'Press P to resume', 'Resume');
        } else if (this.state === GameState.PAUSED) {
          this.state = GameState.PLAYING;
          this.hideOverlay();
        }
        return;
      }

      if (event.code === 'KeyR') {
        this.resetToStart();
        return;
      }

      if (this.state === GameState.START_MENU) {
        if (event.code === 'Space' || event.code === 'Enter') {
          this.startGame();
        } else if (/^Digit[0-9]$/.test(event.code)) {
          const targetLevel = event.code === 'Digit0' ? 10 : Number(event.code.replace('Digit', ''));
          this.startGame(targetLevel);
        }
        return;
      }

      if (event.code !== 'Space' && event.code !== 'Enter') return;
      if (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) {
        this.restartGame();
      } else if (this.state === GameState.LEVEL_COMPLETE) {
        this.startNextLevel();
      }
    });
  }

  updateHud() {
    const values = [
      [this.hudLevel, this.currentLevel],
      [this.hudScore, this.score],
      [this.hudBestScore, this.bestScore],
      [this.hudLives, this.lives],
    ];
    for (const [element, value] of values) {
      const text = String(value);
      if (element.textContent !== text) element.textContent = text;
    }

    if (this.hudBossHealth) {
      const hasBoss = Boolean(this.boss?.alive);
      this.hudBossHealth.hidden = !hasBoss;
      if (hasBoss) {
        if (this.hudBossHealthBar) {
          this.hudBossHealthBar.max = this.boss.maxHealth;
          this.hudBossHealthBar.value = this.boss.health;
        }
        if (this.hudBossHealthText) {
          this.hudBossHealthText.textContent = `${this.boss.health}/${this.boss.maxHealth}`;
        }
        this.hudBossHealth.setAttribute('aria-label', `${this.boss.name}: ${this.boss.health} of ${this.boss.maxHealth} health`);
      }
    }
    if (this.state === GameState.START_MENU) this.updateStartMenu();
  }

  saveBestScore() {
    if (this.score <= this.bestScore) return;
    this.bestScore = this.score;
    this.saveData.highScore = this.bestScore;
    this.persistProgress();
    this.updateStartMenu();
  }

  persistProgress() {
    this.saveData.levelStars = this.levelStars;
    this.saveData.highScore = this.bestScore;
    this.saveData.totalFruitsCollected = this.totalFruitsCollected;
    this.saveData.audioMuted = !this.audio.enabled;
    persistData(this.saveData);
  }

  syncAudioToggle() {
    if (!this.audioToggle) return;
    this.audioToggle.textContent = this.audio.enabled ? 'ON' : 'OFF';
    this.audioToggle.setAttribute('aria-pressed', String(!this.audio.enabled));
    this.audioToggle.setAttribute('aria-label', this.audio.enabled ? 'Mute sound' : 'Unmute sound');
    this.audioToggle.title = this.audio.enabled ? 'Mute sound' : 'Unmute sound';
  }

  toggleAudio() {
    const enabled = this.audio.toggle();
    this.saveData.audioMuted = !enabled;
    this.persistProgress();
    this.syncAudioToggle();
  }

  updateStartMenu() {
    if (this.startHighScore) this.startHighScore.textContent = String(this.bestScore);
    if (this.startFruitTotal) this.startFruitTotal.textContent = String(this.totalFruitsCollected);
    if (!this.levelSelectGrid) return;

    this.levelSelectGrid.replaceChildren();
    for (let level = 1; level <= this.levelManager.levels.length; level++) {
      const unlocked = level <= this.saveData.highestLevelUnlocked;
      const stars = Math.min(3, this.levelStars[level] || 0);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'level-select-item';
      button.dataset.level = String(level);
      button.disabled = !unlocked;
      button.setAttribute('aria-label', unlocked
        ? `Play level ${level}, ${stars} of 3 stars`
        : `Level ${level} locked`);

      const number = document.createElement('span');
      number.className = 'level-number';
      number.textContent = unlocked ? String(level).padStart(2, '0') : '×';
      const rating = document.createElement('span');
      rating.className = 'level-stars';
      rating.textContent = unlocked ? `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}` : 'LOCKED';
      button.append(number, rating);
      this.levelSelectGrid.append(button);
    }
  }

  persistLevelCompletion(starRating) {
    this.levelStars[this.currentLevel] = Math.max(this.levelStars[this.currentLevel] || 0, starRating);
    this.saveData.highestLevelUnlocked = Math.min(
      this.levelManager.levels.length,
      Math.max(this.saveData.highestLevelUnlocked, this.currentLevel + 1)
    );
    this.persistProgress();
    this.updateStartMenu();
  }

  resetSaveProgress() {
    resetData();
    this.saveData = loadData();
    this.bestScore = this.saveData.highScore;
    this.levelStars = this.saveData.levelStars;
    this.totalFruitsCollected = this.saveData.totalFruitsCollected;
    this.selectedLevel = 1;
    this.audio.setEnabled(true);
    this.updateHud();
    this.updateStartMenu();
    this.syncAudioToggle();
  }

  getStarRatingForLevel(levelNumber, elapsedSeconds, completionRatio) {
    const timeTarget = 24 + (levelNumber - 1) * 8;
    if (completionRatio >= 0.9 && elapsedSeconds <= timeTarget * 0.9) return 3;
    if (completionRatio >= 0.7 && elapsedSeconds <= timeTarget * 1.35) return 2;
    if (completionRatio >= 0.5 && elapsedSeconds <= timeTarget * 1.7) return 2;
    return 1;
  }

  showOverlay(title, message, buttonText = 'Start') {
    this.overlayTitle.textContent = title;
    this.overlayMessage.textContent = message;
    this.overlayButton.textContent = buttonText;
    this.overlay.dataset.state = this.state;
    this.overlay.classList.add('visible');
  }

  hideOverlay() {
    this.overlay.classList.remove('visible');
  }

  startGame(levelNumber = this.selectedLevel) {
    if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > this.saveData.highestLevelUnlocked) return false;
    this.audio?.ensureContext?.();
    this.score = 0;
    this.levelScore = 0;
    this.currentLevel = levelNumber;
    this.selectedLevel = levelNumber;
    this.lives = 3;
    this.input.keys.clear();
    this.accumulator = 0;
    if (!this.loadLevel(levelNumber)) return false;
    this.state = GameState.PLAYING;
    this.hideOverlay();
    this.updateHud();
    return true;
  }

  resetToStart() {
    this.score = 0;
    this.levelScore = 0;
    this.currentLevel = 1;
    this.selectedLevel = 1;
    this.lives = 3;
    this.platforms = [];
    this.enemies = [];
    this.boss = null;
    this.fruits = [];
    this.player = null;
    this.powerUps = [];
    this.particleManager.clear();
    this.input.keys.clear();
    this.accumulator = 0;
    this.shakeTime = 0;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.levelStartTime = 0;
    this.levelFruitTotal = 0;
    this.levelCollectedFruitCount = 0;
    this.state = GameState.START_MENU;
    this.updateHud();
    this.updateStartMenu();
    this.showOverlay('FRUIT RUNNER', 'Press SPACE or click START to Play', 'START GAME');
  }

  restartGame() {
    this.resetToStart();
    this.startGame();
  }

  loadLevel(levelNumber) {
    const level = this.levelManager.getLevel(levelNumber);
    if (!level) return false;
    this.levelScore = 0;
    this.levelStartTime = performance.now();
    this.levelFruitTotal = (level.fruits || [level.fruit]).length;
    this.levelCollectedFruitCount = 0;
    this.platforms = level.platforms.map((platform) => new Platform(
      platform.x,
      platform.y,
      platform.w,
      platform.h,
      platform.label || '',
      platform.theme || 'earth',
      platform.movement,
      platform.type || 'solid'
    ));
    this.enemies = (level.enemies || []).map((enemy) => new Enemy(
      enemy.x,
      enemy.y,
      enemy.patrolMin,
      enemy.patrolMax,
      enemy.speed,
      enemy.type || 'ground'
    ));
    this.boss = null;
    if (level.boss) {
      this.boss = new Boss(
        level.boss.x,
        level.boss.y,
        level.boss.patrolMin,
        level.boss.patrolMax,
        level.boss.speed,
        level.boss.health
      );
      this.boss.name = level.boss.name || this.boss.name;
      this.enemies.push(this.boss);
    }
    this.player = new Player(level.playerStart.x, level.playerStart.y, this.audio);
    const levelFruits = level.fruits || [level.fruit];
    this.fruits = levelFruits.map((fruit) => (
      fruit.type === 'cherry'
        ? new Cherry(fruit.x, fruit.y, fruit.points)
        : new Fruit(fruit.x, fruit.y, fruit.points)
    ));
    this.powerUps = (level.powerUps || []).map((powerUp) => new PowerUp(powerUp.x, powerUp.y, powerUp.type));
    this.particleManager.clear();
    this.updateHud();
    return true;
  }

  nextLevel() {
    const nextLevelNumber = this.currentLevel + 1;
    if (!this.levelManager.hasLevel(nextLevelNumber)) return false;
    if (!this.loadLevel(nextLevelNumber)) return false;
    this.currentLevel = nextLevelNumber;
    this.state = GameState.PLAYING;
    this.hideOverlay();
    this.updateHud();
    return true;
  }

  startNextLevel() {
    return this.nextLevel();
  }

  completeBossStage() {
    this.state = GameState.VICTORY;
    this.audio?.playVictory?.();
    this.saveBestScore();
    this.persistLevelCompletion(3);
    this.updateHud();
    this.showOverlay(
      'Level 10 Victory!',
      `The Giant Pineapple / Rotten King is defeated. Stars: ★★★ | Fruits: ${this.levelCollectedFruitCount}/${this.levelFruitTotal} | Score: ${this.score} | Best: ${this.bestScore}`,
      'Play Again'
    );
  }

  resetPlayer() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.state = GameState.GAME_OVER;
      this.particleManager.clear();
      this.showOverlay(
        'Game Over',
        `You reached Level ${this.currentLevel} with ${this.score} points.`,
        'Play Again'
      );
      this.updateHud();
      return;
    }

    const level = this.levelManager.getLevel(this.currentLevel);
    if (!level) return;
    this.player = new Player(level.playerStart.x, level.playerStart.y, this.audio);
    this.updateHud();
  }

  triggerScreenShake(intensity, duration) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTime = Math.max(this.shakeTime, duration);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt) {
    this.particleManager.update(dt);
    this.shakeTime = Math.max(0, this.shakeTime - dt);
    if (this.shakeTime === 0) {
      this.shakeDuration = 0;
      this.shakeIntensity = 0;
    }
    if (this.state !== GameState.PLAYING) return;

    const previousPlayerY = this.player.y;
    for (const platform of this.platforms) {
      const wasStandingOnPlatform = (
        this.player.onGround &&
        previousPlayerY + this.player.h >= platform.y - 2 &&
        previousPlayerY + this.player.h <= platform.y + 2 &&
        this.player.x + this.player.w > platform.x &&
        this.player.x < platform.x + platform.w
      );
      platform.update(dt);
      if (wasStandingOnPlatform) {
        this.player.x += platform.deltaX;
        this.player.y += platform.deltaY;
      }
      if (platform.type === 'spring' && wasStandingOnPlatform && this.player.vy >= 0 && platform.triggerSpring(this.player)) {
        this.audio?.playSpring?.();
        this.particleManager.createSpringBurst(platform.x + platform.w / 2, platform.y);
        this.triggerScreenShake(2, 0.1);
      }
      if (platform.type === 'crumbling' && wasStandingOnPlatform && platform.isSolid()) {
        platform.beginCrumble();
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.alive) enemy.update(dt);
    }

    const previousPlayerBottom = this.player.y + this.player.h;
    const playerVerticalVelocity = this.player.vy;
    const activePlatforms = this.platforms.filter((platform) => platform.isSolid());
    this.player.update(this.input.keys, activePlatforms, { w: this.canvas.width, h: this.canvas.height });
    this.player.updatePowerUps(dt);
    for (const fruit of this.fruits) fruit.update(dt);
    for (const powerUp of this.powerUps) powerUp.update(dt);

    let wasHit = false;
    let bossDefeated = false;
    for (const enemy of this.enemies) {
      if (!enemy.hitsPlayer(this.player)) continue;
      const landedOnTop = (
        playerVerticalVelocity > 0 &&
        previousPlayerBottom <= enemy.y &&
        this.player.y + this.player.h >= enemy.y
      );

      if (landedOnTop) {
        this.player.y = enemy.y - this.player.h;
        this.player.vy = -JUMP_SPEED * 0.6;
        this.player.onGround = false;
        if (enemy.type === 'boss') {
          const bossCanTakeDamage = enemy.canTakeDamage();
          const defeated = enemy.damage(1);
          if (bossCanTakeDamage) {
            this.score += 25;
            this.audio?.playBossHit?.();
            this.particleManager.createBossHitBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            this.triggerScreenShake(3, 0.15);
          }
          if (defeated) bossDefeated = true;
        } else {
          enemy.stomp(this.audio);
          this.score += 15;
          this.levelScore += 15;
          this.particleManager.createStompBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h);
        }
        break;
      }

      if (this.player.consumeShield()) {
        this.player.vy = -JUMP_SPEED * 0.4;
        this.player.onGround = false;
        this.audio?.playDamage?.();
        this.triggerScreenShake(4, 0.2);
      } else {
        wasHit = true;
      }
      break;
    }

    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    if (bossDefeated) {
      this.score += 100;
      this.completeBossStage();
      return;
    }
    if (wasHit) {
      this.triggerScreenShake(4, 0.2);
      this.audio?.playDamage?.();
      this.resetPlayer();
      return;
    }

    for (const fruit of this.fruits) {
      if (!fruit.touches(this.player)) continue;
      const gained = fruit.collect();
      this.score += gained;
      this.levelScore += gained;
      this.levelCollectedFruitCount += 1;
      this.totalFruitsCollected += 1;
      this.persistProgress();
      this.audio?.playCollect?.(gained);
      this.particleManager.createFruitBurst(fruit.x, fruit.y, fruit.type === 'cherry' ? '#f94144' : '#ffd166');
    }
    this.fruits = this.fruits.filter((fruit) => !fruit.collected || fruit.effectTime < fruit.effectDuration);

    for (const powerUp of this.powerUps) {
      if (!powerUp.touches(this.player)) continue;
      powerUp.collect();
      this.player.enablePowerUp(powerUp.type);
      this.audio?.playCollect?.(10);
      this.particleManager.createFruitBurst(powerUp.x, powerUp.y, '#7bdff2');
    }
    this.powerUps = this.powerUps.filter((powerUp) => !powerUp.collected || powerUp.effectTime < powerUp.effectDuration);

    this.saveBestScore();
    this.updateHud();
    const level = this.levelManager.getLevel(this.currentLevel);
    if (!level || level.boss || this.levelScore < level.scoreGoal) return;

    const completionRatio = this.levelFruitTotal > 0 ? this.levelCollectedFruitCount / this.levelFruitTotal : 1;
    const elapsedSeconds = (performance.now() - this.levelStartTime) / 1000;
    const starRating = this.getStarRatingForLevel(this.currentLevel, elapsedSeconds, completionRatio);
    this.persistLevelCompletion(starRating);
    this.state = GameState.LEVEL_COMPLETE;
    this.showOverlay(
      'Level Clear',
      `Stars: ${'★'.repeat(starRating)}${'☆'.repeat(3 - starRating)} | Fruits: ${this.levelCollectedFruitCount}/${this.levelFruitTotal} | Score: ${this.score} | Best: ${this.bestScore}`,
      'Continue'
    );
    this.updateHud();
  }

  render() {
    this.drawBackground();
    if (this.state === GameState.START_MENU) return;

    this.ctx.save();
    if (this.shakeTime > 0) {
      const fade = this.shakeDuration > 0 ? this.shakeTime / this.shakeDuration : 0;
      const amount = this.shakeIntensity * fade;
      this.ctx.translate((Math.random() * 2 - 1) * amount, (Math.random() * 2 - 1) * amount);
    }
    for (const platform of this.platforms) platform.draw(this.ctx);
    for (const enemy of this.enemies) enemy.draw(this.ctx);
    for (const fruit of this.fruits) fruit.draw(this.ctx);
    for (const powerUp of this.powerUps) powerUp.draw(this.ctx);
    this.player?.draw(this.ctx);
    this.particleManager.render(this.ctx);
    this.ctx.restore();
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#8fcbe3');
    gradient.addColorStop(1, '#dff1e6');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (now) => {
      if (!this.running) return;
      if (this.lastTime === null) this.lastTime = now;
      const delta = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.accumulator += delta;
      while (this.accumulator >= this.step) {
        this.update(this.step);
        this.accumulator -= this.step;
      }
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
