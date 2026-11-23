/**
 * Shared math, interpolation, angle, and deterministic noise utilities.
 */
export const MathUtils = {
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  damp(a, b, lambda, dt) {
    return this.lerp(a, b, 1 - Math.exp(-lambda * dt));
  },

  dist2D(x1, z1, x2, z2) {
    return Math.hypot(x2 - x1, z2 - z1);
  },

  dist3D(x1, y1, z1, x2, y2, z2) {
    return Math.hypot(x2 - x1, y2 - y1, z2 - z1);
  },

  wrapAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  },

  lerpAngle(a, b, t) {
    const diff = this.wrapAngle(b - a);
    return a + diff * t;
  },

  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  randomInt(min, max) {
    return Math.floor(this.randomRange(min, max + 1));
  },

  hash2D(ix, iz) {
    const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  },

  valueNoise2D(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);

    const a = this.hash2D(ix, iz);
    const b = this.hash2D(ix + 1, iz);
    const c = this.hash2D(ix, iz + 1);
    const d = this.hash2D(ix + 1, iz + 1);

    return this.lerp(this.lerp(a, b, ux), this.lerp(c, d, ux), uz);
  },

  fbm2D(x, z, octaves = 4) {
    let total = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.valueNoise2D(x * freq, z * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.02;
    }
    return total / norm;
  }
};
