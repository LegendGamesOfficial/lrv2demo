/**
 * Temporary, resettable environment & lighting presets for cinematic trailer capture.
 */
export class CinematicEnvironment {
  constructor(scene) {
    this.scene = scene;
    this._hemi = null;
    this._sun = null;
    this._original = null;
    this._captureLights();
  }

  _captureLights() {
    if (!this.scene) return;
    this.scene.traverse((obj) => {
      if (obj.isHemisphereLight) this._hemi = obj;
      if (obj.isDirectionalLight) this._sun = obj;
    });
    this._original = {
      sky: this.scene.background ? this.scene.background.getHex() : 0x60a5fa,
      fogColor: this.scene.fog ? this.scene.fog.color.getHex() : 0x93c5fd,
      fogDensity: this.scene.fog ? this.scene.fog.density : 0.0014,
      sunColor: this._sun ? this._sun.color.getHex() : 0xfff7ed,
      sunIntensity: this._sun ? this._sun.intensity : 1.28,
      sunPos: this._sun ? this._sun.position.clone() : null,
      hemiIntensity: this._hemi ? this._hemi.intensity : 0.88
    };
  }

  applyPreset(name) {
    if (!this.scene) return;
    const THREE = window.THREE;
    const presets = {
      'Bright Day': { sky: 0x60a5fa, fog: 0x93c5fd, density: 0.0012, sunCol: 0xfffbeb, sunInt: 1.35, sunPos: [160, 240, 120], hemiInt: 0.92 },
      'Golden Hour': { sky: 0xf59e0b, fog: 0xfde68a, density: 0.0018, sunCol: 0xffedd5, sunInt: 1.45, sunPos: [-220, 65, 140], hemiInt: 0.72 },
      'Sunset': { sky: 0xdb2777, fog: 0xf97316, density: 0.0022, sunCol: 0xfb7185, sunInt: 1.15, sunPos: [-260, 32, -90], hemiInt: 0.55 },
      'Night': { sky: 0x090d1f, fog: 0x1e1b4b, density: 0.0026, sunCol: 0x93c5fd, sunInt: 0.42, sunPos: [90, 180, -140], hemiInt: 0.32 },
      'Dramatic Storm': { sky: 0x3b0764, fog: 0x581c87, density: 0.0034, sunCol: 0xc084fc, sunInt: 0.75, sunPos: [60, 140, 80], hemiInt: 0.45 }
    };
    const p = presets[name];
    if (!p) return;

    this.scene.background = new THREE.Color(p.sky);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(p.fog);
      this.scene.fog.density = p.density;
    }
    if (this._sun) {
      this._sun.color.setHex(p.sunCol);
      this._sun.intensity = p.sunInt;
      this._sun.position.set(...p.sunPos);
    }
    if (this._hemi) this._hemi.intensity = p.hemiInt;
  }

  reset() {
    if (!this.scene || !this._original) return;
    this.scene.background.setHex(this._original.sky);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(this._original.fogColor);
      this.scene.fog.density = this._original.fogDensity;
    }
    if (this._sun) {
      this._sun.color.setHex(this._original.sunColor);
      this._sun.intensity = this._original.sunIntensity;
      if (this._original.sunPos) this._sun.position.copy(this._original.sunPos);
    }
    if (this._hemi) this._hemi.intensity = this._original.hemiIntensity;
  }
}
