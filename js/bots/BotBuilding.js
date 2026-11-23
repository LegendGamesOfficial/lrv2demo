/**
 * Places defensive walls using the shared BuildingManager system, avoiding invalid overlaps.
 */
export const BotBuilding = {
  tryBuildCover(bot, threatX, threatZ, buildingManager, bots = []) {
    if (!buildingManager || bot.materials < 10 || bot.buildCooldown > 0) return false;
    if (Math.random() > bot.personality.buildChance) return false;

    const ang = Math.atan2(threatZ - bot.z, threatX - bot.x);
    const wx = bot.x + Math.cos(ang) * 3.4;
    const wz = bot.z + Math.sin(ang) * 3.4;
    const placed = buildingManager.placeBotWall(bot.id, wx, bot.y, wz, -ang + Math.PI / 2, bots);
    if (!placed) return false;

    bot.materials -= 10;
    bot.buildCooldown = 3.5;
    return true;
  }
};
