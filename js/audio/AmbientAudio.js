/**
 * Synthesizes subtle wind ambience and storm-edge rumble.
 */
export class AmbientAudio {
  constructor(audioManager) {
    this.audio = audioManager;
    this._timer = null;
    this._active = false;
    this.inStorm = false;
  }

  start() {
    if (this._active) return;
    this._active = true;
    this._timer = setInterval(() => {
      if (!this._active) return;
      if (this.inStorm) {
        this.audio.playNoise(0.45, 0.12, 'ambient');
        this.audio.playTone(68, 0.4, 'sine', 0.08, 'ambient', 55);
      } else {
        this.audio.playNoise(0.35, 0.03, 'ambient');
      }
    }, 650);
  }

  stop() {
    this._active = false;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
