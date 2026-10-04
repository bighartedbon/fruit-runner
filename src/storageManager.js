const SAVE_KEY = 'fruit-runner-save-v1';
const LEGACY_SCORE_KEY = 'fruit-runner-best-score';
const LEGACY_STARS_KEY = 'fruit-runner-level-stars';
const MAX_LEVEL = 10;

export const DEFAULT_SAVE_DATA = Object.freeze({
  highestLevelUnlocked: 1,
  highScore: 0,
  levelStars: Object.freeze({}),
  totalFruitsCollected: 0,
  audioMuted: false,
});

function freshDefaults() {
  return {
    highestLevelUnlocked: DEFAULT_SAVE_DATA.highestLevelUnlocked,
    highScore: DEFAULT_SAVE_DATA.highScore,
    levelStars: {},
    totalFruitsCollected: DEFAULT_SAVE_DATA.totalFruitsCollected,
    audioMuted: DEFAULT_SAVE_DATA.audioMuted,
  };
}

function nonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function normalizeData(data) {
  const defaults = freshDefaults();
  if (!data || typeof data !== 'object' || Array.isArray(data)) return defaults;

  const stars = {};
  if (data.levelStars && typeof data.levelStars === 'object' && !Array.isArray(data.levelStars)) {
    for (const [level, value] of Object.entries(data.levelStars)) {
      const levelNumber = Number(level);
      if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > MAX_LEVEL) continue;
      stars[levelNumber] = Math.min(3, nonNegativeInteger(value));
    }
  }

  return {
    highestLevelUnlocked: Math.min(MAX_LEVEL, Math.max(1, nonNegativeInteger(data.highestLevelUnlocked, 1))),
    highScore: nonNegativeInteger(data.highScore),
    levelStars: stars,
    totalFruitsCollected: nonNegativeInteger(data.totalFruitsCollected),
    audioMuted: data.audioMuted === true,
  };
}

function getStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function loadLegacyData(storage) {
  let highScore = 0;
  let levelStars = {};

  try {
    highScore = nonNegativeInteger(storage.getItem(LEGACY_SCORE_KEY));
  } catch {
    // Legacy values are optional.
  }

  try {
    const parsed = JSON.parse(storage.getItem(LEGACY_STARS_KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) levelStars = parsed;
  } catch {
    // Legacy values are optional.
  }

  const highestCompleted = Object.keys(levelStars)
    .map(Number)
    .filter((level) => Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL)
    .reduce((highest, level) => Math.max(highest, level), 0);

  return normalizeData({
    highestLevelUnlocked: Math.min(MAX_LEVEL, Math.max(1, highestCompleted + 1)),
    highScore,
    levelStars,
    totalFruitsCollected: 0,
    audioMuted: false,
  });
}

export function loadData(storage) {
  const target = getStorage(storage);
  if (!target) return freshDefaults();

  try {
    const raw = target.getItem(SAVE_KEY);
    if (raw !== null) return normalizeData(JSON.parse(raw));
    return loadLegacyData(target);
  } catch {
    return freshDefaults();
  }
}

export function saveData(data, storage) {
  const target = getStorage(storage);
  if (!target) return false;

  try {
    target.setItem(SAVE_KEY, JSON.stringify(normalizeData(data)));
    return true;
  } catch {
    return false;
  }
}

export function resetData(storage) {
  const target = getStorage(storage);
  if (!target) return false;

  try {
    target.removeItem(SAVE_KEY);
    target.removeItem(LEGACY_SCORE_KEY);
    target.removeItem(LEGACY_STARS_KEY);
    return true;
  } catch {
    return false;
  }
}
