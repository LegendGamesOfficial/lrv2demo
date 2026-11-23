/**
 * Manages character skin queries, ownership checks, and equip/preview selection.
 */
export class SkinManager {
  constructor(assetManager, playerProfile, cosmeticManager) {
    this.assetManager = assetManager;
    this.profile = playerProfile;
    this.cosmeticManager = cosmeticManager;
  }

  getAllSkins() {
    return this.assetManager.data.items.filter((i) => i.type === 'skin');
  }

  getOwnedSkins() {
    return this.getAllSkins().filter((i) => this.profile.ownsItem(i.id));
  }

  equipSkin(skinId) {
    return this.cosmeticManager.equipItem(skinId);
  }
}
