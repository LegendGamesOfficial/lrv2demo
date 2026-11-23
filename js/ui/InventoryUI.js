import { Config } from '../core/Config.js';

/**
 * Renders the 5-slot hotbar with rarity borders, ammo counts, and click selection.
 */
export class InventoryUI {
  constructor(hotbarEl) {
    this.hotbarEl = hotbarEl;
  }

  render(inventory, onSelectSlot) {
    if (!this.hotbarEl) return;
    this.hotbarEl.innerHTML = '';

    inventory.slots.forEach((item, idx) => {
      const slot = document.createElement('div');
      const isActive = inventory.activeSlot === idx;
      slot.className = `hotbar-slot ${isActive ? 'active' : ''}`;
      if (item) {
        slot.style.borderColor = isActive ? '#fde047' : (Config.RARITY_COLORS[item.rarity || 1] || '#9ca3af');
      }

      let qtyBadge = '';
      if (item && item.category === 'weapon') {
        qtyBadge = `<span class="hotbar-qty">${item.currentMag ?? item.mag}/${item.mag}</span>`;
      } else if (item && item.qty > 1) {
        qtyBadge = `<span class="hotbar-qty">x${item.qty}</span>`;
      }

      slot.innerHTML = `
        <span class="hotbar-key">${idx + 1}</span>
        <span class="hotbar-name">${item ? item.name : 'Empty'}</span>
        ${qtyBadge}
      `;
      slot.addEventListener('click', () => onSelectSlot(idx));
      this.hotbarEl.appendChild(slot);
    });
  }
}
