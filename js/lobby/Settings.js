import { Config } from '../core/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Manages graphics, FOV, sensitivity, audio volume settings, account logout,
 * and the Developer Camera Mode settings section.
 */
export class Settings {
  constructor(saveManager, audioManager, onLogout) {
    this.saveManager = saveManager;
    this.audio = audioManager;
    this.onLogout = onLogout;
    this.values = this.saveManager.loadSettings();
    this.devCameraEnabled = this._loadDevFlag();
    this.audio.applySettings(this.values);
    this._bindInputs();
  }

  _loadDevFlag() {
    try { return localStorage.getItem(Config.DEV_MODE_KEY) === 'true'; } catch (e) { return false; }
  }

  _saveDevFlag(val) {
    this.devCameraEnabled = !!val;
    try { localStorage.setItem(Config.DEV_MODE_KEY, String(this.devCameraEnabled)); } catch (e) {}
    eventBus.emit('devcam:toggled', this.devCameraEnabled);
  }

  _bindInputs() {
    const bindRange = (id, key, labelId, pct = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = this.values[key];
      const lbl = document.getElementById(labelId);
      if (lbl) lbl.textContent = pct ? `${Math.round(this.values[key] * 100)}%` : this.values[key];

      el.addEventListener('input', (e) => {
        this.values[key] = Number(e.target.value);
        if (lbl) lbl.textContent = pct ? `${Math.round(this.values[key] * 100)}%` : this.values[key];
        this.audio.applySettings(this.values);
        this.saveManager.saveSettings(this.values);
        eventBus.emit('settings:changed', this.values);
      });
    };

    const qEl = document.getElementById('set-quality');
    if (qEl) {
      qEl.value = this.values.quality;
      qEl.addEventListener('change', (e) => {
        this.values.quality = e.target.value;
        this.saveManager.saveSettings(this.values);
        eventBus.emit('settings:changed', this.values);
      });
    }

    bindRange('set-fov', 'fov', 'set-fov-val');
    bindRange('set-sens', 'sensitivity', 'set-sens-val');
    bindRange('set-master-vol', 'masterVolume', 'set-master-vol-val', true);
    bindRange('set-music-vol', 'musicVolume', 'set-music-vol-val', true);
    bindRange('set-sfx-vol', 'sfxVolume', 'set-sfx-vol-val', true);

    const muteBtn = document.getElementById('btn-toggle-mute');
    if (muteBtn) {
      muteBtn.textContent = this.values.muted ? 'UNMUTE ALL AUDIO' : 'MUTE ALL AUDIO';
      muteBtn.addEventListener('click', () => {
        this.values.muted = !this.values.muted;
        this.audio.applySettings(this.values);
        this.saveManager.saveSettings(this.values);
        muteBtn.textContent = this.values.muted ? 'UNMUTE ALL AUDIO' : 'MUTE ALL AUDIO';
      });
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.audio.sfx.click();
        this.onLogout();
      });
    }

    // Developer Camera Mode Controls in Settings
    const devStatus = document.getElementById('dev-cam-status');
    const updateDevStatus = () => {
      if (devStatus) devStatus.textContent = this.devCameraEnabled ? 'ENABLED (Active in Match)' : 'DISABLED';
    };
    updateDevStatus();

    const enBtn = document.getElementById('btn-devcam-enable');
    if (enBtn) enBtn.addEventListener('click', () => { this._saveDevFlag(true); updateDevStatus(); });

    const disBtn = document.getElementById('btn-devcam-disable');
    if (disBtn) disBtn.addEventListener('click', () => { this._saveDevFlag(false); updateDevStatus(); });

    const openCinBtn = document.getElementById('btn-devcam-open-panel');
    if (openCinBtn) openCinBtn.addEventListener('click', () => eventBus.emit('devcam:openPanel'));

    const resetCamBtn = document.getElementById('btn-devcam-reset');
    if (resetCamBtn) resetCamBtn.addEventListener('click', () => eventBus.emit('devcam:reset'));

    const restoreBtn = document.getElementById('btn-devcam-restore');
    if (restoreBtn) restoreBtn.addEventListener('click', () => {
      this._saveDevFlag(false);
      updateDevStatus();
      eventBus.emit('devcam:restorePlayer');
    });
  }

  renderAccount(profile) {
    const el = document.getElementById('set-acc-name');
    if (el) el.textContent = profile ? `${profile.displayName} (Lvl ${profile.level})` : 'Guest';
  }
}
