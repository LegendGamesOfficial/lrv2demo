import { Config } from '../core/Config.js';

/**
 * Defines storm phase parameters and next safe-zone target generation.
 */
export class StormPhase {
  static getPhase(index) {
    const phases = Config.STORM_PHASES;
    return phases[Math.min(index, phases.length - 1)];
  }

  static pickNextCenter(cx, cz, currentRadius, nextRadius) {
    const maxShift = Math.max(0, (currentRadius - nextRadius) * 0.55);
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxShift;
    return {
      x: cx + Math.cos(angle) * dist,
      z: cz + Math.sin(angle) * dist
    };
  }
}
