import { TerrainGenerator } from './TerrainGenerator.js';
import { POIManager } from './POIManager.js';
import { BuildingGenerator } from './BuildingGenerator.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';

/**
 * Coordinates terrain, POIs, buildings, forests, and the Battle Bus.
 */
export class World {
  constructor(scene, assetManager, lootManager, pickupManager, itemDefs) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.terrainGen = new TerrainGenerator();
    this.poiManager = new POIManager(assetManager.data.mapData);
    this.buildingGen = new BuildingGenerator();
    this.envManager = new EnvironmentManager(scene, assetManager);
    this.lootManager = lootManager;
    this.pickupManager = pickupManager;
    this.itemDefs = itemDefs;

    this.colliders = [];
    this.busMesh = null;
  }

  build() {
    this.terrainGen.buildMesh(this.scene, this.assetManager);
    this.colliders = this.buildingGen.generatePOIs(
      this.scene,
      this.poiManager.getPOIs(),
      this.terrainGen,
      this.lootManager,
      this.pickupManager,
      this.itemDefs,
      this.assetManager
    );
    this.envManager.populate(this.terrainGen);

    this.busMesh = EnvironmentBuilder.createBattleBus(this.assetManager);
    this.busMesh.position.set(-420, 145, -320);
    this.scene.add(this.busMesh);
  }

  getTerrainHeight(x, z) {
    return this.terrainGen.getHeight(x, z);
  }

  getNearbyColliders(x, z, radius) {
    return this.colliders.filter((c) => Math.hypot(c.x - x, c.z - z) <= radius + Math.max(c.halfW, c.halfD));
  }

  clear() {
    this.envManager.clear();
    this.colliders = [];
  }
}
