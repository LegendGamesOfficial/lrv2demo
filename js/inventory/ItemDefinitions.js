/**
 * Resolves weapon, consumable, trap, and ammunition definitions from lootpool.json.
 */
export class ItemDefinitions {
  constructor(lootpoolData) {
    this.weapons = (lootpoolData && lootpoolData.weapons) || [];
    this.consumables = (lootpoolData && lootpoolData.consumables) || [];
    this.traps = (lootpoolData && lootpoolData.traps) || [];

    // Ensure Sniper Rifle is available in combat lootpool alongside existing weapons
    if (!this.weapons.some((w) => w.id === 'sniper_rifle')) {
      this.weapons.push({
        id: 'sniper_rifle',
        name: 'Bolt-Action Sniper',
        category: 'weapon',
        rarities: [3, 4, 5],
        damage: [95, 105, 116],
        fireRate: 1.45,
        range: 280,
        mag: 1,
        reloadTime: 2.2,
        spread: 0.004,
        ammoType: 'heavy',
        auto: false
      });
    }
  }

  rollRandomLoot() {
    const roll = Math.random();
    if ((roll < 0.58 || (this.consumables.length === 0 && this.traps.length === 0)) && this.weapons.length > 0) {
      const w = this.weapons[Math.floor(Math.random() * this.weapons.length)];
      const rarity = w.rarities[Math.floor(Math.random() * w.rarities.length)];
      return { ...w, rarity, qty: 1, currentMag: w.mag };
    }
    if (roll < 0.88 && this.consumables.length > 0) {
      const c = this.consumables[Math.floor(Math.random() * this.consumables.length)];
      return { ...c, qty: c.stack || 1 };
    }
    if (this.traps.length > 0) {
      const t = this.traps[Math.floor(Math.random() * this.traps.length)];
      return { ...t, qty: t.stack || 1 };
    }
    const fallback = this.weapons[0];
    return { ...fallback, rarity: fallback.rarities[0], qty: 1, currentMag: fallback.mag };
  }
}
