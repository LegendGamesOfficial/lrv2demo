import { CollisionUtils } from '../utils/CollisionUtils.js';

/**
 * Performs ray-based hit detection against combatants and player-built structures.
 */
export const HitDetection = {
  raycastShot(origin, dir, maxRange, targets, buildingBoxes = []) {
    let bestDist = maxRange;
    let hitTarget = null;
    let isHeadshot = false;
    let hitBuild = null;

    for (const box of buildingBoxes) {
      const t = CollisionUtils.rayIntersectsAABB(origin, dir, box, bestDist);
      if (t !== null && t < bestDist) {
        bestDist = t;
        hitBuild = box.pieceRef || null;
      }
    }

    for (const target of targets) {
      if (!target.alive) continue;
      const res = CollisionUtils.rayIntersectsCapsule(origin, dir, target, 0.65, 2.1, bestDist);
      if (res && res.distance < bestDist) {
        bestDist = res.distance;
        hitTarget = target;
        isHeadshot = res.isHeadshot;
        hitBuild = null;
      }
    }

    return { distance: bestDist, hitTarget, isHeadshot, hitBuild };
  }
};
