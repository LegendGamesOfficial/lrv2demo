import { CameraPresets } from './CameraPresets.js';

/**
 * Compact Developer Cinematic Control Panel for recording trailers and gameplay footage.
 */
export class CinematicControls {
  constructor({ devCam, cinEnv, botStaging, charShowcase, botDebug, assetManager, player, stormManager, pois, onExitDevCam }) {
    this.devCam = devCam;
    this.cinEnv = cinEnv;
    this.botStaging = botStaging;
    this.charShowcase = charShowcase;
    this.botDebug = botDebug;
    this.assetManager = assetManager;
    this.player = player;
    this.stormManager = stormManager;
    this.pois = pois;
    this.onExitDevCam = onExitDevCam;

    this.panel = document.getElementById('dev-cinematic-panel');
    this.hudLayer = document.querySelector('.hud-layer');
    this.savedPose = null;
    this.timeScale = 1.0;
    this.hudHidden = false;
    this.uiHidden = false;

    this._populateDropdowns();
    this._bindEvents();
  }

  _populateDropdowns() {
    const skinSel = document.getElementById('dev-skin-select');
    if (skinSel) {
      skinSel.innerHTML = '';
      this.assetManager.data.items.filter((i) => i.type === 'skin').forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        skinSel.appendChild(opt);
      });
    }
    const emSel = document.getElementById('dev-emote-select');
    if (emSel) {
      emSel.innerHTML = '';
      this.assetManager.data.items.filter((i) => i.type === 'emote').forEach((e) => {
        const opt = document.createElement('option');
        opt.value = e.anim;
        opt.textContent = e.name;
        emSel.appendChild(opt);
      });
    }
  }

  _bindEvents() {
    const byId = (id) => document.getElementById(id);

    byId('dev-cam-speed').oninput = (e) => {
      this.devCam.speed = Number(e.target.value);
      byId('dev-cam-speed-val').textContent = e.target.value;
    };
    byId('dev-cam-fov').oninput = (e) => {
      this.devCam.fov = Number(e.target.value);
      byId('dev-cam-fov-val').textContent = e.target.value;
    };
    byId('dev-cam-smooth').oninput = (e) => {
      this.devCam.smoothing = Number(e.target.value);
    };
    byId('dev-time-scale').oninput = (e) => {
      this.timeScale = Number(e.target.value);
      byId('dev-time-scale-val').textContent = `${this.timeScale.toFixed(2)}x`;
    };

    byId('dev-btn-hide-hud').onclick = () => {
      this.hudHidden = !this.hudHidden;
      if (this.hudLayer) this.hudLayer.classList.toggle('hidden', this.hudHidden);
      byId('dev-btn-hide-hud').textContent = this.hudHidden ? 'RESTORE HUD' : 'HIDE HUD';
    };

    byId('dev-btn-hide-ui').onclick = () => {
      this.uiHidden = !this.uiHidden;
      this.panel.classList.toggle('hidden', this.uiHidden);
    };

    byId('dev-btn-save-cam').onclick = () => { this.savedPose = this.devCam.getPose(); };
    byId('dev-btn-load-cam').onclick = () => { if (this.savedPose) this.devCam.flyTo(this.savedPose, false); };
    byId('dev-btn-reset-cam').onclick = () => { this.devCam.flyTo(CameraPresets.getPreset('Island Overview', this.player, this.stormManager, this.pois), true); };
    byId('dev-btn-restore-player').onclick = () => this.onExitDevCam();

    byId('dev-preset-select').onchange = (e) => {
      if (!e.target.value) return;
      this.devCam.flyTo(CameraPresets.getPreset(e.target.value, this.player, this.stormManager, this.pois), false);
    };

    byId('dev-env-select').onchange = (e) => {
      if (e.target.value === 'Default') this.cinEnv.reset();
      else this.cinEnv.applyPreset(e.target.value);
    };
    byId('dev-btn-reset-env').onclick = () => this.cinEnv.reset();

    byId('dev-btn-spawn-bots').onclick = () => {
      const cnt = Number(byId('dev-bot-count').value || 6);
      this.botStaging.spawnNearCamera(cnt, this.devCam);
    };
    byId('dev-btn-bot-battle').onclick = () => this.botStaging.encourageBattle();
    byId('dev-btn-bot-move').onclick = () => this.botStaging.commandMoveTo(this.devCam.x, this.devCam.z);
    byId('dev-btn-bot-pause').onclick = () => {
      const paused = this.botStaging.togglePause();
      byId('dev-btn-bot-pause').textContent = paused ? 'RESUME AI' : 'PAUSE AI';
    };
    byId('dev-btn-bot-clear').onclick = () => this.botStaging.removeStaged();

    byId('dev-btn-bot-debug').onclick = () => {
      this.botDebug.setEnabled(!this.botDebug.enabled);
      byId('dev-btn-bot-debug').textContent = this.botDebug.enabled ? 'BOT DEBUG: ON' : 'BOT DEBUG: OFF';
    };

    byId('dev-skin-select').onchange = (e) => this.charShowcase.applySkin(e.target.value);
    byId('dev-btn-rot-char').onclick = () => this.charShowcase.rotateCharacter(Math.PI / 4);
    byId('dev-btn-play-emote').onclick = () => this.charShowcase.playEmote(byId('dev-emote-select').value);
  }

  show() { if (this.panel) this.panel.classList.remove('hidden'); }
  hide() {
    if (this.panel) this.panel.classList.add('hidden');
    if (this.hudHidden && this.hudLayer) {
      this.hudHidden = false;
      this.hudLayer.classList.remove('hidden');
    }
  }
}
