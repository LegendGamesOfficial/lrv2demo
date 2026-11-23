/**
 * Runtime weapon wrapper tracking magazine ammo, reload progress, and fire cooldown.
 */
export class Weapon {
  constructor(def) {
    this.def = def;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
  }

  getDamage() {
    const arr = this.def.damage || [25];
    const idx = Math.min(arr.length - 1, Math.max(0, (this.def.rarity || 1) - 1));
    return arr[idx];
  }

  canFire(slotItem) {
    return !this.reloading && this.cooldown <= 0 && (slotItem.currentMag ?? this.def.mag) > 0;
  }
}
