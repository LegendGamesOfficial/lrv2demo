import { Config } from '../core/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Captures keyboard & mouse pointer-lock input with Building (Q/F/V/C/R/G),
 * Inventory (I), Map (M), Emote (B), and Combat/Movement keybinds.
 */
export class PlayerController {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;
    this.keys = new Set();
    this.mouseDownL = false;
    this.mouseDownR = false;
    this.pointerLocked = false;
    this._bound = false;
    this._handlers = {};
  }

  bind(player, callbacks) {
    if (this._bound) this.unbind();
    this._bound = true;

    this._handlers.keydown = (e) => {
      const k = e.key.toLowerCase();
      this.keys.add(k);

      if (callbacks.isDevCamActive && callbacks.isDevCamActive()) return;

      if (k === Config.DEFAULT_KEYBINDS.mapToggle) {
        callbacks.onToggleMap();
        return;
      }
      if (k === Config.DEFAULT_KEYBINDS.emoteWheel) {
        callbacks.onToggleEmoteWheel();
        return;
      }
      if (k === Config.DEFAULT_KEYBINDS.inventory && callbacks.onToggleInventory) {
        callbacks.onToggleInventory();
        return;
      }
      if (k === Config.DEFAULT_KEYBINDS.editBuild) {
        callbacks.onEditBuild();
        return;
      }
      if (callbacks.isOverlayOpen()) return;

      if (k === Config.DEFAULT_KEYBINDS.crouch) {
        player.crouch = !player.crouch;
      } else if (k === Config.DEFAULT_KEYBINDS.wall) {
        callbacks.onSelectBuildPiece('wall');
      } else if (k === Config.DEFAULT_KEYBINDS.floor) {
        callbacks.onSelectBuildPiece('floor');
      } else if (k === Config.DEFAULT_KEYBINDS.ramp) {
        callbacks.onSelectBuildPiece('stairs');
      } else if (k === Config.DEFAULT_KEYBINDS.cone) {
        callbacks.onSelectBuildPiece('cone');
      } else if (k === Config.DEFAULT_KEYBINDS.rotate) {
        callbacks.onRotateOrReload();
      } else if (k === Config.DEFAULT_KEYBINDS.interact) {
        callbacks.onInteract();
      } else if (k === ' ' && callbacks.canDeployGlider()) {
        player.setGliding(true);
      } else if (['1', '2', '3', '4', '5'].includes(k)) {
        callbacks.onNumberKey(Number(k) - 1);
      }
    };

    this._handlers.keyup = (e) => this.keys.delete(e.key.toLowerCase());

    this._handlers.click = () => {
      if (!callbacks.isOverlayOpen() && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock && this.canvas.requestPointerLock();
      }
    };

    this._handlers.pointerlock = () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    };

    this._handlers.mousemove = (e) => {
      if (!this.pointerLocked || callbacks.isOverlayOpen()) return;
      if (callbacks.isDevCamActive && callbacks.isDevCamActive()) return;
      const sens = (this.settings.sensitivity || 1.0) * 0.0022;
      player.yaw -= e.movementX * sens;
      player.pitch = Math.max(-1.2, Math.min(1.1, player.pitch - e.movementY * sens));
    };

    this._handlers.mousedown = (e) => {
      if (callbacks.isOverlayOpen()) return;
      if (callbacks.isDevCamActive && callbacks.isDevCamActive()) return;
      if (e.button === 0) {
        this.mouseDownL = true;
        callbacks.onPrimaryAction();
      } else if (e.button === 2) {
        this.mouseDownR = true;
        callbacks.onSecondaryAction(true);
      }
    };

    this._handlers.mouseup = (e) => {
      if (e.button === 0) this.mouseDownL = false;
      if (e.button === 2) {
        this.mouseDownR = false;
        callbacks.onSecondaryAction(false);
      }
    };

    this._handlers.contextmenu = (e) => e.preventDefault();

    window.addEventListener('keydown', this._handlers.keydown);
    window.addEventListener('keyup', this._handlers.keyup);
    this.canvas.addEventListener('click', this._handlers.click);
    document.addEventListener('pointerlockchange', this._handlers.pointerlock);
    window.addEventListener('mousemove', this._handlers.mousemove);
    window.addEventListener('mousedown', this._handlers.mousedown);
    window.addEventListener('mouseup', this._handlers.mouseup);
    window.addEventListener('contextmenu', this._handlers.contextmenu);
  }

  getMovementInput(disabled = false) {
    if (disabled) return { forward: 0, strafe: 0, jump: false, sprint: false };
    const f = (this.keys.has('w') ? 1 : 0) - (this.keys.has('s') ? 1 : 0);
    const s = (this.keys.has('d') ? 1 : 0) - (this.keys.has('a') ? 1 : 0);
    return {
      forward: f,
      strafe: s,
      jump: this.keys.has(' '),
      sprint: this.keys.has('shift')
    };
  }

  unbind() {
    if (!this._bound) return;
    window.removeEventListener('keydown', this._handlers.keydown);
    window.removeEventListener('keyup', this._handlers.keyup);
    this.canvas.removeEventListener('click', this._handlers.click);
    document.removeEventListener('pointerlockchange', this._handlers.pointerlock);
    window.removeEventListener('mousemove', this._handlers.mousemove);
    window.removeEventListener('mousedown', this._handlers.mousedown);
    window.removeEventListener('mouseup', this._handlers.mouseup);
    window.removeEventListener('contextmenu', this._handlers.contextmenu);
    this.keys.clear();
    this.mouseDownL = false;
    this.mouseDownR = false;
    this._bound = false;
    eventBus.emit('controller:unbound');
  }
}
