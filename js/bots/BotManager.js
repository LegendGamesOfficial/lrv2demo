import { Config } from '../core/Config.js';
import { Bot } from './Bot.js';
import { BotAI } from './BotAI.js';

/**
 * Spawns 19 bots (20 total combatants) aboard the Battle Bus, drops & glides them onto the island, and runs AI.
 */
export class BotManager {
  constructor(scene, assetManager, animationManager = null) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.animationManager = animationManager;
    this.bots = [];
    this._cursor = 0;
    this.paused = false;
  }

  spawnAll(mode, world) {
    this.clear();
    const skins = this.assetManager.data.items.filter((i) => i.type === 'skin');
    const pois = (world && world.poiManager && world.poiManager.getPOIs()) || [];
    const totalBots = Config.BOT_COUNT || 19;

    for (let i = 0; i < totalBots; i++) {
      const isMate = mode === 'SQUAD' && i < 3;
      const skinItem = skins[i % Math.max(1, skins.length)];
      const busJumpProgress = 0.08 + (i / totalBots) * 0.78 + (Math.random() - 0.5) * 0.06;

      let targetLandingX;
      let targetLandingZ;
      if (pois.length > 0 && Math.random() < 0.78) {
        const poi = pois[i % pois.length];
        targetLandingX = poi.x + (Math.random() - 0.5) * 32;
        targetLandingZ = poi.z + (Math.random() - 0.5) * 32;
      } else {
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 260;
        targetLandingX = Math.cos(ang) * dist;
        targetLandingZ = Math.sin(ang) * dist;
      }

      this.bots.push(
        new Bot(i, {
          x: -420, y: 145, z: -320,
          skinItem,
          isMate,
          assetManager: this.assetManager,
          scene: this.scene,
          animationManager: this.animationManager,
          dropPhase: 'BUS',
          busJumpProgress: Math.max(0.05, Math.min(0.92, busJumpProgress)),
          targetLandingX,
          targetLandingZ
        })
      );
    }
  }

  spawnStagedBots(count, centerX, centerZ, world, spreadRadius = 22) {
    const skins = this.assetManager.data.items.filter((i) => i.type === 'skin');
    const startId = this.bots.length;
    const spawned = [];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * spreadRadius;
      const bx = centerX + Math.cos(ang) * dist;
      const bz = centerZ + Math.sin(ang) * dist;
      const by = Math.max(0.2, world.getTerrainHeight(bx, bz));
      const skinItem = skins[(startId + i) % Math.max(1, skins.length)];
      const bot = new Bot(startId + i, {
        x: bx, y: by, z: bz,
        skinItem,
        isMate: false,
        assetManager: this.assetManager,
        scene: this.scene,
        animationManager: this.animationManager,
        dropPhase: 'GROUND'
      });
      this.bots.push(bot);
      spawned.push(bot);
    }
    return spawned;
  }

  updateBusAndDrops(dt, busPos, busProgress, world) {
    for (const bot of this.bots) {
      if (!bot.alive) continue;
      if (bot.dropPhase === 'BUS') {
        if (busProgress >= bot.busJumpProgress && busPos) {
          bot.dropPhase = 'SKYDIVING';
          bot.x = busPos.x + (Math.random() - 0.5) * 4;
          bot.y = busPos.y - 3;
          bot.z = busPos.z + (Math.random() - 0.5) * 4;
          bot.syncMesh();
        }
      } else if (bot.dropPhase === 'SKYDIVING') {
        this._updateBotSkydive(bot, world, dt);
        bot.syncMesh();
      }
    }
  }

  _updateBotSkydive(bot, world, dt) {
    const dx = bot.targetLandingX - bot.x;
    const dz = bot.targetLandingZ - bot.z;
    const dist = Math.hypot(dx, dz);
    const horizSpeed = bot.gliding ? 22 : 14;
    if (dist > 2) {
      bot.dir = Math.atan2(dz, dx);
      bot.x += (dx / dist) * horizSpeed * dt;
      bot.z += (dz / dist) * horizSpeed * dt;
      bot.speed = horizSpeed;
    } else {
      bot.speed = 0;
    }
    bot.y += (bot.gliding ? -11 : -30) * dt;
    if (bot.y <= 42 && !bot.gliding) {
      bot.setGliding(true);
    }
    const gnd = world ? world.getTerrainHeight(bot.x, bot.z) : 0;
    if (bot.y <= gnd) {
      bot.y = gnd;
      bot.setGliding(false);
      bot.dropPhase = 'GROUND';
      bot.speed = 0;
    }
  }

  update(dt, ctx, batchSize = 20) {
    if (this.paused || this.bots.length === 0) return;
    const count = Math.min(batchSize, this.bots.length);
    const scaledDt = dt * (this.bots.length / count);

    for (let i = 0; i < count; i++) {
      const bot = this.bots[this._cursor];
      this._cursor = (this._cursor + 1) % this.bots.length;
      if (!bot.alive) continue;

      if (bot.dropPhase === 'BUS') {
        if (ctx.busProgress >= bot.busJumpProgress && ctx.busPos) {
          bot.dropPhase = 'SKYDIVING';
          bot.x = ctx.busPos.x + (Math.random() - 0.5) * 4;
          bot.y = ctx.busPos.y - 3;
          bot.z = ctx.busPos.z + (Math.random() - 0.5) * 4;
        }
        bot.syncMesh();
      } else if (bot.dropPhase === 'SKYDIVING') {
        this._updateBotSkydive(bot, ctx.world, scaledDt);
        bot.syncMesh();
      } else {
        BotAI.updateBot(bot, ctx, scaledDt);
        bot.syncMesh();
      }
    }
  }

  clear() {
    for (const b of this.bots) {
      if (b.animator && this.animationManager) this.animationManager.unregister(b.animator);
      this.scene.remove(b.mesh);
    }
    this.bots = [];
    this._cursor = 0;
  }
}
