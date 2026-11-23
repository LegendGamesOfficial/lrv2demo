import { Config } from '../core/Config.js';

/**
 * Handles localStorage persistence for accounts (preserving lr_accounts_v1) and settings.
 */
export class SaveManager {
  loadAccount(baseAccount) {
    try {
      const saved = JSON.parse(localStorage.getItem(Config.STORAGE_KEY) || '{}');
      if (saved[baseAccount.username]) {
        return JSON.parse(JSON.stringify(saved[baseAccount.username]));
      }
    } catch (e) {
      console.warn('[SaveManager] Failed to read account from localStorage', e);
    }
    return JSON.parse(JSON.stringify(baseAccount));
  }

  saveAccount(profile) {
    if (!profile || profile.isGuest) return;
    try {
      const saved = JSON.parse(localStorage.getItem(Config.STORAGE_KEY) || '{}');
      saved[profile.username] = profile;
      localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.warn('[SaveManager] Failed to save account to localStorage', e);
    }
  }

  loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(Config.SETTINGS_KEY) || 'null');
      if (raw) return { ...Config.DEFAULT_SETTINGS, ...raw };
    } catch (e) {}
    return { ...Config.DEFAULT_SETTINGS };
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(Config.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }
}
