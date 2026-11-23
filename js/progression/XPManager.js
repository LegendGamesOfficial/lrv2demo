import { Config } from '../core/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Handles XP awards, level-ups (1000 XP/level up to 125), and match XP calculation.
 */
export class XPManager {
  constructor(playerProfile) {
    this.profile = playerProfile;
  }

  calculateMatchXP({ victory, placement, kills }) {
    const placementXP = victory ? 500 : Math.max(50, (100 - placement) * 5);
    const killXP = kills * 120;
    return placementXP + killXP;
  }

  awardXP(amount) {
    const user = this.profile.current;
    if (!user || amount <= 0) return { leveledUp: false, levelsGained: 0 };

    const startLevel = user.level;
    user.xp += amount;
    while (user.xp >= Config.XP_PER_LEVEL && user.level < Config.MAX_LEVEL) {
      user.xp -= Config.XP_PER_LEVEL;
      user.level += 1;
    }
    this.profile.save();
    const levelsGained = user.level - startLevel;
    eventBus.emit('profile:updated', user);
    return { leveledUp: levelsGained > 0, levelsGained };
  }
}
