/**
 * Fruit Runner
 * A 2D HTML5 canvas platformer.
 * Boots the Game object and keeps the entry point minimal.
 */
import { Game } from './game.js';
import { AudioEngine } from './audio.js';

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Fruit Runner is missing required element #${id}.`);
  return element;
}

const canvas = requireElement('game');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Fruit Runner requires #game to be a canvas element.');
}
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Fruit Runner could not create a 2D canvas context.');
const hudScore = requireElement('hud-score');
const hudLevel = requireElement('hud-level');
const hudLives = requireElement('hud-lives');
const hudBestScore = requireElement('hud-best-score');
const hudBossHealth = requireElement('hud-boss-health');
const hudBossHealthBar = requireElement('boss-health-bar');
const hudBossHealthText = requireElement('boss-health-text');
const levelSelectGrid = requireElement('level-select-grid');
const startHighScore = requireElement('start-high-score');
const startFruitTotal = requireElement('start-fruit-total');
const resetSaveButton = requireElement('reset-save-progress');
const audioToggle = requireElement('audio-toggle');

const audio = new AudioEngine();

const game = new Game({
  canvas,
  ctx,
  hudScore,
  hudLevel,
  hudLives,
  hudBestScore,
  hudBossHealth,
  hudBossHealthBar,
  hudBossHealthText,
  levelSelectGrid,
  startHighScore,
  startFruitTotal,
  resetSaveButton,
  audio,
  audioToggle,
});

game.start();
