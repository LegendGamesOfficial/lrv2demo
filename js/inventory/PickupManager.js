import { Config } from '../core/Config.js';

/**
 * Spawns, animates, and collects 3D world loot pickups.
 */
export class PickupManager {
  constructor(scene, assetManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.pickups = [];
  }

  spawnPickup(x, y, z, item) {
    const THREE = window.THREE;
    const col = Config.RARITY_COLORS[item.rarity || 1] || Config.RARITY_COLORS[1];
    const geo = this.assetManager.getGeometry('pickup_box', (T) => new T.BoxGeometry(0.62, 0.62, 0.62));
    const mat = this.assetManager.getMaterial(col, { emissive: col });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 0.55, z);
    mesh.userData.sharedGeometry = true;
    mesh.userData.sharedMaterial = true;
    this.scene.add(mesh);
    this.pickups.push({ x, y: y + 0.55, z, item, mesh });
  }

  findNearest(x, z, maxDist = 3.6) {
    let bestIdx = -1;
    let bestD = maxDist;
    for (let i = 0; i < this.pickups.length; i++) {
      const d = Math.hypot(this.pickups[i].x - x, this.pickups[i].z - z);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  collectAt(index, inventory, audio) {
    const p = this.pickups[index];
    if (!p) return null;
    inventory.addItem(p.item);
    this.scene.remove(p.mesh);
    this.pickups.splice(index, 1);
    audio.sfx.pickup();
    return p.item;
  }

  update(dt) {
    for (const p of this.pickups) {
      p.mesh.rotation.y += dt * 1.4;
    }
  }

  clear() {
    for (const p of this.pickups) this.scene.remove(p.mesh);
    this.pickups = [];
  }
}
