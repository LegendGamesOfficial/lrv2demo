import { eventBus } from '../core/EventBus.js';

/**
 * Manages player HP (0-100), Shield (0-100), damage absorption, and healing.
 */
export class PlayerHealth {
  constructor() {
    this.hp = 100;
    this.shield = 0;
    this.maxHp = 100;
    this.maxShield = 100;
    this.alive = true;
  }

  reset() {
    this.hp = 100;
    this.shield = 0;
    this.alive = true;
    eventBus.emit('player:healthChanged', { hp: this.hp, shield: this.shield });
  }

  takeDamage(amount, bypassShield = false) {
    if (!this.alive || amount <= 0) return 0;
    let rem = amount;
    if (!bypassShield && this.shield > 0) {
      const absorbed = Math.min(this.shield, rem);
      this.shield -= absorbed;
      rem -= absorbed;
    }
    this.hp = Math.max(0, this.hp - rem);
    if (this.hp <= 0) {
      this.alive = false;
      eventBus.emit('player:eliminated');
    }
    eventBus.emit('player:healthChanged', { hp: this.hp, shield: this.shield });
    return amount;
  }

  healHp(amount, cap = 100) {
    if (!this.alive || this.hp >= cap) return false;
    this.hp = Math.min(cap, this.hp + amount);
    eventBus.emit('player:healthChanged', { hp: this.hp, shield: this.shield });
    return true;
  }

  addShield(amount, cap = 100) {
    if (!this.alive || this.shield >= cap) return false;
    this.shield = Math.min(cap, this.shield + amount);
    eventBus.emit('player:healthChanged', { hp: this.hp, shield: this.shield });
    return true;
  }
}
