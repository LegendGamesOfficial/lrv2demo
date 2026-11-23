import { Config } from '../core/Config.js';
import { MathUtils } from '../utils/MathUtils.js';
import { PlayerHealth } from './PlayerHealth.js';
import { CharacterBuilder } from '../../assets/models/characters/CharacterBuilder.js';
import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';
import { CharacterAnimator } from '../animation/CharacterAnimator.js';

/**
 * Represents the local player entity with separated cameraYaw, bodyYaw, aimPitch, and unified animator.
 */
export class Player {
  constructor(assetManager) {
    this.assetManager = assetManager;
    this.health = new PlayerHealth();
    this.x = Config.SPAWN_ISLAND_CENTER.x;
    this.y = Config.SPAWN_ISLAND_CENTER.y;
    this.z = Config.SPAWN_ISLAND_CENTER.z;
    this.vy = 0;

    // Separated camera orientation vs character body orientation
    this.yaw = 0;       // Camera horizontal yaw
    this.pitch = -0.15; // Camera vertical pitch
    this.bodyYaw = Math.PI; // Character +Z front faces -Z (forward) initially
    this.moveDirX = 0;
    this.moveDirZ = -1;

    this.currentSpeed = 0;
    this.isSprinting = false;
    this.grounded = false;
    this.wasGrounded = true;
    this.crouch = false;
    this.gliding = false;
    this.aiming = false;
    this.inBush = false;
    this.kills = 0;

    this.wood = 150;
    this.brick = 100;
    this.metal = 50;

    this.mesh = null;
    this.gliderMesh = null;
    this.bushMesh = null;
    this.animator = null;
  }

  spawnInScene(scene, skinItem, gliderItem, animationManager) {
    this.health.reset();
    this.x = Config.SPAWN_ISLAND_CENTER.x;
    this.y = Config.SPAWN_ISLAND_CENTER.y;
    this.z = Config.SPAWN_ISLAND_CENTER.z;
    this.vy = 0;
    this.yaw = 0;
    this.pitch = -0.15;
    this.bodyYaw = Math.PI;
    this.moveDirX = 0;
    this.moveDirZ = -1;
    this.kills = 0;
    this.wood = 150;
    this.brick = 100;
    this.metal = 50;
    this.crouch = false;
    this.gliding = false;
    this.inBush = false;

    this.mesh = CharacterBuilder.createCharacter(skinItem, this.assetManager);
    this.gliderMesh = EnvironmentBuilder.createGlider(gliderItem, this.assetManager);
    this.gliderMesh.position.y = 2.9;
    this.gliderMesh.visible = false;
    this.mesh.add(this.gliderMesh);

    const THREE = window.THREE;
    this.bushMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.15, 0),
      this.assetManager.getMaterial('#15803d')
    );
    this.bushMesh.position.y = 1.25;
    this.bushMesh.visible = false;
    this.mesh.add(this.bushMesh);

    scene.add(this.mesh);
    this.animator = animationManager.register(new CharacterAnimator(this.mesh));
  }

  setGliding(val) {
    this.gliding = !!val;
    if (this.gliderMesh) this.gliderMesh.visible = this.gliding;
  }

  setInBush(val) {
    this.inBush = !!val;
    if (this.bushMesh) this.bushMesh.visible = this.inBush;
  }

  updateOrientation(dt, isAimingOrBuilding) {
    // Character +Z faces (Math.sin(bodyYaw), Math.cos(bodyYaw))
    let targetYaw = this.bodyYaw;
    if (isAimingOrBuilding) {
      // Face camera's forward direction (-sin(yaw), -cos(yaw))
      targetYaw = Math.atan2(-Math.sin(this.yaw), -Math.cos(this.yaw));
    } else if (this.currentSpeed > 0.4) {
      targetYaw = Math.atan2(this.moveDirX, this.moveDirZ);
    }
    this.bodyYaw = MathUtils.lerpAngle(this.bodyYaw, targetYaw, 1 - Math.exp(-12 * dt));
  }

  syncTransform() {
    if (!this.mesh) return;
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = this.bodyYaw;

    if (this.animator) {
      this.animator.state.speed = this.currentSpeed;
      this.animator.state.sprinting = this.isSprinting;
      this.animator.state.grounded = this.grounded;
      this.animator.state.vy = this.vy;
      this.animator.state.crouch = this.crouch;
      this.animator.state.gliding = this.gliding;
      this.animator.state.isAiming = this.aiming;
      this.animator.state.eliminated = !this.health.alive;
    }
  }
}
