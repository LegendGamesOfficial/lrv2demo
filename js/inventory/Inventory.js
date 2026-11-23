import { eventBus } from '../core/EventBus.js';

/**
 * Manages the 5-slot hotbar, ammunition reserves, trap counts, and dropping items.
 */
export class Inventory {
  constructor() {
    this.slots = [null, null, null, null, null];
    this.activeSlot = 0;
    this.ammo = { light: 60, medium: 60, shells: 16, heavy: 8 };
    this.traps = { spike_trap: 1, zap_trap: 0, bouncer: 1, launch_pad: 0 };
  }

  reset() {
    this.slots = [null, null, null, null, null];
    this.activeSlot = 0;
    this.ammo = { light: 60, medium: 60, shells: 16, heavy: 8 };
    this.traps = { spike_trap: 1, zap_trap: 0, bouncer: 1, launch_pad: 0 };
    eventBus.emit('inventory:changed', this);
  }

  getActiveItem() {
    return this.slots[this.activeSlot];
  }

  selectSlot(idx) {
    if (idx < 0 || idx > 4) return;
    this.activeSlot = idx;
    eventBus.emit('inventory:changed', this);
  }

  addItem(item) {
    if (!item) return false;
    if (item.category === 'trap') {
      this.traps[item.id] = (this.traps[item.id] || 0) + (item.qty || 1);
      eventBus.emit('inventory:changed', this);
      return true;
    }

    if (item.maxStack) {
      const existing = this.slots.find((s) => s && s.id === item.id && s.qty < item.maxStack);
      if (existing) {
        existing.qty = Math.min(item.maxStack, existing.qty + (item.qty || 1));
        eventBus.emit('inventory:changed', this);
        return true;
      }
    }

    const emptyIdx = this.slots.findIndex((s) => s === null);
    const targetIdx = emptyIdx !== -1 ? emptyIdx : this.activeSlot;
    this.slots[targetIdx] = { ...item };

    if (item.category === 'weapon') {
      const aType = this.getAmmoType(item.id);
      this.ammo[aType] = (this.ammo[aType] || 0) + (item.mag || 15);
    }

    eventBus.emit('inventory:changed', this);
    return true;
  }

  dropSlot(idx) {
    if (idx < 0 || idx > 4) return null;
    const item = this.slots[idx];
    if (!item) return null;
    this.slots[idx] = null;
    eventBus.emit('inventory:changed', this);
    return item;
  }

  consumeActiveOne() {
    const it = this.slots[this.activeSlot];
    if (!it) return;
    it.qty = (it.qty || 1) - 1;
    if (it.qty <= 0) this.slots[this.activeSlot] = null;
    eventBus.emit('inventory:changed', this);
  }

  getAmmoType(weaponId = '') {
    if (weaponId.includes('shotgun')) return 'shells';
    if (weaponId.includes('smg') || weaponId.includes('pistol')) return 'light';
    if (weaponId.includes('sniper')) return 'heavy';
    return 'medium';
  }
}
