/**
 * Triggers repository MP3 sound effects via AudioManager with rate limiting and overlap caps.
 */
export class SoundEffects {
  constructor(audioManager) {
    this.audio = audioManager;
    this._lastHoverAt = 0;
  }

  click() { this.audio.playSFX('ui_click', { volumeScale: 0.7, minIntervalMs: 40 }); }
  hover() {
    const now = performance.now();
    if (now - this._lastHoverAt < 140) return;
    this._lastHoverAt = now;
    this.audio.playSFX('ui_click', { volumeScale: 0.28, minIntervalMs: 140 });
  }
  ready() { this.audio.playSFX('ui_click', { volumeScale: 0.9 }); }

  shoot(weaponId = '') {
    if (weaponId.includes('shotgun')) this.audio.playSFX('weapon_shotgun_fire', { minIntervalMs: 80 });
    else if (weaponId.includes('sniper')) this.audio.playSFX('weapon_sniper_fire', { minIntervalMs: 120 });
    else if (weaponId.includes('smg') || weaponId.includes('pistol')) this.audio.playSFX('weapon_smg_fire', { minIntervalMs: 45 });
    else this.audio.playSFX('weapon_rifle_fire', { minIntervalMs: 65 });
  }

  reload() { this.audio.playSFX('weapon_reload', { minIntervalMs: 250 }); }
  empty() { this.audio.playSFX('weapon_empty', { minIntervalMs: 180 }); }
  footstep() { this.audio.playSFX('player_footsteps', { volumeScale: 0.55, minIntervalMs: 180 }); }
  jump() { this.audio.playSFX('player_footsteps', { volumeScale: 0.65, minIntervalMs: 120 }); }
  land() { this.audio.playSFX('player_footsteps', { volumeScale: 0.85, minIntervalMs: 120 }); }
  hit() { this.audio.playSFX('player_damage', { volumeScale: 0.55, minIntervalMs: 60 }); }
  damage() { this.audio.playSFX('player_damage', { volumeScale: 0.85, minIntervalMs: 140 }); }
  elimination() { this.audio.playSFX('player_elimination', { volumeScale: 0.95, minIntervalMs: 120 }); }
  build() { this.audio.playSFX('build_place', { minIntervalMs: 55 }); }
  buildEdit() { this.audio.playSFX('build_edit', { minIntervalMs: 80 }); }
  buildDestroy() { this.audio.playSFX('build_destroy', { minIntervalMs: 80 }); }
  pickup() { this.audio.playSFX('item_pickup', { minIntervalMs: 60 }); }
  chest() { this.audio.playSFX('chest_open', { minIntervalMs: 120 }); }
  heal() { this.audio.playSFX('heal_use', { minIntervalMs: 200 }); }
  bounce() { this.audio.playSFX('build_place', { volumeScale: 0.85, minIntervalMs: 100 }); }
  explosion() { this.audio.playSFX('weapon_shotgun_fire', { volumeScale: 1.0, minIntervalMs: 120 }); }
  stormWarning() { this.audio.playSFX('storm_warning', { minIntervalMs: 1000 }); }
  emote() { this.audio.playSFX('ui_click', { volumeScale: 0.65, minIntervalMs: 100 }); }
}
