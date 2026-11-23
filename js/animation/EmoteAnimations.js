/**
 * Procedural emote animations for all Battle Pass & Item Shop emotes.
 */
export const EmoteAnimations = {
  reset(rig) {
    const { armL, armR, legL, legR, headGrp, torso } = rig.userData;
    armL.rotation.set(0, 0, 0);
    armR.rotation.set(0, 0, 0);
    legL.rotation.set(0, 0, 0);
    legR.rotation.set(0, 0, 0);
    headGrp.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    rig.position.y = 0;
  },

  apply(rig, anim, t) {
    const { armL, armR, legL, legR, headGrp, torso } = rig.userData;
    armL.rotation.set(0, 0, 0);
    armR.rotation.set(0, 0, 0);
    legL.rotation.set(0, 0, 0);
    legR.rotation.set(0, 0, 0);
    headGrp.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);

    if (anim === 'dance_moves') {
      armL.rotation.z = 0.7 + Math.sin(t * 7) * 0.5;
      armR.rotation.z = -0.7 - Math.cos(t * 7) * 0.5;
      legL.rotation.x = Math.sin(t * 7) * 0.35;
      legR.rotation.x = -Math.sin(t * 7) * 0.35;
      rig.position.y = Math.abs(Math.sin(t * 7)) * 0.14;
    } else if (anim === 'squat_kick') {
      rig.position.y = -0.25 + Math.abs(Math.sin(t * 8)) * 0.12;
      legL.rotation.x = Math.max(0, Math.sin(t * 8)) * -1.1;
      legR.rotation.x = Math.max(0, -Math.sin(t * 8)) * -1.1;
      armL.rotation.x = -0.9;
      armR.rotation.x = -0.9;
    } else if (anim === 'take_the_l') {
      armR.rotation.x = -2.2;
      armR.rotation.z = -0.3;
      legL.rotation.x = Math.sin(t * 9) * 0.6;
      legR.rotation.x = -Math.sin(t * 9) * 0.6;
      rig.position.y = Math.abs(Math.sin(t * 9)) * 0.18;
    } else if (anim === 'doom') {
      armL.rotation.z = 1.2;
      armR.rotation.z = -1.2;
      armL.rotation.x = -0.5 + Math.sin(t * 4) * 0.2;
      armR.rotation.x = -0.5 - Math.sin(t * 4) * 0.2;
    } else if (anim === 'kneel') {
      rig.position.y = -0.45;
      legL.rotation.x = 1.2;
      legR.rotation.x = -0.9;
      armR.rotation.x = -1.1;
      headGrp.rotation.x = 0.25;
    } else if (anim === 'disco') {
      armR.rotation.x = -2.4 + Math.sin(t * 6) * 0.3;
      armR.rotation.z = -0.5;
      armL.rotation.z = 0.6;
      torso.rotation.y = Math.sin(t * 6) * 0.25;
    } else if (anim === 'dab') {
      armL.rotation.z = 2.1;
      armL.rotation.x = -0.5;
      armR.rotation.x = -1.1;
      armR.rotation.z = 0.65;
      headGrp.rotation.x = 0.45;
      headGrp.rotation.y = 0.4;
    }
  }
};
