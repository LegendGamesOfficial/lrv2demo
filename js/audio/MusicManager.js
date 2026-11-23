/**
 * Plays looping login music (assets/audio/music_login.mp3) and lobby music (assets/audio/music_lobby.mp3).
 */
export class MusicManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.currentKey = null;
    this._element = null;
  }

  _playKey(key) {
    if (this.currentKey === key && this._element && !this._element.paused) return;
    this.stop();
    const el = this.audio.getMusicElement(key);
    if (!el) return;
    this.currentKey = key;
    this._element = el;
    el.loop = true;
    el.volume = this.audio.getMusicVolume();
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay blocked until user gesture; AudioManager will retry on first interaction
      });
    }
  }

  playLoginMusic() {
    this._playKey('music_login');
  }

  playLobbyMusic() {
    this._playKey('music_lobby');
  }

  playTrack(trackName) {
    if (trackName === 'login' || trackName === 'menu') {
      this.playLoginMusic();
    } else if (trackName === 'lobby') {
      this.playLobbyMusic();
    } else {
      this.stop();
    }
  }

  updateVolume() {
    if (this._element) {
      this._element.volume = this.audio.getMusicVolume();
    }
  }

  stop() {
    if (this._element) {
      this._element.pause();
      this._element.currentTime = 0;
    }
    this.currentKey = null;
    this._element = null;
  }
}
