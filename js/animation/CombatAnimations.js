import { MathUtils } from '../utils/MathUtils.js';

/**
 * Procedural combat animations (aiming, shooting recoil, reloading, weapon switching, hit flinch).
 */
export const CombatAnimations = {
  apply(rig, state, dt) {
    const { armR, armL, torso } = rig.userData;

    if (state.eliminated) return;

    if (state.switchTimer > 0) {
      armR.rotation.x = MathUtils.damp(armR.rotation.x, -0.5, 22, dt);
      armR.rotation.z = MathUtils.damp(armR.rotation.z, 0.35, 22, dt);
      return;
    }
    armR.rotation.z = MathUtils.damp(armR.rotation.z, 0, 14, dt);

    if (state.isReloading) {
      armR.rotation.x = MathUtils.damp(armR.rotation.x, -0.95, 14, dt);
      armL.rotation.x = MathUtils.damp(armL.rotation.x, -1.15, 14, dt);
      return;
    }

    if (state.isAiming || state.recoilTimer > 0) {
      const recoil = state.recoilTimer > 0 ? Math.sin(state.recoilTimer * 40) * 0.25 : 0;
      armR.rotation.x = MathUtils.damp(armR.rotation.x, -1.45 - recoil, 18, dt);
    }

    if (state.hitFlinchTimer > 0) {
      torso.rotation.x = MathUtils.damp(torso.rotation.x, -0.2, 20, dt);
    } else {
      torso.rotation.x = MathUtils.damp(torso.rotation.x, 0, 12, dt);
    }
  }
};
