import { MathUtils } from '../utils/MathUtils.js';
import { CollisionUtils } from '../utils/CollisionUtils.js';

/**
 * Camera-relative ground, jump, crouch, skydive, and glider movement with AABB collision resolution.
 */
export class PlayerMovement {
  constructor() {
    this.walkSpeed = 7.5;
    this.runSpeed = 11.4;
    this.crouchSpeed = 5.0;
    this.jumpForce = 11.8;
    this.gravity = 26.5;
    this.radius = 0.55;
    this._stepTimer = 0;
  }

  updateGround(player, input, world, buildingManager, audio, dt, isAimingOrBuilding = false) {
    const isMoving = input.forward !== 0 || input.strafe !== 0;
    player.isSprinting = isMoving && input.sprint && !player.crouch && !player.aiming;

    const baseSpeed = player.crouch
      ? this.crouchSpeed
      : (player.isSprinting ? this.runSpeed : this.walkSpeed);
    const targetSpeed = isMoving ? baseSpeed * (player.aiming ? 0.65 : 1) : 0;

    player.currentSpeed = MathUtils.damp(player.currentSpeed, targetSpeed, 14, dt);

    if (isMoving) {
      // Camera horizontal forward & right vectors
      const fwdX = -Math.sin(player.yaw);
      const fwdZ = -Math.cos(player.yaw);
      const rightX = Math.cos(player.yaw);
      const rightZ = -Math.sin(player.yaw);

      const rawX = fwdX * input.forward + rightX * input.strafe;
      const rawZ = fwdZ * input.forward + rightZ * input.strafe;
      const len = Math.hypot(rawX, rawZ) || 1;
      const mx = rawX / len;
      const mz = rawZ / len;

      player.moveDirX = mx;
      player.moveDirZ = mz;
      player.x += mx * player.currentSpeed * dt;
      player.z += mz * player.currentSpeed * dt;

      if (player.grounded) {
        this._stepTimer -= dt;
        if (this._stepTimer <= 0) {
          audio.sfx.footstep();
          this._stepTimer = player.crouch ? 0.48 : (player.isSprinting ? 0.25 : 0.34);
        }
      }
    }

    player.updateOrientation(dt, isAimingOrBuilding || player.aiming);

    // Resolve horizontal collisions against POI buildings & player walls
    const colliders = world.getNearbyColliders(player.x, player.z, 8);
    if (buildingManager) {
      for (const b of buildingManager.getSolidWallsNear(player.x, player.z, 8)) {
        colliders.push(b);
      }
    }
    for (const box of colliders) {
      const res = CollisionUtils.resolveCircleAABB2D(player.x, player.z, this.radius, box);
      player.x = res.x;
      player.z = res.z;
    }

    // Jump & gravity
    if (input.jump && player.grounded) {
      player.vy = this.jumpForce;
      player.grounded = false;
      audio.sfx.jump();
    }
    player.vy -= this.gravity * dt;
    player.y += player.vy * dt;

    let floorY = world.getTerrainHeight(player.x, player.z);
    if (buildingManager) {
      floorY = Math.max(floorY, buildingManager.getFloorHeightAt(player.x, player.y, player.z));
    }

    if (player.y <= floorY) {
      if (!player.grounded && player.vy < -9) {
        audio.sfx.land();
        if (player.animator) player.animator.triggerLand();
      }
      player.y = floorY;
      player.vy = 0;
      player.grounded = true;
    } else if (player.y > floorY + 0.15) {
      player.grounded = false;
    }
  }

  updateSkydive(player, input, world, dt) {
    const speed = player.gliding ? 26 : 16;
    if (input.forward !== 0 || input.strafe !== 0) {
      const fwdX = -Math.sin(player.yaw);
      const fwdZ = -Math.cos(player.yaw);
      const rightX = Math.cos(player.yaw);
      const rightZ = -Math.sin(player.yaw);
      const rawX = fwdX * input.forward + rightX * input.strafe;
      const rawZ = fwdZ * input.forward + rightZ * input.strafe;
      const len = Math.hypot(rawX, rawZ) || 1;
      player.moveDirX = rawX / len;
      player.moveDirZ = rawZ / len;
      player.x += player.moveDirX * speed * dt;
      player.z += player.moveDirZ * speed * dt;
      player.currentSpeed = speed;
    } else {
      player.currentSpeed = 0;
    }
    player.updateOrientation(dt, false);
    player.y += (player.gliding ? -11 : -34) * dt;

    const gnd = world.getTerrainHeight(player.x, player.z);
    if (player.y <= 38 && !player.gliding) {
      player.setGliding(true);
    }
    if (player.y <= gnd) {
      player.y = gnd;
      player.vy = 0;
      player.grounded = true;
      player.setGliding(false);
      return true;
    }
    return false;
  }
}
