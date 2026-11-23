import { MovementAnimations } from './MovementAnimations.js';
import { CombatAnimations } from './CombatAnimations.js';
import { EmoteAnimations } from './EmoteAnimations.js';

/**
 * Centralized character animator for both the player and all bots.
 * Uses THREE.AnimationMixer when GLTF AnimationClips are provided; otherwise runs coordinated procedural animation.
 */
export class CharacterAnimator {
  constructor(rig, gltfClips = null) {
    this.rig = rig;
    this.mixer = null;
    this.clips = new Map();

    this.state = {
      speed: 0,
      sprinting: false,
      grounded: true,
      vy: 0,
      crouch: false,
      gliding: false,
      isAiming: false,
      isShooting: false,
      isReloading: false,
      eliminated: false,
      recoilTimer: 0,
      hitFlinchTimer: 0,
      switchTimer: 0,
      landTimer: 0,
      emoteAnim: null,
      emoteTimer: 0
    };

    if (gltfClips && gltfClips.length > 0 && window.THREE) {
      this.mixer = new window.THREE.AnimationMixer(rig);
      for (const clip of gltfClips) {
        this.clips.set(clip.name, this.mixer.clipAction(clip));
      }
    }
  }

  triggerEmote(animId, duration = 3.2) {
    this.state.emoteAnim = animId;
    this.state.emoteTimer = duration;
  }

  triggerShoot() { this.state.recoilTimer = 0.14; }
  triggerHit() { this.state.hitFlinchTimer = 0.18; }
  triggerSwitch() { this.state.switchTimer = 0.22; }
  triggerLand() { this.state.landTimer = 0.16; }

  update(dt, elapsedTime) {
    if (this.state.recoilTimer > 0) this.state.recoilTimer = Math.max(0, this.state.recoilTimer - dt);
    if (this.state.hitFlinchTimer > 0) this.state.hitFlinchTimer = Math.max(0, this.state.hitFlinchTimer - dt);
    if (this.state.switchTimer > 0) this.state.switchTimer = Math.max(0, this.state.switchTimer - dt);
    if (this.state.landTimer > 0) this.state.landTimer = Math.max(0, this.state.landTimer - dt);

    if (this.mixer) {
      this.mixer.update(dt);
      return;
    }

    if (this.state.emoteAnim && this.state.emoteTimer > 0) {
      this.state.emoteTimer -= dt;
      EmoteAnimations.apply(this.rig, this.state.emoteAnim, elapsedTime);
      if (this.state.emoteTimer <= 0) {
        this.state.emoteAnim = null;
        EmoteAnimations.reset(this.rig);
      }
      return;
    }

    MovementAnimations.apply(this.rig, this.state, elapsedTime, dt);
    CombatAnimations.apply(this.rig, this.state, dt);
  }
}
