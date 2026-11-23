/**
 * Monitors frame time, enforces 100-combatant AI update budgets,
 * and cleans up Three.js scene resources on match teardown.
 */
export class PerformanceManager {
  constructor() {
    this.fps = 60;
    this._frames = 0;
    this._accum = 0;
    this.botBatchSize = 25; // Update ~25 bots full-rate per frame, staggered across 4 frames
    this.maxDrawDistance = 420;
  }

  update(dt) {
    this._frames += 1;
    this._accum += dt;
    if (this._accum >= 0.5) {
      this.fps = Math.round(this._frames / this._accum);
      this._frames = 0;
      this._accum = 0;
      this.botBatchSize = this.fps < 35 ? 15 : 25;
    }
  }

  applyQualitySettings(renderer, scene, quality) {
    if (!renderer) return;
    if (quality === 'low') {
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = false;
      this.maxDrawDistance = 260;
    } else if (quality === 'medium') {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = false;
      this.maxDrawDistance = 340;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      this.maxDrawDistance = 460;
    }
    if (scene && scene.fog) {
      scene.fog.density = quality === 'low' ? 0.0024 : 0.0014;
    }
  }

  disposeScene(scene) {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.geometry && !obj.userData.sharedGeometry) {
        obj.geometry.dispose();
      }
      if (obj.material && !obj.userData.sharedMaterial) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
