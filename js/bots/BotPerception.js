import { CollisionUtils } from '../utils/CollisionUtils.js';

/**
 * Fair, non-cheating perception system for bots:
 * - Field-of-view cone (130 deg) + close-range sound awareness (16m)
 * - Terrain line-of-sight sampling (cannot see through hills)
 * - Building & player-built structure raycast occlusion (cannot see through walls/ramps)
 * - Evaluates ALL enemy bots so bots actively fight each other
 */
export const BotPerception = {
  hasLineOfSight(ax, ay, az, bx, by, bz, world, buildingManager) {
    const ox = ax;
    const oy = ay + 1.55;
    const oz = az;
    const tx = bx;
    const ty = by + 1.25;
    const tz = bz;

    const dx = tx - ox;
    const dy = ty - oy;
    const dz = tz - oz;
    const dist = Math.hypot(dx, dy, dz);
    if (dist < 0.5) return true;

    const dir = { x: dx / dist, y: dy / dist, z: dz / dist };
    const origin = { x: ox, y: oy, z: oz };

    // 1. Check terrain occlusion along ray
    const steps = Math.min(12, Math.max(3, Math.floor(dist / 8)));
    for (let s = 1; s < steps; s++) {
      const t = (s / steps) * dist;
      const sx = origin.x + dir.x * t;
      const sy = origin.y + dir.y * t;
      const sz = origin.z + dir.z * t;
      if (world && world.getTerrainHeight(sx, sz) > sy + 0.35) {
        return false;
      }
    }

    // 2. Check POI building colliders
    if (world) {
      const poiBoxes = world.getNearbyColliders((ox + tx) * 0.5, (oz + tz) * 0.5, dist * 0.6 + 6);
      for (const box of poiBoxes) {
        const hit = CollisionUtils.rayIntersectsAABB(origin, dir, box, dist);
        if (hit !== null && hit < dist - 0.35) return false;
      }
    }

    // 3. Check player-built walls/floors/ramps/cones
    if (buildingManager) {
      const buildBoxes = buildingManager.getRaycastBoxesNear((ox + tx) * 0.5, (oz + tz) * 0.5, dist * 0.6 + 6);
      for (const box of buildBoxes) {
        const hit = CollisionUtils.rayIntersectsAABB(origin, dir, box, dist);
        if (hit !== null && hit < dist - 0.25) return false;
      }
    }

    return true;
  },

  findNearestThreat(bot, player, bots, stormManager, world, buildingManager) {
    let bestTarget = null;
    let bestDist = bot.personality.aggroRange;
    const fwdX = Math.cos(bot.dir);
    const fwdZ = Math.sin(bot.dir);

    const evaluateCandidate = (isPlayer, ref, cx, cy, cz, hp, isStealthed) => {
      const dx = cx - bot.x;
      const dz = cz - bot.z;
      const dist = Math.hypot(dx, dz);
      const maxRange = isStealthed ? 10 : bestDist;
      if (dist > maxRange || dist < 0.1) return;

      const dot = (dx / dist) * fwdX + (dz / dist) * fwdZ;
      const inFOV = dot >= 0.35;
      const heardNearby = dist < 16;
      if (!inFOV && !heardNearby) return;

      const visible = this.hasLineOfSight(bot.x, bot.y, bot.z, cx, cy, cz, world, buildingManager);
      if (!visible) return;

      bestDist = dist;
      bestTarget = { isPlayer, ref, x: cx, y: cy, z: cz, hp };
    };

    // Check ALL alive enemy bots so bots actively fight each other
    for (let i = 0; i < bots.length; i++) {
      const other = bots[i];
      if (!other.alive || other === bot) continue;
      if (bot.isMate && other.isMate) continue; // Only skip friendly squad mates
      if (other.dropPhase && other.dropPhase !== 'GROUND') continue;
      evaluateCandidate(false, other, other.x, other.y, other.z, other.hp, false);
    }

    if (!bot.isMate && player && player.health && player.health.alive) {
      evaluateCandidate(true, player, player.x, player.y, player.z, player.health.hp, player.inBush);
    }

    const inStorm = stormManager ? stormManager.isInsideStorm(bot.x, bot.z) : false;
    return { target: bestTarget, distance: bestDist, inStorm };
  }
};
