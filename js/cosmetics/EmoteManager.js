import { eventBus } from '../core/EventBus.js';

/**
 * Manages the 8-slot emote wheel, equipping, unequipping, and triggering emotes.
 */
export class EmoteManager {
  constructor(assetManager, playerProfile) {
    this.assetManager = assetManager;
    this.profile = playerProfile;
  }

  getOwnedEmotes() {
    return this.assetManager.data.items.filter(
      (i) => i.type === 'emote' && this.profile.ownsItem(i.id)
    );
  }

  getEquippedEmotes() {
    const user = this.profile.current;
    if (!user) return Array(8).fill(null);
    return user.loadout.emotes.map((id) => (id ? this.assetManager.getItemById(id) : null));
  }

  equipEmote(slotIndex, emoteId) {
    const user = this.profile.current;
    if (!user || slotIndex < 0 || slotIndex > 7) return false;
    if (emoteId && !this.profile.ownsItem(emoteId)) return false;
    user.loadout.emotes[slotIndex] = emoteId;
    this.profile.save();
    eventBus.emit('emote:wheelUpdated', user.loadout.emotes);
    return true;
  }

  unequipEmote(slotIndex) {
    return this.equipEmote(slotIndex, null);
  }
}
