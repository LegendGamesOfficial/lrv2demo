import { CharacterBuilder } from '../../assets/models/characters/CharacterBuilder.js';
import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';
import { CharacterAnimator } from '../animation/CharacterAnimator.js';
import { pickRandomPersonality } from './BotPersonalities.js';

/**
 * Represents a single AI-controlled combatant that drops from the Battle Bus, glides down, loots weapons, and fights fairly.
 */
export class Bot {
  constructor(id, {
    x, y, z, skinItem, isMate = false, assetManager, scene, animationManager = null,
    dropPhase = 'BUS', busJumpProgress = 0.2, targetLandingX = 0, targetLandingZ = 0
  }) {
    this.id = id;
    this.isMate = isMate;
    this.name = isMate ? `SquadMate_${id + 1}` : `LegendBot_${id + 1}`;
    this.personality = pickRandomPersonality();

    this.x = x;
    this.y = y;
    this.z = z;
    this.hp = 75;
    this.shield = 0;
    this.alive = true;
    this.dir = Math.random() * Math.PI * 2;
    this.aimYaw = this.dir;
    this.speed = 0;
    this.state = 'ROAM';

    // Bus drop & gliding state
    this.dropPhase = dropPhase; // 'BUS' | 'SKYDIVING' | 'GROUND'
    this.busJumpProgress = busJumpProgress;
    this.targetLandingX = targetLandingX;
    this.targetLandingZ = targetLandingZ;
    this.gliding = false;

    // Fair perception & combat state
    this.currentTarget = null;
    this.lastKnownPos = null;
    this.timeSinceSeen = 999;
    this.losBlocked = false;
    this.reactionTimer = this.personality.reactionTime;

    // Bots must loot their own weapon after landing
    this.hasWeapon = dropPhase === 'GROUND';
    this.magAmmo = this.hasWeapon ? 30 : 0;
    this.reloadTimer = 0;
    this.weaponPower = this.hasWeapon ? 8 : 0;
    this.weaponRange = 58;
    this.heals = 0;
    this.materials = 30;
    this.fireCooldown = 1.1 + Math.random() * 1.4;
    this.buildCooldown = 0;

    this.mesh = CharacterBuilder.createCharacter(skinItem, assetManager);
    this.gliderMesh = EnvironmentBuilder.createGlider({ color: '#475569', accent: '#eab308' }, assetManager);
    this.gliderMesh.position.y = 2.9;
    this.gliderMesh.visible = false;
    this.mesh.add(this.gliderMesh);

    this.mesh.position.set(x, y, z);
    this.mesh.visible = dropPhase !== 'BUS';
    scene.add(this.mesh);

    this.animator = animationManager ? animationManager.register(new CharacterAnimator(this.mesh)) : null;
  }

  setGliding(val) {
    this.gliding = !!val;
    if (this.gliderMesh) this.gliderMesh.visible = this.gliding;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    let rem = amount;
    if (this.shield > 0) {
      const abs = Math.min(this.shield, rem);
      this.shield -= abs;
      rem -= abs;
    }
    this.hp -= rem;
    if (this.animator) this.animator.triggerHit();
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      if (this.animator) this.animator.state.eliminated = true;
      this.mesh.visible = false;
    }
  }

  syncMesh() {
    if (!this.alive) return;
    if (this.dropPhase === 'BUS') {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = Math.atan2(Math.cos(this.dir), Math.sin(this.dir));
    if (this.animator) {
      this.animator.state.speed = this.speed;
      this.animator.state.grounded = this.dropPhase === 'GROUND';
      this.animator.state.gliding = this.gliding;
      this.animator.state.isAiming = this.state === 'COMBAT';
      this.animator.state.isReloading = this.reloadTimer > 0;
    }
  }
}
