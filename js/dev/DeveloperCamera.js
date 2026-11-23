import { MathUtils } from '../utils/MathUtils.js';

/**
 * Developer-only free-fly camera for trailers and cinematic capture.
 * Completely detached from player physics; never moves the player.
 */
export class DeveloperCamera {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.enabled = false;

    this.x = 0;
    this.y = 65;
    this.z = 160;
    this.yaw = 0;
    this.pitch = -0.35;
    this.speed = 32;
    this.fov = 70;
    this.smoothing = 14;

    this._target = null; // Smooth transition target { x, y, z, yaw, pitch }
    this.keys = new Set();
    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;
    this._bound = false;
    this._handlers = {};
  }

  enable(startPos = null) {
    this.enabled = true;
    if (startPos) {
      this.x = startPos.x;
      this.y = startPos.y;
      this.z = startPos.z;
    } else if (this.camera) {
      this.x = this.camera.position.x;
      this.y = this.camera.position.y + 4;
      this.z = this.camera.position.z;
    }
    this._target = null;
    this._bind();
  }

  disable() {
    this.enabled = false;
    this._target = null;
    this._unbind();
  }

  flyTo(pose, instant = false) {
    if (instant) {
      this.x = pose.x; this.y = pose.y; this.z = pose.z;
      this.yaw = pose.yaw; this.pitch = pose.pitch;
      this._target = null;
    } else {
      this._target = { ...pose };
    }
  }

  getPose() {
    return { x: this.x, y: this.y, z: this.z, yaw: this.yaw, pitch: this.pitch };
  }

  _bind() {
    if (this._bound) return;
    this._bound = true;

    this._handlers.keydown = (e) => {
      if (!this.enabled) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (k === 'escape' && this.onExit) {
        this.onExit();
      }
    };
    this._handlers.keyup = (e) => this.keys.delete(e.key.toLowerCase());
    this._handlers.mousedown = (e) => {
      if (!this.enabled || e.target !== this.canvas) return;
      this._dragging = true;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    };
    this._handlers.mouseup = () => { this._dragging = false; };
    this._handlers.mousemove = (e) => {
      if (!this.enabled) return;
      const locked = document.pointerLockElement === this.canvas;
      if (!locked && !this._dragging) return;
      const dx = locked ? e.movementX : (e.clientX - this._lastX);
      const dy = locked ? e.movementY : (e.clientY - this._lastY);
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      this._target = null;
      this.yaw -= dx * 0.0025;
      this.pitch = MathUtils.clamp(this.pitch - dy * 0.0025, -1.5, 1.5);
    };
    this._handlers.wheel = (e) => {
      if (!this.enabled || e.target !== this.canvas) return;
      this.speed = MathUtils.clamp(this.speed - e.deltaY * 0.03, 4, 140);
    };

    window.addEventListener('keydown', this._handlers.keydown);
    window.addEventListener('keyup', this._handlers.keyup);
    window.addEventListener('mousedown', this._handlers.mousedown);
    window.addEventListener('mouseup', this._handlers.mouseup);
    window.addEventListener('mousemove', this._handlers.mousemove);
    window.addEventListener('wheel', this._handlers.wheel, { passive: true });
  }

  _unbind() {
    if (!this._bound) return;
    window.removeEventListener('keydown', this._handlers.keydown);
    window.removeEventListener('keyup', this._handlers.keyup);
    window.removeEventListener('mousedown', this._handlers.mousedown);
    window.removeEventListener('mouseup', this._handlers.mouseup);
    window.removeEventListener('mousemove', this._handlers.mousemove);
    window.removeEventListener('wheel', this._handlers.wheel);
    this.keys.clear();
    this._dragging = false;
    this._bound = false;
  }

  update(dt) {
    if (!this.enabled || !this.camera) return;

    this.camera.fov = MathUtils.damp(this.camera.fov, this.fov, 10, dt);
    this.camera.updateProjectionMatrix();

    if (this._target) {
      const lam = Math.max(2, this.smoothing * 0.4);
      this.x = MathUtils.damp(this.x, this._target.x, lam, dt);
      this.y = MathUtils.damp(this.y, this._target.y, lam, dt);
      this.z = MathUtils.damp(this.z, this._target.z, lam, dt);
      this.yaw = MathUtils.lerpAngle(this.yaw, this._target.yaw, 1 - Math.exp(-lam * dt));
      this.pitch = MathUtils.damp(this.pitch, this._target.pitch, lam, dt);
      if (MathUtils.dist3D(this.x, this.y, this.z, this._target.x, this._target.y, this._target.z) < 0.4) {
        this._target = null;
      }
    }

    const fwd = (this.keys.has('w') ? 1 : 0) - (this.keys.has('s') ? 1 : 0);
    const str = (this.keys.has('d') ? 1 : 0) - (this.keys.has('a') ? 1 : 0);
    const up = (this.keys.has(' ') ? 1 : 0) - (this.keys.has('control') ? 1 : 0);
    const mult = this.keys.has('shift') ? 2.4 : 1.0;

    if (fwd !== 0 || str !== 0 || up !== 0) {
      this._target = null;
      const spd = this.speed * mult * dt;
      const fx = -Math.sin(this.yaw);
      const fz = -Math.cos(this.yaw);
      const rx = Math.cos(this.yaw);
      const rz = -Math.sin(this.yaw);
      this.x += (fx * fwd + rx * str) * spd;
      this.z += (fz * fwd + rz * str) * spd;
      this.y += up * spd;
    }

    this.camera.position.set(this.x, this.y, this.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }
}
