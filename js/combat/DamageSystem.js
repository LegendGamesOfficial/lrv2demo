import { eventBus } from '../core/EventBus.js';

/**
 * Applies damage to bots, buildings, and the player with headshot multipliers and kill feed events.
 */
export class DamageSystem {
  applyBotDamage(bot, amount, { attackerIsPlayer = false, isHeadshot = false } = {}, audio, onBotEliminated) {
    if (!bot || !bot.alive) return;
    const finalDmg = isHeadshot ? Math.round(amount * 1.5) : Math.round(amount);
    bot.takeDamage(finalDmg);
    if (attackerIsPlayer) audio.sfx.hit();

    if (!bot.alive) {
      if (attackerIsPlayer) audio.sfx.elimination();
      onBotEliminated(bot, attackerIsPlayer);
      eventBus.emit('combat:elimination', {
        victim: bot.name,
        byPlayer: attackerIsPlayer
      });
    }
  }

  applyPlayerDamage(player, amount, audio) {
    if (!player.health.alive) return;
    player.health.takeDamage(amount);
    audio.sfx.damage();
    if (player.animator) player.animator.triggerHit();
  }
}
