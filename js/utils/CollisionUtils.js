/**
 * Collision detection helpers for AABB structures, spherical hitboxes, and raycasts.
 */
export const CollisionUtils = {
  /**
   * Resolves horizontal circle-vs-AABB push-out on the XZ plane.
   * Returns { x, z, collided }.
   */
  resolveCircleAABB2D(cx, cz, radius, box) {
    const minX = box.x - box.halfW;
    const maxX = box.x + box.halfW;
    const minZ = box.z - box.halfD;
    const maxZ = box.z + box.halfD;

    const closestX = Math.max(minX, Math.min(cx, maxX));
    const closestZ = Math.max(minZ, Math.min(cz, maxZ));

    const dx = cx - closestX;
    const dz = cz - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq >= radius * radius) {
      return { x: cx, z: cz, collided: false };
    }

    const dist = Math.sqrt(distSq);
    if (dist > 0.0001) {
      const push = radius - dist;
      return {
        x: cx + (dx / dist) * push,
        z: cz + (dz / dist) * push,
        collided: true
      };
    }

    // Center is inside box; push out along shortest axis
    const leftPen = cx - minX;
    const rightPen = maxX - cx;
    const topPen = cz - minZ;
    const botPen = maxZ - cz;
    const minPen = Math.min(leftPen, rightPen, topPen, botPen);

    if (minPen === leftPen) return { x: minX - radius, z: cz, collided: true };
    if (minPen === rightPen) return { x: maxX + radius, z: cz, collided: true };
    if (minPen === topPen) return { x: cx, z: minZ - radius, collided: true };
    return { x: cx, z: maxZ + radius, collided: true };
  },

  /**
   * Ray vs vertical cylinder/capsule approximation for character hit detection.
   * Returns distance t along ray if hit, or null.
   */
  rayIntersectsCapsule(origin, dir, targetPos, radius = 0.65, height = 2.1, maxDist = 250) {
    const midY = targetPos.y + height * 0.52;
    const ocX = targetPos.x - origin.x;
    const ocY = midY - origin.y;
    const ocZ = targetPos.z - origin.z;

    const proj = ocX * dir.x + ocY * dir.y + ocZ * dir.z;
    if (proj < 0 || proj > maxDist) return null;

    const closestX = origin.x + dir.x * proj;
    const closestY = origin.y + dir.y * proj;
    const closestZ = origin.z + dir.z * proj;

    const dx = closestX - targetPos.x;
    const dz = closestZ - targetPos.z;
    const horizDist = Math.hypot(dx, dz);

    if (horizDist <= radius && closestY >= targetPos.y - 0.1 && closestY <= targetPos.y + height + 0.15) {
      const isHeadshot = closestY >= targetPos.y + height * 0.78;
      return { distance: proj, isHeadshot };
    }
    return null;
  },

  /**
   * Ray vs AABB slab test for walls, floors, and buildings.
   */
  rayIntersectsAABB(origin, dir, box, maxDist = 250) {
    const minX = box.x - box.halfW;
    const maxX = box.x + box.halfW;
    const minY = box.y;
    const maxY = box.y + box.height;
    const minZ = box.z - box.halfD;
    const maxZ = box.z + box.halfD;

    let tmin = 0;
    let tmax = maxDist;

    const axes = [
      [origin.x, dir.x, minX, maxX],
      [origin.y, dir.y, minY, maxY],
      [origin.z, dir.z, minZ, maxZ]
    ];

    for (const [o, d, bmin, bmax] of axes) {
      if (Math.abs(d) < 1e-6) {
        if (o < bmin || o > bmax) return null;
      } else {
        let t1 = (bmin - o) / d;
        let t2 = (bmax - o) / d;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return null;
      }
    }
    return tmin;
  }
};
