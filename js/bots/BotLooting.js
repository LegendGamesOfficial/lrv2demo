/**
 * Allows bots to seek and collect nearby world pickups, equip weapons, and heal when below threshold.
 */
export const BotLooting = {
  findNearestWeapon(bot, pickupManager, maxDist = 90) {
    if (!pickupManager || !pickupManager.pickups) return null;
    let best = null;
    let bestD = maxDist;
    for (const p of pickupManager.pickups) {
      if (!p || !p.item || p.item.category !== 'weapon') continue;
      const d = Math.hypot(p.x - bot.x, p.z - bot.z);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  },

  tryLootNearby(bot, pickupManager, scene) {
    if (!pickupManager) return false;
    const idx = pickupManager.findNearest(bot.x, bot.z, 3.6);
    if (idx === -1) return false;
    const p = pickupManager.pickups[idx];
    if (p.item.category === 'weapon') {
      bot.hasWeapon = true;
      bot.magAmmo = p.item.mag || 30;
      bot.weaponPower = Math.max(bot.weaponPower, 6 + (p.item.rarity || 1) * 1.5);
    } else if (p.item.category === 'heal') {
      bot.heals += 1;
    }
    scene.remove(p.mesh);
    pickupManager.pickups.splice(idx, 1);
    return true;
  },

  tryHeal(bot) {
    if (bot.heals > 0 && bot.hp < 65) {
      bot.heals -= 1;
      bot.hp = Math.min(100, bot.hp + 30);
      return true;
    }
    return false;
  }
};
