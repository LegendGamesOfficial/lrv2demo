import { MathUtils } from '../utils/MathUtils.js';

/**
 * Procedural locomotion animations (idle, walk, run/sprint, jump, fall, land, glide, crouch)
 * using hierarchical limb pivots so limbs never detach.
 */
export const MovementAnimations = {
  apply(rig, state, t, dt) {
    const { armL, armR, legL, legR, torso, headGrp } = rig.userData;
    const speed = state.speed || 0;
    const isMoving = speed > 0.4;

    if (state.eliminated) {
      rig.rotation.x = MathUtils.damp(rig.rotation.x, -Math.PI / 2, 10, dt);
      return;
    }
    rig.rotation.x = MathUtils.damp(rig.rotation.x, 0, 14, dt);

    const crouchDrop = state.crouch ? -0.28 : 0;
    const legHipY = 0.92 + crouchDrop;
    const torsoY = 1.38 + crouchDrop;
    const headY = 2.08 + crouchDrop;
    const armY = 1.72 + crouchDrop;

    legL.position.y = MathUtils.damp(legL.position.y, legHipY, 14, dt);
    legR.position.y = MathUtils.damp(legR.position.y, legHipY, 14, dt);
    armL.position.y = MathUtils.damp(armL.position.y, armY, 14, dt);
    armR.position.y = MathUtils.damp(armR.position.y, armY, 14, dt);
    headGrp.position.y = MathUtils.damp(headGrp.position.y, headY, 14, dt);

    if (state.gliding) {
      armL.rotation.x = MathUtils.damp(armL.rotation.x, -2.5, 10, dt);
      armR.rotation.x = MathUtils.damp(armR.rotation.x, -2.5, 10, dt);
      legL.rotation.x = MathUtils.damp(legL.rotation.x, 0.25, 8, dt);
      legR.rotation.x = MathUtils.damp(legR.rotation.x, -0.25, 8, dt);
      torso.position.y = MathUtils.damp(torso.position.y, torsoY, 12, dt);
      return;
    }

    if (!state.grounded) {
      const falling = (state.vy || 0) < -1.5;
      armL.rotation.x = MathUtils.damp(armL.rotation.x, falling ? -1.1 : -0.65, 10, dt);
      armR.rotation.x = MathUtils.damp(armR.rotation.x, falling ? -1.1 : -0.65, 10, dt);
      legL.rotation.x = MathUtils.damp(legL.rotation.x, falling ? 0.25 : 0.55, 10, dt);
      legR.rotation.x = MathUtils.damp(legR.rotation.x, falling ? -0.25 : -0.45, 10, dt);
      torso.position.y = MathUtils.damp(torso.position.y, torsoY, 12, dt);
      return;
    }

    const landSquash = state.landTimer > 0 ? -0.14 : 0;

    if (isMoving) {
      const freq = state.crouch ? 7.5 : (state.sprinting ? 13.5 : 10.2);
      const amp = state.crouch ? 0.38 : (state.sprinting ? 0.78 : 0.55);
      const swing = Math.sin(t * freq) * amp;
      legL.rotation.x = MathUtils.damp(legL.rotation.x, swing, 14, dt);
      legR.rotation.x = MathUtils.damp(legR.rotation.x, -swing, 14, dt);
      armL.rotation.x = MathUtils.damp(armL.rotation.x, -swing * 0.75, 14, dt);
      if (!state.isAiming && !state.isShooting && !state.isReloading && state.switchTimer <= 0) {
        armR.rotation.x = MathUtils.damp(armR.rotation.x, swing * 0.75, 14, dt);
      }
      torso.position.y = MathUtils.damp(torso.position.y, torsoY + landSquash + Math.abs(Math.sin(t * freq)) * 0.04, 16, dt);
    } else {
      legL.rotation.x = MathUtils.damp(legL.rotation.x, state.crouch ? -0.35 : 0, 12, dt);
      legR.rotation.x = MathUtils.damp(legR.rotation.x, state.crouch ? 0.25 : 0, 12, dt);
      armL.rotation.x = MathUtils.damp(armL.rotation.x, 0, 12, dt);
      if (!state.isAiming && !state.isShooting && !state.isReloading && state.switchTimer <= 0) {
        armR.rotation.x = MathUtils.damp(armR.rotation.x, 0, 12, dt);
      }
      torso.position.y = MathUtils.damp(torso.position.y, torsoY + landSquash + Math.sin(t * 2.2) * 0.015, 14, dt);
    }

    headGrp.rotation.x = MathUtils.damp(headGrp.rotation.x, state.crouch ? 0.14 : 0, 10, dt);
  }
};
