import { StormPhase } from './StormPhase.js';
import { StormVisuals } from './StormVisuals.js';
import { MathUtils } from '../utils/MathUtils.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Manages storm countdowns, shrinking phases, safe-zone calculations, damage ticks, and audio warnings.
 */
export class StormManager {
  constructor(scene) {
    this.visuals = new StormVisuals(scene);
    this.reset();
  }

  reset() {
    this.phaseIndex = 0;
    const first = StormPhase.getPhase(0);
    this.cx = 0;
    this.cz = 0;
    this.radius = 480;
    const nextCenter = StormPhase.pickNextCenter(0, 0, this.radius, first.targetRadius);
    this.targetCx = nextCenter.x;
    this.targetCz = nextCenter.z;
    this.targetRadius = first.targetRadius;
    this.timer = first.waitTime;
    this.dmg = first.damage;
    this.shrinking = false;
    this.shrinkSpeed = 10;
    this.visuals.update(this.cx, this.cz, this.radius);
  }

  isInsideStorm(x, z) {
    return Math.hypot(x - this.cx, z - this.cz) > this.radius;
  }

  update(dt, player, bots, damageSystem, audio, onBotEliminated) {
    const phase = StormPhase.getPhase(this.phaseIndex);

    if (!this.shrinking) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.shrinking = true;
        this.shrinkSpeed = Math.max(4, (this.radius - this.targetRadius) / phase.shrinkTime);
        audio.sfx.stormWarning();
        eventBus.emit('ui:notify', `Storm Circle ${phase.phase} is shrinking!`);
      }
    } else {
      this.radius = Math.max(this.targetRadius, this.radius - this.shrinkSpeed * dt);
      this.cx = MathUtils.lerp(this.cx, this.targetCx, dt * 0.25);
      this.cz = MathUtils.lerp(this.cz, this.targetCz, dt * 0.25);

      if (this.radius <= this.targetRadius + 0.1) {
        this.shrinking = false;
        this.phaseIndex += 1;
        const next = StormPhase.getPhase(this.phaseIndex);
        this.dmg = next.damage;
        this.timer = next.waitTime;
        this.targetRadius = next.targetRadius;
        const nc = StormPhase.pickNextCenter(this.cx, this.cz, this.radius, next.targetRadius);
        this.targetCx = nc.x;
        this.targetCz = nc.z;
      }
    }

    this.visuals.update(this.cx, this.cz, this.radius);

    const playerInStorm = this.isInsideStorm(player.x, player.z);
    audio.ambient.inStorm = playerInStorm;
    if (playerInStorm) {
      damageSystem.applyPlayerDamage(player, this.dmg * dt, audio);
    }

    for (const bot of bots) {
      if (bot.alive && this.isInsideStorm(bot.x, bot.z)) {
        damageSystem.applyBotDamage(bot, this.dmg * dt, { attackerIsPlayer: false }, audio, onBotEliminated);
      }
    }
  }
}
