import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';

/**
 * Manages treasure chests across POIs and triggers loot drops on open.
 */
export class LootManager {
  constructor(scene, assetManager, itemDefs, pickupManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.itemDefs = itemDefs;
    this.pickupManager = pickupManager;
    this.chests = [];
  }

  spawnChest(x, y, z) {
    const mesh = EnvironmentBuilder.createChest(this.assetManager);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    this.chests.push({ x, y, z, opened: false, mesh });
  }

  hasNearbyClosedChest(x, z, maxDist = 4.5) {
    return this.chests.some((c) => !c.opened && Math.hypot(c.x - x, c.z - z) < maxDist);
  }

  tryOpenNearest(x, z, maxDist = 4.5, audio) {
    for (const ch of this.chests) {
      if (!ch.opened && Math.hypot(ch.x - x, ch.z - z) < maxDist) {
        ch.opened = true;
        ch.mesh.visible = false;
        audio.sfx.chest();
        this.pickupManager.spawnPickup(ch.x + 1.2, ch.y, ch.z, this.itemDefs.rollRandomLoot());
        this.pickupManager.spawnPickup(ch.x - 1.2, ch.y, ch.z, this.itemDefs.rollRandomLoot());
        return ch;
      }
    }
    return null;
  }

  clear() {
    for (const c of this.chests) this.scene.remove(c.mesh);
    this.chests = [];
  }
}
