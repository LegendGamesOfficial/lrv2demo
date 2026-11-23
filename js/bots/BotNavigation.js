/**
 * Handles bot steering toward safe zones, strafing in combat, retreating, and terrain height tracking.
 */
export const BotNavigation = {
  moveToward(bot, targetX, targetZ, speed, world, dt) {
    const angle = Math.atan2(targetZ - bot.z, targetX - bot.x);
    bot.dir = angle;
    bot.x += Math.cos(angle) * speed * dt;
    bot.z += Math.sin(angle) * speed * dt;
    bot.y = world.getTerrainHeight(bot.x, bot.z);
  },

  roam(bot, world, dt) {
    if (Math.random() < 0.04) {
      bot.dir += (Math.random() - 0.5) * 2.2;
    }
    bot.x += Math.cos(bot.dir) * 5.2 * dt;
    bot.z += Math.sin(bot.dir) * 5.2 * dt;
    bot.y = world.getTerrainHeight(bot.x, bot.z);
  }
};
