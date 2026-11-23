import { eventBus } from '../core/EventBus.js';

/**
 * Central coordinator for equipped skins, pickaxe/glider colors, banners, and emotes.
 */
export class CosmeticManager {
  constructor(assetManager, playerProfile) {
    this.assetManager = assetManager;
    this.profile = playerProfile;
  }

  getEquipped(type) {
    const user = this.profile.current;
    if (!user) return null;
    if (type === 'pickaxe') {
      return { id: 'default_pickaxe', name: 'Pickaxe', type: 'pickaxe', color: user.loadout.pickaxeColor || '#64748b', accent: '#f59e0b', style: 'classic' };
    }
    if (type === 'glider') {
      return { id: 'default_glider', name: 'Glider', type: 'glider', color: user.loadout.gliderColor || '#475569', accent: '#eab308', style: 'classic' };
    }
    const id = user.loadout[type];
    return this.assetManager.getItemById(id);
  }

  equipItem(itemId) {
    const user = this.profile.current;
    const item = this.assetManager.getItemById(itemId);
    if (!user || !item) return false;

    if (item.type === 'skin') {
      const seasonSkin = this.assetManager.getSeasonSkinById(itemId);
      if (seasonSkin) {
        if ((user.level || 1) < (seasonSkin.requiredLevel || 1)) return false;
        // Season Shop skins are playable for this season only and NOT saved into ownedItems
        user.loadout.skin = itemId;
        this.profile.save();
        eventBus.emit('cosmetic:equipped', item);
        return true;
      }
      if (!this.profile.ownsItem(itemId)) return false;
      user.loadout.skin = itemId;
      this.profile.save();
      eventBus.emit('cosmetic:equipped', item);
      return true;
    }
    return false;
  }

  setPickaxeColor(color) {
    const user = this.profile.current;
    if (!user || !color) return;
    user.loadout.pickaxeColor = color;
    this.profile.save();
    eventBus.emit('profile:updated', user);
  }

  setGliderColor(color) {
    const user = this.profile.current;
    if (!user || !color) return;
    user.loadout.gliderColor = color;
    this.profile.save();
    eventBus.emit('profile:updated', user);
  }

  setBanner(icon, color) {
    const user = this.profile.current;
    if (!user) return;
    if (icon) user.loadout.bannerIcon = icon;
    if (color) user.loadout.bannerColor = color;
    this.profile.save();
    eventBus.emit('profile:updated', user);
  }
}
