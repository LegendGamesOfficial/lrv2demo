/**
 * Developer bot staging controller using the real BotManager and fair BotAI systems.
 */
export class BotStaging {
  constructor(botManager, world, buildingManager) {
    this.botManager = botManager;
    this.world = world;
    this.buildingManager = buildingManager;
    this.stagedBots = [];
  }

  spawnNearCamera(count, devCam) {
    const created = this.botManager.spawnStagedBots(count, devCam.x, devCam.z, this.world, 22);
    this.stagedBots.push(...created);
    return created.length;
  }

  spawnAtLocation(count, x, z) {
    const created = this.botManager.spawnStagedBots(count, x, z, this.world, 24);
    this.stagedBots.push(...created);
    return created.length;
  }

  commandMoveTo(x, z) {
    for (const b of this.stagedBots) {
      if (!b.alive) continue;
      b.lastKnownPos = { x, y: this.world.getTerrainHeight(x, z), z };
      b.timeSinceSeen = 0;
      b.state = 'SEARCH';
    }
  }

  encourageBattle() {
    for (const b of this.stagedBots) {
      if (!b.alive) continue;
      b.personality = { ...b.personality, aggroRange: 95, buildChance: 0.65 };
    }
  }

  togglePause() {
    this.botManager.paused = !this.botManager.paused;
    return this.botManager.paused;
  }

  removeStaged() {
    for (const b of this.stagedBots) {
      b.alive = false;
      b.mesh.visible = false;
    }
    this.stagedBots = [];
  }
}
