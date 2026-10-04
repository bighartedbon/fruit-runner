export class AudioEngine {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.masterGain = null;
  }

  ensureContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;

    if (!this.context) {
      this.context = new AudioCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.enabled ? 0.8 : 0;
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }

    return this.context;
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!this.context || !this.masterGain) return;
    const target = enabled ? 0.8 : 0;
    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(target, now, 0.02);
  }

  toggle() {
    const nextState = !this.enabled;
    this.setEnabled(nextState);
    return nextState;
  }

  _playTone({
    frequency = 440,
    start = 0,
    duration = 0.08,
    type = 'square',
    volume = 0.03,
    sweep = 0,
    slideTo = null,
    frequencyCurve = null,
    attack = 0.01,
  } = {}) {
    const context = this.ensureContext();
    if (!context || !this.enabled) return;

    const now = context.currentTime + start;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;

    if (frequencyCurve?.length > 1) {
      oscillator.frequency.setValueCurveAtTime(Float32Array.from(frequencyCurve), now, duration);
    } else {
      oscillator.frequency.setValueAtTime(frequency, now);
      if (slideTo) {
        oscillator.frequency.linearRampToValueAtTime(slideTo, now + duration);
      } else if (sweep) {
        oscillator.frequency.linearRampToValueAtTime(frequency + sweep, now + duration);
      }
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(this.masterGain || context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  _playNoiseBurst({ duration = 0.12, volume = 0.04, start = 0 } = {}) {
    const context = this.ensureContext();
    if (!context || !this.enabled) return;

    const now = context.currentTime + start;
    const buffer = context.createBuffer(1, Math.ceil(duration * context.sampleRate), context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const envelope = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(gain);
    gain.connect(this.masterGain || context.destination);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  playJump() {
    this._playTone({
      frequency: 150,
      duration: 0.15,
      type: 'square',
      volume: 0.03,
      slideTo: 400,
    });
  }

  playDoubleJump() {
    this._playTone({
      frequency: 420,
      duration: 0.13,
      type: 'triangle',
      volume: 0.035,
      slideTo: 760,
      attack: 0.004,
    });
  }

  playCollect(points = 5) {
    const notes = points >= 10 ? [784, 988] : [523, 659];
    for (const [index, frequency] of notes.entries()) {
      this._playTone({
        frequency,
        duration: 0.11,
        start: index * 0.09,
        type: 'sine',
        volume: 0.03,
        slideTo: frequency * 1.04,
        attack: 0.005,
      });
    }
  }

  playStomp() {
    this._playNoiseBurst({ duration: 0.1, volume: 0.035 });
    this._playTone({
      frequency: 300,
      duration: 0.16,
      type: 'square',
      volume: 0.035,
      slideTo: 80,
      attack: 0.003,
    });
  }

  playSpring() {
    this._playTone({
      frequency: 260,
      duration: 0.24,
      type: 'triangle',
      volume: 0.03,
      frequencyCurve: [260, 460, 330, 560, 430],
    });
  }

  playBossHit() {
    this._playTone({
      frequency: 200,
      duration: 0.2,
      type: 'sawtooth',
      volume: 0.04,
      slideTo: 60,
      attack: 0.005,
    });
  }

  playDamage() {
    this._playNoiseBurst({ duration: 0.16, volume: 0.045 });
    this._playTone({
      frequency: 180,
      duration: 0.22,
      type: 'sawtooth',
      volume: 0.035,
      slideTo: 55,
      attack: 0.003,
    });
  }

  playVictory() {
    for (const [index, frequency] of [523, 659, 784, 1047].entries()) {
      this._playTone({
        frequency,
        start: index * 0.09,
        duration: 0.16,
        type: 'square',
        volume: 0.025,
        attack: 0.005,
      });
    }
  }
}
