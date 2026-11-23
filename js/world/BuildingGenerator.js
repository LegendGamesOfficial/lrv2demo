import { BuildingBuilder } from '../../assets/models/buildings/BuildingBuilder.js';

/**
 * Generates POI buildings, registers AABB colliders, and spawns chests/floor loot inside POIs.
 */
export class BuildingGenerator {
  generatePOIs(scene, pois, terrainGen, lootManager, pickupManager, itemDefs, assetManager) {
    const colliders = [];

    for (const poi of pois) {
      const count = poi.buildings || 6;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.35;
        const dist = 12 + Math.random() * (poi.radius * 0.65);
        const bx = poi.x + Math.cos(ang) * dist;
        const bz = poi.z + Math.sin(ang) * dist;
        const by = Math.max(0.2, terrainGen.getHeight(bx, bz));
        const h = poi.type === 'city' ? 12 + Math.random() * 14 : 5.5 + Math.random() * 3.5;
        const w = 7 + Math.random() * 3.5;
        const d = 7 + Math.random() * 3.5;

        const bldg = BuildingBuilder.createPOIBuilding(w, h, d, poi.type, assetManager);
        bldg.position.set(bx, by, bz);
        scene.add(bldg);

        colliders.push({ x: bx, y: by, z: bz, halfW: w / 2, halfD: d / 2, height: h });

        const cy = Math.max(0.2, terrainGen.getHeight(bx + w * 0.65, bz));
        lootManager.spawnChest(bx + w * 0.65, cy, bz);
      }

      for (let j = 0; j < 4; j++) {
        const fx = poi.x + (Math.random() - 0.5) * poi.radius;
        const fz = poi.z + (Math.random() - 0.5) * poi.radius;
        const fy = Math.max(0.2, terrainGen.getHeight(fx, fz));
        pickupManager.spawnPickup(fx, fy, fz, itemDefs.rollRandomLoot());
      }
    }

    return colliders;
  }
}
