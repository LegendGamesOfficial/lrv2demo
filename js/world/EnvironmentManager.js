import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';

/**
 * Populates forests, rocks, and harvestable resource props across the island.
 */
export class EnvironmentManager {
  constructor(scene, assetManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.trees = [];
    this.rocks = [];
  }

  populate(terrainGen) {
    for (let i = 0; i < 160; i++) {
      const x = (Math.random() - 0.5) * 760;
      const z = (Math.random() - 0.5) * 760;
      const y = terrainGen.getHeight(x, z);
      if (y < 0.8 || y > 22) continue;

      const tree = EnvironmentBuilder.createTree(0.85 + Math.random() * 0.55, this.assetManager);
      tree.position.set(x, y, z);
      this.scene.add(tree);
      this.trees.push({ x, y, z, hp: 100, mesh: tree });
    }

    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 760;
      const z = (Math.random() - 0.5) * 760;
      const y = terrainGen.getHeight(x, z);
      if (y < 0.5) continue;

      const rock = EnvironmentBuilder.createRock(0.8 + Math.random() * 0.9, this.assetManager);
      rock.position.set(x, y + 0.5, z);
      this.scene.add(rock);
      this.rocks.push({ x, y, z, hp: 120, mesh: rock });
    }
  }

  harvestNearest(x, z, player, audio) {
    for (let i = this.trees.length - 1; i >= 0; i--) {
      const t = this.trees[i];
      if (Math.hypot(t.x - x, t.z - z) < 4.5) {
        t.hp -= 35;
        player.wood += 14;
        audio.sfx.build();
        if (t.hp <= 0) {
          this.scene.remove(t.mesh);
          this.trees.splice(i, 1);
        }
        return true;
      }
    }
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      if (Math.hypot(r.x - x, r.z - z) < 4.5) {
        r.hp -= 40;
        player.brick += 12;
        audio.sfx.build();
        if (r.hp <= 0) {
          this.scene.remove(r.mesh);
          this.rocks.splice(i, 1);
        }
        return true;
      }
    }
    return false;
  }

  clear() {
    for (const t of this.trees) this.scene.remove(t.mesh);
    for (const r of this.rocks) this.scene.remove(r.mesh);
    this.trees = [];
    this.rocks = [];
  }
}
