import { HitDetection } from '../combat/HitDetection.js';
import { BotPerception } from './BotPerception.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Executes fair bot combat:
 * - Requires a looted weapon
 * - Reaction delay before first shot
 * - Realistic aim spread & slower fire rate (no aimbotting)
 * - Strict raycast occlusion against walls, ramps, and buildings (never shoots through builds)
 */
export const BotCombat = {
  fireAt(bot, target, ctx, dt) {
    if (!bot.hasWeapon) return;
    if (bot.reloadTimer > 0) {
      bot.reloadTimer = Math.max(0, bot.reloadTimer - dt);
      return;
    }
    if (bot.magAmmo <= 0) {
      bot.reloadTimer = 2.2;
      bot.magAmmo = 24;
      return;
    }
    if (bot.reactionTimer > 0) {
      bot.reactionTimer = Math.max(0, bot.reactionTimer - dt);
      return;
    }
    if (bot.fireCooldown > 0) return;

    const { projectileManager, damageSystem, buildingManager, world, audio, onBotEliminated } = ctx;
    const dist = Math.hypot(target.x - bot.x, target.z - bot.z);
    if (dist > (bot.weaponRange || 58)) return;

    // Re-verify line-of-sight before firing so bots never shoot through newly placed builds
    if (!BotPerception.hasLineOfSight(bot.x, bot.y, bot.z, target.x, target.y, target.z, world, buildingManager)) {
      bot.losBlocked = true;
      return;
    }

    const desiredDir = Math.atan2(target.z - bot.z, target.x - bot.x);
    bot.aimYaw = MathUtils.lerpAngle(bot.aimYaw, desiredDir, 0.25);

    bot.fireCooldown = 1.05 + Math.random() * 0.95;
    bot.magAmmo -= 1;
    if (bot.animator) bot.animator.triggerShoot();

    // Realistic aim spread so bots miss frequently at medium/long range
    const distFactor = Math.min(2.2, Math.max(0.6, dist / 24));
    const spread = (1 - bot.personality.accuracy) * 0.24 * distFactor;

    const THREE = window.THREE;
    const origin = new THREE.Vector3(bot.x, bot.y + 1.55, bot.z);
    const rawDir = new THREE.Vector3(
      target.x - origin.x,
      (target.y + 1.25) - origin.y,
      target.z - origin.z
    ).normalize();

    rawDir.x += (Math.random() - 0.5) * spread;
    rawDir.y += (Math.random() - 0.5) * spread * 0.6;
    rawDir.z += (Math.random() - 0.5) * spread;
    rawDir.normalize();

    const colliders = [];
    if (world) colliders.push(...world.getNearbyColliders(bot.x, bot.z, dist + 8));
    if (buildingManager) colliders.push(...buildingManager.getRaycastBoxesNear(bot.x, bot.z, dist + 8));

    const targetObj = target.isPlayer
      ? { alive: target.ref.health.alive, x: target.ref.x, y: target.ref.y, z: target.ref.z }
      : target.ref;

    const res = HitDetection.raycastShot(origin, rawDir, bot.weaponRange || 58, [targetObj], colliders);
    const endPoint = origin.clone().add(rawDir.clone().multiplyScalar(res.distance));
    projectileManager.spawnTracer(origin, endPoint);

    if (res.hitBuild && buildingManager) {
      bot.losBlocked = true;
      const destroyed = buildingManager.damagePiece(res.hitBuild, bot.weaponPower || 8);
      if (destroyed && audio) audio.sfx.buildDestroy();
      return;
    }

    if (res.hitTarget) {
      bot.losBlocked = false;
      const dmg = Math.min(10, bot.weaponPower || 8);
      if (target.isPlayer) {
        damageSystem.applyPlayerDamage(target.ref, dmg, audio);
      } else if (target.ref && target.ref.alive) {
        damageSystem.applyBotDamage(target.ref, dmg, { attackerIsPlayer: false }, audio, onBotEliminated);
      }
    }
  }
};
