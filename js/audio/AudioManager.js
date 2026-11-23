import { AUDIO_MANIFEST } from './AudioManifest.js';
import { MusicManager } from './MusicManager.js';
import { SoundEffects } from './SoundEffects.js';

/**
 * Centralized MP3 AudioManager for GitHub Pages.
 * Preloads repository MP3s, handles missing files gracefully with explicit developer warnings,
 * enforces overlap limits, separates Music & SFX volumes, and handles browser autoplay rules.
 */
export class AudioManager {
  constructor() {
    this.muted = false;
    this.volumes = {
      master: 0.7,
      music: 0.45,
      sfx: 0.75
    };
    this._buffers = new Map();
    this._activeInstances = new Map();
    this._lastPlayTime = new Map();
    this._warnedMissing = new Set();
    this._unlocked = false;

    this.music = new MusicManager(this);
    this.sfx = new SoundEffects(this);
    this.ambient = { inStorm: false, start() {}, stop() {} };

    this.preloadAll();
    this._bindUnlock();
  }

  preloadAll() {
    const entries = [...AUDIO_MANIFEST.music, ...AUDIO_MANIFEST.sfx];
    for (const entry of entries) {
      this._preloadEntry(entry);
    }
  }

  _preloadEntry(entry) {
    if (typeof Audio === 'undefined') {
      this._buffers.set(entry.key, { template: null, missing: true, file: entry.file });
      return;
    }
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = entry.file;
    const record = { template: audio, missing: false, file: entry.file };
    audio.addEventListener('error', () => {
      record.missing = true;
      this._warnMissing(entry.file);
    }, { once: true });
    this._buffers.set(entry.key, record);
    this._activeInstances.set(entry.key, new Set());
  }

  _warnMissing(filePath) {
    if (this._warnedMissing.has(filePath)) return;
    this._warnedMissing.add(filePath);
    console.warn(`[AudioManager] Missing audio file: "${filePath}". Add this MP3 to your repository to enable this sound.`);
  }

  _bindUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this._unlocked = true;
      if ((this.music.currentKey === 'music_lobby' || this.music.currentKey === 'music_login') && this.music._element && this.music._element.paused) {
        this.music._element.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  applySettings(settings) {
    this.volumes.master = settings.masterVolume ?? 0.7;
    this.volumes.music = settings.musicVolume ?? 0.45;
    this.volumes.sfx = settings.sfxVolume ?? 0.75;
    this.muted = !!settings.muted;
    this.music.updateVolume();
  }

  getMusicVolume() {
    return this.muted ? 0 : Math.max(0, Math.min(1, this.volumes.master * this.volumes.music));
  }

  getSFXVolume(scale = 1) {
    return this.muted ? 0 : Math.max(0, Math.min(1, this.volumes.master * this.volumes.sfx * scale));
  }

  getMusicElement(key) {
    const rec = this._buffers.get(key);
    if (!rec || rec.missing || !rec.template) {
      if (rec) this._warnMissing(rec.file);
      return null;
    }
    return rec.template;
  }

  playSFX(key, { volumeScale = 1, minIntervalMs = 50, maxOverlap = 4 } = {}) {
    const vol = this.getSFXVolume(volumeScale);
    if (vol <= 0.001) return;

    const rec = this._buffers.get(key);
    if (!rec || rec.missing || !rec.template) {
      if (rec) this._warnMissing(rec.file);
      return;
    }

    const now = performance.now();
    const last = this._lastPlayTime.get(key) || 0;
    if (now - last < minIntervalMs) return;
    this._lastPlayTime.set(key, now);

    const activeSet = this._activeInstances.get(key);
    if (activeSet && activeSet.size >= maxOverlap) return;

    const inst = rec.template.cloneNode();
    inst.volume = vol;
    if (activeSet) activeSet.add(inst);

    const cleanup = () => {
      if (activeSet) activeSet.delete(inst);
    };
    inst.addEventListener('ended', cleanup, { once: true });
    inst.addEventListener('error', () => {
      cleanup();
      rec.missing = true;
      this._warnMissing(rec.file);
    }, { once: true });

    const p = inst.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => cleanup());
    }
  }

  dispose() {
    this.music.stop();
    for (const set of this._activeInstances.values()) {
      for (const el of set) {
        el.pause();
        el.src = '';
      }
      set.clear();
    }
  }
}

export const audioManager = new AudioManager();
